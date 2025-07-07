'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Progress from '@/components/ui/progress';
import { 
  Target, 
  Users, 
  Layers, 
  Lightbulb, 
  Award, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface IntelligentAnalysisResultsProps {
  result: {
    projectOverview: {
      purpose: string;
      category: string;
      targetAudience: string;
      keyFeatures: string[];
      businessDomain: string;
    };
    architectureInsights: {
      pattern: string;
      layerStructure: string[];
      designPrinciples: string[];
      scalabilityApproach: string;
    };
    technologyChoices: {
      rationale: Record<string, string>;
      alternatives: Record<string, string[]>;
      tradeoffs: Record<string, string>;
    };
    codeQualityAssessment: {
      testCoverage: 'high' | 'medium' | 'low' | 'none';
      typeSafety: 'strict' | 'moderate' | 'minimal' | 'none';
      documentationQuality: 'excellent' | 'good' | 'basic' | 'poor';
      maintainabilityScore: number;
    };
    maturityLevel: {
      stage: 'prototype' | 'development' | 'production' | 'maintenance';
      indicators: string[];
      recommendations: string[];
    };
  };
}

export default function IntelligentAnalysisResults({ result }: IntelligentAnalysisResultsProps) {
  const { 
    projectOverview, 
    architectureInsights, 
    technologyChoices, 
    codeQualityAssessment, 
    maturityLevel 
  } = result;

  const getQualityColor = (level: string) => {
    switch (level) {
      case 'high':
      case 'strict':
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
      case 'moderate':
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
      case 'minimal':
      case 'basic':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'prototype':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'development':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'production':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'maintenance':
        return <Award className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* プロジェクト概要 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            プロジェクト概要分析
          </CardTitle>
          <CardDescription>AIによる深度分析結果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">プロジェクトの目的</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {projectOverview.purpose}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">分類・領域</h4>
              <div className="flex gap-2">
                <Badge variant="outline">{projectOverview.category}</Badge>
                <Badge variant="outline">{projectOverview.businessDomain}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{projectOverview.targetAudience}</span>
              </div>
            </div>
          </div>
          
          {projectOverview.keyFeatures.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">主要機能</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {projectOverview.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* アーキテクチャ分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-600" />
            アーキテクチャ分析
          </CardTitle>
          <CardDescription>設計パターンと構造分析</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">アーキテクチャパターン</h4>
              <Badge className="bg-green-100 text-green-800">
                {architectureInsights.pattern}
              </Badge>
              
              <h4 className="font-medium text-gray-700 mb-2 mt-4">スケーラビリティ</h4>
              <p className="text-sm text-gray-600">{architectureInsights.scalabilityApproach}</p>
            </div>
            <div>
              {architectureInsights.layerStructure.length > 0 && (
                <>
                  <h4 className="font-medium text-gray-700 mb-2">レイヤー構造</h4>
                  <div className="space-y-1">
                    {architectureInsights.layerStructure.map((layer, index) => (
                      <div key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-blue-200">
                        {layer}
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {architectureInsights.designPrinciples.length > 0 && (
                <>
                  <h4 className="font-medium text-gray-700 mb-2 mt-4">設計原則</h4>
                  <div className="flex flex-wrap gap-1">
                    {architectureInsights.designPrinciples.map((principle, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {principle}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 技術選択の理由 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            技術選択の分析
          </CardTitle>
          <CardDescription>選択理由と代替案の考察</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(technologyChoices.rationale).map(([tech, reason]) => (
            <div key={tech} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800">{tech}</Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-green-700">選択理由: </span>
                  <span className="text-gray-600">{reason}</span>
                </div>
                
                {technologyChoices.alternatives[tech] && (
                  <div>
                    <span className="font-medium text-blue-700">代替案: </span>
                    <span className="text-gray-600">
                      {technologyChoices.alternatives[tech].join(', ')}
                    </span>
                  </div>
                )}
                
                {technologyChoices.tradeoffs[tech] && (
                  <div>
                    <span className="font-medium text-orange-700">トレードオフ: </span>
                    <span className="text-gray-600">{technologyChoices.tradeoffs[tech]}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* コード品質評価 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            コード品質評価
          </CardTitle>
          <CardDescription>品質指標とメンテナビリティ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">テストカバレッジ</span>
                  <Badge className={getQualityColor(codeQualityAssessment.testCoverage)}>
                    {codeQualityAssessment.testCoverage === 'none' ? '未実装' :
                     codeQualityAssessment.testCoverage === 'low' ? '低い' :
                     codeQualityAssessment.testCoverage === 'medium' ? '中程度' : '高い'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">型安全性</span>
                  <Badge className={getQualityColor(codeQualityAssessment.typeSafety)}>
                    {codeQualityAssessment.typeSafety === 'none' ? '未実装' :
                     codeQualityAssessment.typeSafety === 'minimal' ? '最小限' :
                     codeQualityAssessment.typeSafety === 'moderate' ? '中程度' : '厳密'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">ドキュメント品質</span>
                  <Badge className={getQualityColor(codeQualityAssessment.documentationQuality)}>
                    {codeQualityAssessment.documentationQuality === 'poor' ? '不十分' :
                     codeQualityAssessment.documentationQuality === 'basic' ? '基本的' :
                     codeQualityAssessment.documentationQuality === 'good' ? '良好' : '優秀'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">メンテナビリティスコア</span>
                  <span className="text-sm font-bold">{codeQualityAssessment.maintainabilityScore}/100</span>
                </div>
                <Progress 
                  value={codeQualityAssessment.maintainabilityScore} 
                  max={100}
                  size="sm"
                  color="green"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* プロジェクト成熟度 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            プロジェクト成熟度
          </CardTitle>
          <CardDescription>開発段階と改善提案</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {getStageIcon(maturityLevel.stage)}
            <div>
              <span className="font-medium">
                {maturityLevel.stage === 'prototype' ? 'プロトタイプ' :
                 maturityLevel.stage === 'development' ? '開発中' :
                 maturityLevel.stage === 'production' ? 'プロダクション' : 'メンテナンス'}
              </span>
              <span className="text-sm text-gray-600 ml-2">段階</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">現状の指標</h4>
              <div className="space-y-1">
                {maturityLevel.indicators.map((indicator, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-gray-600">{indicator}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {maturityLevel.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">改善提案</h4>
                <div className="space-y-1">
                  {maturityLevel.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      <span className="text-sm text-gray-600">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}