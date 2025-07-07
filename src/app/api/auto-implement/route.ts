import { NextRequest, NextResponse } from 'next/server';
import { SafeAutoImprover } from '@/lib/safe-auto-improver';
import { ImprovementTracker } from '@/lib/improvement-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, beforeAnalysis } = body;
    
    if (!plan) {
      return NextResponse.json(
        { error: '改善計画が必要です' },
        { status: 400 }
      );
    }
    
    const improver = new SafeAutoImprover();
    const tracker = new ImprovementTracker();
    
    // 安全な自動実装の実行
    const implementationResult = await improver.autoImplement(plan);
    
    // 実装後の分析（簡略化）
    let afterAnalysis = null;
    if (implementationResult.success) {
      // 実装成功時のみ事後分析を実行
      // 実際の実装では SelfAnalyzer を再実行
      afterAnalysis = beforeAnalysis; // 簡略化
    }
    
    // 改善効果の追跡
    const metricsId = await tracker.trackImprovement(
      plan,
      implementationResult,
      beforeAnalysis,
      afterAnalysis
    );
    
    return NextResponse.json({ 
      implementationResult,
      metricsId,
      afterAnalysis
    });
  } catch (error) {
    console.error('Auto-implementation error:', error);
    return NextResponse.json(
      { error: '自動実装に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tracker = new ImprovementTracker();
    const summary = await tracker.getMetricsSummary();
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Metrics summary error:', error);
    return NextResponse.json(
      { error: 'メトリクス取得に失敗しました' },
      { status: 500 }
    );
  }
}