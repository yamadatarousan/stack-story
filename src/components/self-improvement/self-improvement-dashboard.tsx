'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  Shield, 
  Gauge,
  RefreshCw,
  Play,
  Pause,
  Settings,
  BarChart3,
  History
} from 'lucide-react';

interface SelfImprovementDashboardProps {
  onStartSelfAnalysis: () => void;
  onImplementImprovement: (planId: string) => void;
}

// Mock data - 実際の実装では API から取得
const mockMetrics = {
  totalImprovements: 23,
  successRate: 0.87,
  averageImpact: 34.5,
  topCategories: [
    { category: 'performance', count: 8, avgImpact: 45.2 },
    { category: 'security', count: 6, avgImpact: 38.7 },
    { category: 'code-quality', count: 5, avgImpact: 28.1 },
    { category: 'ux', count: 4, avgImpact: 41.8 }
  ],
  recentTrends: [
    { metric: 'buildTime', trend: 'improving' as const, averageImprovement: 12.5 },
    { metric: 'bundleSize', trend: 'improving' as const, averageImprovement: 8.3 },
    { metric: 'typeErrors', trend: 'stable' as const, averageImprovement: 0 }
  ]
};

const mockPendingImprovements = [
  {
    id: 'ai-plan-1',
    title: 'React Flow の遅延読み込み最適化',
    category: 'performance',
    impact: 'medium',
    effort: 'small',
    priority: 8,
    estimatedImpact: { performance: 35, userExperience: 25 },
    automatable: true,
    riskLevel: 'low' as const
  },
  {
    id: 'ai-plan-2',
    title: 'TypeScript strict モードの有効化',
    category: 'code-quality',
    impact: 'high',
    effort: 'large',
    priority: 6,
    estimatedImpact: { maintainability: 60, performance: 10 },
    automatable: false,
    riskLevel: 'medium' as const
  },
  {
    id: 'ai-plan-3',
    title: 'セキュリティヘッダーの強化',
    category: 'security',
    impact: 'high',
    effort: 'medium',
    priority: 9,
    estimatedImpact: { security: 70 },
    automatable: true,
    riskLevel: 'low' as const
  }
];

export default function SelfImprovementDashboard({ 
  onStartSelfAnalysis, 
  onImplementImprovement 
}: SelfImprovementDashboardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await onStartSelfAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'code-quality': return <CheckCircle className="w-4 h-4" />;
      case 'ux': return <Gauge className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'text-blue-600 bg-blue-50';
      case 'security': return 'text-red-600 bg-red-50';
      case 'code-quality': return 'text-green-600 bg-green-50';
      case 'ux': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI セルフ改善システム</h2>
            <p className="text-gray-600">アプリケーション自体を分析・改善する循環システム</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoMode(!autoMode)}
            className={autoMode ? 'bg-green-50 text-green-700' : ''}
          >
            {autoMode ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {autoMode ? '自動モード ON' : '自動モード OFF'}
          </Button>
          <Button onClick={handleStartAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bot className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? 'セルフ分析中...' : 'セルフ分析開始'}
          </Button>
        </div>
      </div>

      {/* メトリクス概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">総改善数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalImprovements}</div>
            <p className="text-sm text-gray-600">実装済み改善</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">成功率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(mockMetrics.successRate * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">改善実装成功率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">平均改善効果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              +{mockMetrics.averageImpact.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">メトリクス改善率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">AIの学習状況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Level 3</div>
            <p className="text-sm text-gray-600">自己改善レベル</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value="improvements" onValueChange={() => {}} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="improvements" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI改善提案
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            メトリクス
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            改善履歴
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="improvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI生成改善提案</CardTitle>
              <CardDescription>
                優先度順に並んだ改善提案。自動実装可能な項目には自動適用オプションがあります。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockPendingImprovements.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getCategoryIcon(plan.category)}
                            {plan.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={getCategoryColor(plan.category)}
                            >
                              {plan.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={getRiskColor(plan.riskLevel)}
                            >
                              {plan.riskLevel} risk
                            </Badge>
                            <Badge variant="secondary">
                              優先度: {plan.priority}/10
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {selectedPlan === plan.id && (
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">期待される改善効果</h4>
                              {Object.entries(plan.estimatedImpact).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between text-sm">
                                  <span className="capitalize">{key}:</span>
                                  <span className="font-medium">+{value}%</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">実装詳細</h4>
                              <div className="text-sm space-y-1">
                                <div>工数: {plan.effort}</div>
                                <div>自動化: {plan.automatable ? '可能' : '手動'}</div>
                                <div>影響度: {plan.impact}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-end gap-2">
                            {plan.automatable && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-700 hover:bg-green-100"
                              >
                                <Play className="w-3 h-3 mr-2" />
                                自動実装
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => onImplementImprovement(plan.id)}
                            >
                              詳細確認
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>カテゴリ別改善実績</CardTitle>
                <CardDescription>
                  各改善カテゴリの実施数と平均効果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMetrics.topCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(category.category)}
                        <span className="capitalize font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{category.count}回</div>
                        <div className="text-sm text-gray-600">
                          +{category.avgImpact.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>メトリクストレンド</CardTitle>
                <CardDescription>
                  主要メトリクスの改善傾向
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMetrics.recentTrends.map((trend) => (
                    <div key={trend.metric} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {trend.trend === 'improving' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (trend.trend as string) === 'declining' ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="font-medium">{trend.metric}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          trend.trend === 'improving' ? 'text-green-600' : 
                          (trend.trend as string) === 'declining' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {trend.trend}
                        </div>
                        {trend.averageImprovement !== 0 && (
                          <div className="text-sm text-gray-600">
                            {trend.averageImprovement > 0 ? '+' : ''}{trend.averageImprovement.toFixed(1)}%/月
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>改善実施履歴</CardTitle>
              <CardDescription>
                過去に実施した改善とその効果の記録
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                改善履歴の詳細表示機能は実装予定です
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>セルフ改善設定</CardTitle>
              <CardDescription>
                自動改善の動作設定とリスク許容度の調整
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">自動実装設定</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>低リスク改善の自動実装を許可</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>中リスク改善の自動実装を許可</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" disabled />
                      <span>高リスク改善の自動実装を許可（推奨しません）</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">改善カテゴリ</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>パフォーマンス改善</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>セキュリティ強化</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>コード品質改善</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>新機能追加</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">分析頻度</h4>
                  <select className="w-full p-2 border rounded-md">
                    <option>手動実行のみ</option>
                    <option>1日1回</option>
                    <option selected>週1回</option>
                    <option>月1回</option>
                  </select>
                </div>

                <Button className="w-full">
                  設定を保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}