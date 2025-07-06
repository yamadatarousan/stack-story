import { NextRequest, NextResponse } from 'next/server';
import { generateTechArticle, generateArticleSummary, getDefaultTemplate, articleTemplates } from '@/lib/openai';
import { getAnalysisById } from '@/lib/database-service';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { analysisResult, templateId, type = 'article' } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API is not configured' },
        { status: 503 }
      );
    }

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'Analysis result is required' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'summary') {
      // サマリー生成
      result = await generateArticleSummary(analysisResult);
    } else {
      // 記事生成
      const template = templateId 
        ? articleTemplates.find(t => t.id === templateId) || getDefaultTemplate()
        : getDefaultTemplate();

      result = await generateTechArticle(analysisResult, template);

      // データベースに保存（analysisIdがある場合）
      if (analysisResult.analysisId) {
        try {
          await prisma.article.create({
            data: {
              title: result.title,
              content: result.content,
              markdown: result.markdown,
              published: false,
              analysisId: analysisResult.analysisId,
            },
          });
        } catch (dbError) {
          console.error('Failed to save article to database:', dbError);
          // データベース保存に失敗してもレスポンスは返す
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        generatedAt: new Date().toISOString(),
        type,
        templateId: templateId || 'standard',
        model: 'gpt-4o-mini',
      },
    });

  } catch (error) {
    console.error('Error generating content:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: {
            message: error.message,
            type: 'generation_error',
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: {
          message: 'An unexpected error occurred during content generation',
          type: 'unknown_error',
        }
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'templates') {
      // 利用可能なテンプレート一覧を返す
      return NextResponse.json({
        success: true,
        data: articleTemplates,
        metadata: {
          count: articleTemplates.length,
          default: 'standard',
        },
      });
    }

    if (action === 'status') {
      // OpenAI APIの状態確認
      const isConfigured = !!process.env.OPENAI_API_KEY;
      return NextResponse.json({
        success: true,
        data: {
          configured: isConfigured,
          available: isConfigured,
          models: ['gpt-4o-mini'],
        },
      });
    }

    return NextResponse.json({
      message: 'Stack Story Article Generation API',
      version: '1.0.0',
      endpoints: {
        generate: 'POST /api/generate - Generate article or summary',
        templates: 'GET /api/generate?action=templates - Get available templates',
        status: 'GET /api/generate?action=status - Check API status',
      },
      example: {
        method: 'POST',
        body: {
          analysisResult: 'AnalysisResult object',
          templateId: 'standard|beginner|architecture',
          type: 'article|summary',
        },
      },
    });

  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}