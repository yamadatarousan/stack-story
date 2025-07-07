import { NextRequest, NextResponse } from 'next/server';
import { AIImprovementEngine } from '@/lib/ai-improvement-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisResult, improvementTargets, riskTolerance, timeConstraints } = body;
    
    if (!analysisResult) {
      return NextResponse.json(
        { error: '分析結果が必要です' },
        { status: 400 }
      );
    }
    
    const engine = new AIImprovementEngine();
    const plans = await engine.generateImprovementPlan({
      analysisResult,
      improvementTargets: improvementTargets || ['performance', 'security', 'code-quality'],
      riskTolerance: riskTolerance || 'moderate',
      timeConstraints: timeConstraints || 'weekly'
    });
    
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('AI improvement generation error:', error);
    return NextResponse.json(
      { error: 'AI改善提案の生成に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}