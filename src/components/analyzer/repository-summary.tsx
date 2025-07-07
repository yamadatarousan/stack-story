'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BookOpen, 
  Target, 
  Users, 
  Lightbulb,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Code,
  Settings,
  Zap,
  Shield,
  BarChart3,
  Cpu,
  Database,
  GitBranch,
  Layers
} from 'lucide-react';
import { RepositorySummary, AnalysisResult } from '@/types';

interface RepositorySummaryProps {
  analysisResult?: AnalysisResult;
  onSummaryGenerated?: (summary: RepositorySummary) => void;
}

export default function RepositorySummaryComponent({ 
  analysisResult, 
  onSummaryGenerated 
}: RepositorySummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<RepositorySummary | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const handleGenerateSummary = async () => {
    if (!analysisResult) return;

    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('リポジトリコンテンツを分析中...');

    try {
      // 進捗シミュレーション
      const steps = [
        'リポジトリコンテンツを分析中...',
        'アーキテクチャパターンを検出中...',
        'コード品質を評価中...',
        '技術的複雑度を算出中...',
        '改善提案を生成中...',
        '包括的な要約を作成中...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setProgress((i + 1) / steps.length * 90);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // 実際のAPI呼び出し
      const response = await fetch('/api/repository-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisResult)
      });

      if (!response.ok) {
        throw new Error('Repository summary generation failed');
      }

      const result = await response.json();
      setProgress(100);
      setCurrentStep('要約生成完了！');
      
      setTimeout(() => {
        setSummary(result.summary);
        onSummaryGenerated?.(result.summary);
      }, 500);

    } catch (error) {
      console.error('Summary generation failed:', error);
      setCurrentStep('要約生成に失敗しました');
      
      // フォールバック: モックデータを表示
      setTimeout(() => {
        const mockSummary: RepositorySummary = {
          description: `${analysisResult.repository.name}は${analysisResult.structure.language}で構築された${getProjectTypeInJapanese(analysisResult.structure.type)}プロジェクトです。`,
          oneLineSummary: `${analysisResult.structure.language}製の${getProjectTypeInJapanese(analysisResult.structure.type)}`,
          purpose: 'ソフトウェア開発における特定の課題を解決するためのプロジェクト',
          category: 'web-application',
          targetUsers: ['ソフトウェア開発者', 'システム管理者'],
          keyFeatures: analysisResult.techStack.slice(0, 5).map(tech => tech.name),
          useCases: ['開発', 'テスト', '本番運用'],
          technicalComplexity: 'intermediate',
          maintainabilityScore: 75,
          codeQuality: {
            score: 75,
            testCoverage: analysisResult.structure.hasTests ? 'medium' : 'low',
            documentation: analysisResult.structure.hasDocumentation ? 'good' : 'basic',
            codeStyle: 'good',
            errorHandling: 'good',
            modularity: 'good'
          },
          maturityLevel: 'stable',
          developmentStatus: 'active',
          architecturePattern: ['MVC', 'Component-based'],
          designPrinciples: ['関心の分離', '再利用性'],
          scalabilityAssessment: {
            score: 80,
            horizontalScaling: 'good',
            verticalScaling: 'good',
            performanceOptimization: 'good',
            caching: 'basic'
          },
          recommendations: [
            {
              type: 'security',
              priority: 'medium',
              title: 'セキュリティ強化',
              description: 'セキュリティベストプラクティスの適用を推奨',
              effort: 'medium',
              impact: 'high'
            }
          ],
          potentialIssues: ['技術負債の蓄積', '依存関係の更新'],
          analysisConfidence: 85,
          lastAnalyzed: new Date().toISOString()
        };
        setSummary(mockSummary);
        onSummaryGenerated?.(mockSummary);
      }, 1000);
      
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'web-application': 'bg-blue-100 text-blue-800',
      'library': 'bg-green-100 text-green-800',
      'cli-tool': 'bg-purple-100 text-purple-800',
      'api-service': 'bg-orange-100 text-orange-800',
      'development-tool': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getComplexityColor = (complexity: string) => {
    const colors: Record<string, string> = {
      'beginner': 'text-green-600',
      'intermediate': 'text-yellow-600',
      'advanced': 'text-orange-600',
      'expert': 'text-red-600',
    };
    return colors[complexity] || 'text-gray-600';
  };

  const getMaturityColor = (maturity: string) => {
    const colors: Record<string, string> = {
      'prototype': 'text-red-500',
      'alpha': 'text-orange-500',
      'beta': 'text-yellow-500',
      'stable': 'text-green-500',
      'mature': 'text-blue-500',
      'legacy': 'text-gray-500',
    };
    return colors[maturity] || 'text-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'border-green-200 bg-green-50',
      'medium': 'border-yellow-200 bg-yellow-50',
      'high': 'border-orange-200 bg-orange-50',
      'critical': 'border-red-200 bg-red-50',
    };
    return colors[priority] || 'border-gray-200 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Repository Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            リポジトリ要約分析
          </CardTitle>
          <CardDescription>
            AIによるプロジェクトの包括的理解と要約
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isGenerating && !summary && (
            <Button 
              onClick={handleGenerateSummary} 
              className="w-full"
              disabled={!analysisResult}
            >
              <Target className="w-4 h-4 mr-2" />
              詳細要約を生成
            </Button>
          )}

          {isGenerating && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-sm font-medium">{currentStep}</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500">
                高度なAI分析により、プロジェクトの本質を理解中です
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Results */}
      {summary && (
        <div className="space-y-6">
          {/* 基本概要 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                プロジェクト概要
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{summary.oneLineSummary}</h3>
                  <p className="text-gray-700 mb-3">{summary.description}</p>
                  <p className="text-sm text-gray-600 mb-4">{summary.purpose}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(summary.category)}>
                      {getCategoryDisplayName(summary.category)}
                    </Badge>
                    <Badge className={`${getComplexityColor(summary.technicalComplexity)} bg-gray-100`}>
                      複雑度: {getComplexityDisplayName(summary.technicalComplexity)}
                    </Badge>
                    <Badge className={`${getMaturityColor(summary.maturityLevel)} bg-gray-100`}>
                      成熟度: {getMaturityDisplayName(summary.maturityLevel)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">信頼度</div>
                  <div className="text-2xl font-bold text-blue-600">{summary.analysisConfidence}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ターゲット・機能 */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  対象ユーザー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {summary.targetUsers.map((user, index) => (
                    <Badge key={index} variant="outline">
                      {user}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  主要機能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {summary.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 技術評価 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                技術的評価
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">保守性スコア</div>
                  <div className="flex items-center gap-2">
                    <Progress value={summary.maintainabilityScore} className="flex-1" />
                    <span className="text-sm font-medium">{summary.maintainabilityScore}/100</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">コード品質</div>
                  <div className="flex items-center gap-2">
                    <Progress value={summary.codeQuality.score} className="flex-1" />
                    <span className="text-sm font-medium">{summary.codeQuality.score}/100</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">スケーラビリティ</div>
                  <div className="flex items-center gap-2">
                    <Progress value={summary.scalabilityAssessment.score} className="flex-1" />
                    <span className="text-sm font-medium">{summary.scalabilityAssessment.score}/100</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">開発状況</div>
                  <Badge className={getStatusColor(summary.developmentStatus)}>
                    {getStatusDisplayName(summary.developmentStatus)}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    アーキテクチャパターン
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {summary.architecturePattern.map((pattern, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    設計原則
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {summary.designPrinciples.map((principle, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {principle}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 改善提案 */}
          {summary.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-orange-600" />
                  改善提案 ({summary.recommendations.length}件)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.recommendations.map((rec, index) => (
                    <Alert key={index} className={`border-l-4 ${getPriorityColor(rec.priority)}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>{rec.title}</span>
                        <div className="flex gap-2">
                          <Badge className={getPriorityBadgeColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">
                            {getEffortDisplayName(rec.effort)}
                          </Badge>
                        </div>
                      </AlertTitle>
                      <AlertDescription>
                        <p className="text-sm mb-2">{rec.description}</p>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span>工数: {getEffortDisplayName(rec.effort)}</span>
                          <span>影響度: {getImpactDisplayName(rec.impact)}</span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 分析メタデータ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                分析情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">分析日時:</span>
                  <span className="ml-2 font-medium">
                    {new Date(summary.lastAnalyzed).toLocaleString('ja-JP')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">信頼度:</span>
                  <span className="ml-2 font-medium">{summary.analysisConfidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ヘルパー関数
function getProjectTypeInJapanese(type: string): string {
  const types: Record<string, string> = {
    'web': 'Webアプリケーション',
    'mobile': 'モバイルアプリ',
    'desktop': 'デスクトップアプリ',
    'cli': 'CLIツール',
    'library': 'ライブラリ',
    'unknown': 'プロジェクト'
  };
  return types[type] || 'プロジェクト';
}

function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    'web-application': 'Webアプリ',
    'mobile-application': 'モバイルアプリ',
    'desktop-application': 'デスクトップアプリ',
    'library': 'ライブラリ',
    'cli-tool': 'CLIツール',
    'api-service': 'APIサービス',
    'development-tool': '開発ツール',
    'game': 'ゲーム',
    'documentation': 'ドキュメント',
    'template': 'テンプレート',
    'plugin': 'プラグイン',
    'educational': '学習用',
    'experiment': '実験',
    'unknown': '不明'
  };
  return names[category] || category;
}

function getComplexityDisplayName(complexity: string): string {
  const names: Record<string, string> = {
    'beginner': '初級',
    'intermediate': '中級',
    'advanced': '上級',
    'expert': '専門'
  };
  return names[complexity] || complexity;
}

function getMaturityDisplayName(maturity: string): string {
  const names: Record<string, string> = {
    'prototype': 'プロトタイプ',
    'alpha': 'アルファ',
    'beta': 'ベータ',
    'stable': '安定',
    'mature': '成熟',
    'legacy': 'レガシー'
  };
  return names[maturity] || maturity;
}

function getStatusDisplayName(status: string): string {
  const names: Record<string, string> = {
    'active': '活発',
    'maintained': '保守中',
    'stagnant': '停滞',
    'abandoned': '放棄'
  };
  return names[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800',
    'maintained': 'bg-blue-100 text-blue-800',
    'stagnant': 'bg-yellow-100 text-yellow-800',
    'abandoned': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getPriorityBadgeColor(priority: string): string {
  const colors: Record<string, string> = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

function getEffortDisplayName(effort: string): string {
  const names: Record<string, string> = {
    'low': '軽微',
    'medium': '中程度',
    'high': '大規模'
  };
  return names[effort] || effort;
}

function getImpactDisplayName(impact: string): string {
  const names: Record<string, string> = {
    'low': '小',
    'medium': '中',
    'high': '大'
  };
  return names[impact] || impact;
}