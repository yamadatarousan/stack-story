import { NextRequest, NextResponse } from 'next/server';
import { SelfAnalyzer } from '@/lib/self-analyzer';

export async function POST(request: NextRequest) {
  try {
    const analyzer = new SelfAnalyzer();
    const result = await analyzer.performSelfAnalysis();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Self-analysis error:', error);
    return NextResponse.json(
      { error: 'セルフ分析に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'セルフ分析API',
    endpoints: {
      'POST /api/self-analyze': 'セルフ分析の実行',
      'POST /api/ai-improve': 'AI改善提案の生成',
      'POST /api/auto-implement': '自動改善の実行'
    }
  });
}