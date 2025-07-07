import { NextRequest, NextResponse } from 'next/server';
import { RepositoryImprover } from '@/lib/repository-improver';
import { AnalysisResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { analysisResult }: { analysisResult: AnalysisResult } = await request.json();

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'Analysis result is required' },
        { status: 400 }
      );
    }

    console.log('🔧 Generating repository improvements for:', analysisResult.repository.name);

    const improver = new RepositoryImprover();
    const improvementPlan = await improver.generateImprovementPlan(analysisResult);

    console.log('✅ Repository improvement plan generated successfully');

    return NextResponse.json({ 
      success: true, 
      improvementPlan 
    });

  } catch (error) {
    console.error('❌ Repository improvement generation failed:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to generate repository improvements',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while generating repository improvements' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Repository Improvements API',
    description: 'Generate AI-powered improvement suggestions for GitHub repositories',
    endpoints: {
      'POST /api/repository-improvements': 'Generate improvement plan for a repository'
    }
  });
}