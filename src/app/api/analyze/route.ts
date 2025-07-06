import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubUrl, getRepository, getConfigFiles, getFileStructure, getRateLimit } from '@/lib/github';
import { performFullAnalysis } from '@/lib/analyzer';
import { AnalysisError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // GitHub URLをパース
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    // 0. レート制限をチェック
    console.log('Checking GitHub API rate limit...');
    const rateLimit = await getRateLimit();
    if (rateLimit && rateLimit.rate.remaining < 10) {
      return NextResponse.json(
        { 
          error: {
            message: 'GitHub API rate limit exceeded. Please try again later.',
            details: `Remaining: ${rateLimit.rate.remaining}, Reset: ${new Date(rateLimit.rate.reset * 1000)}`
          }
        },
        { status: 429 }
      );
    }
    console.log('Rate limit OK, remaining:', rateLimit?.rate.remaining || 'unknown');

    // 1. リポジトリ情報を取得
    let repository;
    try {
      repository = await getRepository(owner, repo);
    } catch (error) {
      const analysisError: AnalysisError = {
        message: 'Failed to fetch repository information',
        status: 404,
        phase: 'github-fetch',
        repository: `${owner}/${repo}`,
        details: error,
      };
      return NextResponse.json({ error: analysisError }, { status: 404 });
    }

    // 2. 設定ファイルを取得
    let configFiles;
    try {
      configFiles = await getConfigFiles(owner, repo);
    } catch (error) {
      const analysisError: AnalysisError = {
        message: 'Failed to fetch configuration files',
        status: 500,
        phase: 'file-analysis',
        repository: `${owner}/${repo}`,
        details: error,
      };
      return NextResponse.json({ error: analysisError }, { status: 500 });
    }

    // 3. ファイル構造を取得
    let fileStructure;
    try {
      fileStructure = await getFileStructure(owner, repo, '', 2);
    } catch (error) {
      const analysisError: AnalysisError = {
        message: 'Failed to fetch file structure',
        status: 500,
        phase: 'file-analysis',
        repository: `${owner}/${repo}`,
        details: error,
      };
      return NextResponse.json({ error: analysisError }, { status: 500 });
    }

    // 4. 完全な解析を実行
    let analysis;
    try {
      analysis = await performFullAnalysis(repository, configFiles, fileStructure);
    } catch (error) {
      const analysisError: AnalysisError = {
        message: 'Failed to perform analysis',
        status: 500,
        phase: 'dependency-resolution',
        repository: `${owner}/${repo}`,
        details: error,
      };
      return NextResponse.json({ error: analysisError }, { status: 500 });
    }

    // 5. データベースに保存（オプション）
    let savedData;
    try {
      // データベースが利用可能な場合のみ保存を試行
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('dummy')) {
        const { saveAnalysisResult } = await import('@/lib/database-service');
        savedData = await saveAnalysisResult(analysis);
      }
    } catch (error) {
      console.error('Failed to save analysis to database:', error);
      // データベース保存に失敗してもレスポンスは返す
    }

    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        owner,
        repo,
        analysisVersion: '1.0.0',
        saved: !!savedData,
        analysisId: savedData?.analysis?.id,
      },
    });

  } catch (error) {
    console.error('Unexpected error in analysis:', error);
    
    const analysisError: AnalysisError = {
      message: 'An unexpected error occurred during analysis',
      status: 500,
      phase: 'ai-processing',
      details: error,
    };

    return NextResponse.json({ error: analysisError }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stack Story Analysis API',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze - Analyze a GitHub repository',
    },
    example: {
      method: 'POST',
      body: {
        url: 'https://github.com/owner/repo',
      },
    },
  });
}