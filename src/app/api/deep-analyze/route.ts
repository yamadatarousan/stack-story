import { NextRequest, NextResponse } from 'next/server';
import { DeepContentAnalyzer } from '@/lib/deep-content-analyzer';
import { AnalysisResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { analysisResult, githubToken }: { 
      analysisResult: AnalysisResult;
      githubToken?: string;
    } = await request.json();

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'Analysis result is required' },
        { status: 400 }
      );
    }

    console.log('🔍 深層コンテンツ分析を開始:', analysisResult.repository.name);

    const analyzer = new DeepContentAnalyzer(githubToken);
    const deepContentAnalysis = await analyzer.analyzeDeepContent(analysisResult);

    console.log('✅ 深層コンテンツ分析完了');

    return NextResponse.json({ 
      success: true, 
      deepContentAnalysis 
    });

  } catch (error) {
    console.error('❌ 深層コンテンツ分析失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to perform deep content analysis',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred during deep content analysis' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Deep Content Analysis API',
    description: 'Performs comprehensive analysis of repository content including README, package.json, code structure, and quality metrics',
    endpoints: {
      'POST /api/deep-analyze': 'Perform deep content analysis on a repository'
    },
    parameters: {
      analysisResult: 'AnalysisResult object from initial repository analysis',
      githubToken: 'GitHub personal access token (optional, improves rate limits)'
    },
    features: [
      'README.md content analysis and quality assessment',
      'package.json dependency analysis and security audit',
      'Code structure and architecture pattern detection',
      'Technical debt identification and prioritization',
      'Quality metrics calculation and code smell detection',
      'Performance bottleneck identification',
      'Security vulnerability assessment'
    ]
  });
}