import { NextRequest, NextResponse } from 'next/server';
import { repositorySummaryEngine } from '@/lib/repository-summary-engine';
import { AnalysisResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const analysisResult: AnalysisResult = await request.json();
    
    if (!analysisResult || !analysisResult.repository) {
      console.error('Invalid analysis result:', { hasAnalysisResult: !!analysisResult, hasRepository: !!analysisResult?.repository });
      return NextResponse.json(
        { error: 'Invalid analysis result provided' },
        { status: 400 }
      );
    }

    console.log('🔍 Repository summary generation started for:', analysisResult.repository.name);
    console.log('📊 Analysis data:', {
      techStack: analysisResult.techStack?.length || 0,
      dependencies: analysisResult.dependencies?.length || 0,
      structure: Object.keys(analysisResult.structure || {}).length
    });

    // リポジトリ要約を生成
    const summary = await repositorySummaryEngine.generateRepositorySummary(analysisResult);
    
    console.log('✅ Repository summary generated successfully');
    console.log('📋 Summary details:', {
      category: summary.category,
      complexity: summary.technicalComplexity,
      confidence: summary.analysisConfidence
    });
    
    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Repository summary generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Repository summary generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET エンドポイント（テスト用）
export async function GET() {
  return NextResponse.json({
    message: 'Repository Summary API',
    endpoints: {
      'POST /': 'Generate repository summary from analysis result'
    }
  });
}