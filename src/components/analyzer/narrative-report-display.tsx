'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  AlertTriangle, 
  Target, 
  Shield, 
  Zap, 
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface NarrativeReport {
  executiveSummary: string;
  projectOverview: string;
  codeQualityAnalysis: string;
  architectureAnalysis: string;
  technologyAnalysis: string;
  securityAnalysis: string;
  performanceAnalysis: string;
  improvementRecommendations: string;
  prioritizedActionPlan: string;
  riskAssessment: string;
  modernizationRoadmap: string;
}

interface NarrativeReportDisplayProps {
  report: NarrativeReport;
  onClose?: () => void;
}

export default function NarrativeReportDisplay({ report, onClose }: NarrativeReportDisplayProps) {
  const [activeTab, setActiveTab] = useState('executive');

  const reportSections = [
    {
      id: 'executive',
      title: 'エグゼクティブサマリー',
      icon: BarChart3,
      content: report.executiveSummary,
      description: 'プロジェクト全体の概要と重要な指標',
    },
    {
      id: 'overview',
      title: 'プロジェクト概要',
      icon: FileText,
      content: report.projectOverview,
      description: 'プロジェクトの構造と開発環境の評価',
    },
    {
      id: 'quality',
      title: 'コード品質分析',
      icon: CheckCircle,
      content: report.codeQualityAnalysis,
      description: '関数複雑度、結合度、品質問題の詳細分析',
    },
    {
      id: 'architecture',
      title: 'アーキテクチャ分析',
      icon: Target,
      content: report.architectureAnalysis,
      description: '設計構造、責務分離、モジュール評価',
    },
    {
      id: 'technology',
      title: '技術スタック分析',
      icon: TrendingUp,
      content: report.technologyAnalysis,
      description: '技術選択の妥当性とAPI設計評価',
    },
    {
      id: 'security',
      title: 'セキュリティ分析',
      icon: Shield,
      content: report.securityAnalysis,
      description: '脆弱性とセキュリティリスクの評価',
    },
    {
      id: 'performance',
      title: 'パフォーマンス分析',
      icon: Zap,
      content: report.performanceAnalysis,
      description: '性能問題と最適化の機会',
    },
    {
      id: 'recommendations',
      title: '改善提案',
      icon: TrendingUp,
      content: report.improvementRecommendations,
      description: '具体的な改善手順と期待効果',
    },
    {
      id: 'action-plan',
      title: 'アクションプラン',
      icon: Clock,
      content: report.prioritizedActionPlan,
      description: '優先順位付きの実装スケジュール',
    },
    {
      id: 'risk',
      title: 'リスク評価',
      icon: AlertTriangle,
      content: report.riskAssessment,
      description: 'セキュリティと事業継続性のリスク',
    },
    {
      id: 'roadmap',
      title: 'モダナイゼーション',
      icon: Target,
      content: report.modernizationRoadmap,
      description: '技術的近代化の段階的計画',
    },
  ];

  const formatMarkdownContent = (content: string) => {
    // 簡単なMarkdown形式の変換
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-6">$1</h1>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(.+)$/gm, '<p class="mb-4">$1</p>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/(<li.*>.*<\/li>\s*)+/g, '<ul class="mb-4 space-y-1">$&</ul>')
      .replace(/✅/g, '<span class="text-green-600">✅</span>')
      .replace(/⚠️/g, '<span class="text-yellow-600">⚠️</span>')
      .replace(/🔴/g, '<span class="text-red-600">🔴</span>')
      .replace(/🟡/g, '<span class="text-yellow-600">🟡</span>')
      .replace(/🟢/g, '<span class="text-green-600">🟢</span>')
      .replace(/📋/g, '<span class="text-blue-600">📋</span>')
      .replace(/📝/g, '<span class="text-gray-600">📝</span>')
      .replace(/🚨/g, '<span class="text-red-600">🚨</span>')
      .replace(/🎯/g, '<span class="text-purple-600">🎯</span>');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">詳細分析レポート</h2>
            <p className="text-gray-600">プロジェクトの包括的な分析結果と改善提案</p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            戻る
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
            {reportSections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-1 text-xs"
                  title={section.description}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{section.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {reportSections.map((section) => {
          const Icon = section.icon;
          return (
            <TabsContent key={section.id} value={section.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div 
                      className="prose prose-sm max-w-none space-y-4"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMarkdownContent(section.content) 
                      }}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          AI生成レポート
        </Badge>
        <span className="text-sm text-gray-600">
          このレポートはプロジェクトの詳細分析に基づいて自動生成されました
        </span>
      </div>
    </div>
  );
}