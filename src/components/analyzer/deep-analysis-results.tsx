'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Progress from '@/components/ui/progress';
import { 
  Code2, 
  Database, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Target,
  Lightbulb,
  Layers,
  Zap,
  Workflow,
  BarChart3
} from 'lucide-react';

interface DeepAnalysisResultsProps {
  result: {
    codeStructure: {
      functions: Array<{
        name: string;
        file: string;
        lineCount: number;
        complexity: number;
        isAsync: boolean;
        parameters: string[];
        dependencies: string[];
      }>;
      classes: Array<{
        name: string;
        file: string;
        methods: string[];
        properties: string[];
        responsibilities: string[];
      }>;
      modules: Array<{
        name: string;
        file: string;
        exports: string[];
        imports: string[];
        purpose: string;
        coupling: number;
      }>;
    };
    businessLogic: {
      domains: Array<{
        name: string;
        entities: string[];
        operations: string[];
        dataFlow: string[];
        businessRules: string[];
      }>;
      workflows: Array<{
        name: string;
        steps: string[];
        triggers: string[];
        outputs: string[];
        complexity: 'simple' | 'moderate' | 'complex';
      }>;
      dataModels: Array<{
        entity: string;
        fields: string[];
        relationships: string[];
        validations: string[];
        file: string;
      }>;
    };
    apiAnalysis: {
      endpoints: Array<{
        path: string;
        method: string;
        purpose: string;
        middleware: string[];
        file: string;
      }>;
      database: {
        type: string;
        schema: {
          tables: string[];
          relationships: string[];
          indexes: string[];
        };
      };
      integrations: Array<{
        service: string;
        type: string;
        usage: string[];
      }>;
    };
    qualityIssues: {
      codeSmells: Array<{
        type: string;
        description: string;
        file: string;
        line: number;
        severity: 'low' | 'medium' | 'high';
        suggestion: string;
      }>;
      performanceIssues: Array<{
        type: string;
        description: string;
        file: string;
        impact: string;
        solution: string;
      }>;
      securityVulnerabilities: Array<{
        type: string;
        description: string;
        file: string;
        risk: 'low' | 'medium' | 'high' | 'critical';
        mitigation: string;
      }>;
      technicalDebt: Array<{
        category: string;
        description: string;
        estimatedEffort: string;
        businessImpact: string;
      }>;
    };
    competitiveAnalysis: {
      industryComparison: Array<{
        category: string;
        standardApproach: string;
        projectApproach: string;
        assessment: 'behind' | 'standard' | 'advanced';
        recommendations: string[];
      }>;
      modernizationNeeds: Array<{
        area: string;
        currentState: string;
        recommendedState: string;
        effort: 'low' | 'medium' | 'high';
        priority: 'low' | 'medium' | 'high';
      }>;
    };
    insights: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    actionableRecommendations: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
  };
}

export default function DeepAnalysisResults({ result }: DeepAnalysisResultsProps) {
  const { 
    codeStructure, 
    businessLogic, 
    apiAnalysis, 
    qualityIssues, 
    competitiveAnalysis,
    insights,
    actionableRecommendations 
  } = result;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case 'advanced':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'standard':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'behind':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const averageComplexity = codeStructure.functions.length > 0 
    ? codeStructure.functions.reduce((sum, f) => sum + f.complexity, 0) / codeStructure.functions.length 
    : 0;

  const averageCoupling = codeStructure.modules.length > 0
    ? codeStructure.modules.reduce((sum, m) => sum + m.coupling, 0) / codeStructure.modules.length
    : 0;

  return (
    <div className="space-y-6">
      {/* コード構造分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            コード構造詳細分析
          </CardTitle>
          <CardDescription>関数・クラス・モジュールの詳細解析</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* メトリクス概要 */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{codeStructure.functions.length}</div>
              <div className="text-sm text-gray-600">関数数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{codeStructure.classes.length}</div>
              <div className="text-sm text-gray-600">クラス数</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{averageComplexity.toFixed(1)}</div>
              <div className="text-sm text-gray-600">平均複雑度</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{averageCoupling.toFixed(1)}</div>
              <div className="text-sm text-gray-600">平均結合度</div>
            </div>
          </div>

          {/* 複雑な関数 */}
          {codeStructure.functions.filter(f => f.complexity > 5).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">高複雑度関数（要リファクタリング）</h4>
              <div className="space-y-2">
                {codeStructure.functions
                  .filter(f => f.complexity > 5)
                  .sort((a, b) => b.complexity - a.complexity)
                  .slice(0, 5)
                  .map((func, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{func.name}</div>
                        <div className="text-sm text-gray-600">{func.file}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={func.complexity > 10 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                          複雑度: {func.complexity}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">{func.lineCount}行</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* クラス責務分析 */}
          {codeStructure.classes.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">クラス責務分析</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {codeStructure.classes.slice(0, 6).map((cls, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-medium mb-2">{cls.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{cls.file}</div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">責務:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cls.responsibilities.map((resp, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{resp}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        メソッド: {cls.methods.length}個 | プロパティ: {cls.properties.length}個
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API・データフロー分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            API・データフロー分析
          </CardTitle>
          <CardDescription>エンドポイント、データベース、外部連携の詳細</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API エンドポイント */}
          {apiAnalysis.endpoints.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">API エンドポイント ({apiAnalysis.endpoints.length}個)</h4>
              <div className="space-y-2">
                {apiAnalysis.endpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                          endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                          endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {endpoint.method}
                        </Badge>
                        <span className="font-mono text-sm">{endpoint.path}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{endpoint.purpose}</div>
                      {endpoint.middleware.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ミドルウェア: {endpoint.middleware.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{endpoint.file}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* データベース情報 */}
          {apiAnalysis.database.type !== '不明' && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">データベース構成</h4>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-purple-100 text-purple-800">{apiAnalysis.database.type}</Badge>
                  <span className="text-sm text-gray-600">
                    {apiAnalysis.database.schema.tables.length}個のテーブル
                  </span>
                </div>
                {apiAnalysis.database.schema.tables.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">テーブル一覧:</div>
                    <div className="flex flex-wrap gap-2">
                      {apiAnalysis.database.schema.tables.map((table, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{table}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 外部サービス連携 */}
          {apiAnalysis.integrations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">外部サービス連携</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {apiAnalysis.integrations.map((integration, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium">{integration.service}</div>
                      <Badge variant="outline" className="text-xs">{integration.type}</Badge>
                    </div>
                    <div className="space-y-1">
                      {integration.usage.map((usage, i) => (
                        <div key={i} className="text-sm text-gray-600">• {usage}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 品質問題・セキュリティ分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            品質・セキュリティ分析
          </CardTitle>
          <CardDescription>コード品質問題、パフォーマンス、セキュリティ脆弱性</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 問題概要 */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{qualityIssues.codeSmells.length}</div>
              <div className="text-sm text-gray-600">コードスメル</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{qualityIssues.performanceIssues.length}</div>
              <div className="text-sm text-gray-600">パフォーマンス</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{qualityIssues.securityVulnerabilities.length}</div>
              <div className="text-sm text-gray-600">セキュリティ</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{qualityIssues.technicalDebt.length}</div>
              <div className="text-sm text-gray-600">技術的負債</div>
            </div>
          </div>

          {/* 高優先度の問題 */}
          {(qualityIssues.securityVulnerabilities.filter(v => v.risk === 'critical' || v.risk === 'high').length > 0 ||
            qualityIssues.codeSmells.filter(cs => cs.severity === 'high').length > 0) && (
            <div>
              <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                緊急対応が必要な問題
              </h4>
              <div className="space-y-2">
                {qualityIssues.securityVulnerabilities
                  .filter(v => v.risk === 'critical' || v.risk === 'high')
                  .map((vuln, index) => (
                    <div key={`sec-${index}`} className="p-3 border-l-4 border-red-500 bg-red-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-red-100 text-red-800">{vuln.type}</Badge>
                        <Badge className={getSeverityColor(vuln.risk)}>{vuln.risk}</Badge>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">{vuln.description}</div>
                      <div className="text-xs text-gray-600">対策: {vuln.mitigation}</div>
                      <div className="text-xs text-gray-500 mt-1">{vuln.file}</div>
                    </div>
                  ))}
                
                {qualityIssues.codeSmells
                  .filter(cs => cs.severity === 'high')
                  .slice(0, 3)
                  .map((smell, index) => (
                    <div key={`smell-${index}`} className="p-3 border-l-4 border-orange-500 bg-orange-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-orange-100 text-orange-800">{smell.type}</Badge>
                        <span className="text-xs text-gray-500">行 {smell.line}</span>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">{smell.description}</div>
                      <div className="text-xs text-gray-600">提案: {smell.suggestion}</div>
                      <div className="text-xs text-gray-500 mt-1">{smell.file}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* パフォーマンス問題 */}
          {qualityIssues.performanceIssues.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">パフォーマンス改善ポイント</h4>
              <div className="space-y-2">
                {qualityIssues.performanceIssues.slice(0, 3).map((issue, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-100 text-blue-800">{issue.type}</Badge>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">{issue.description}</div>
                    <div className="text-xs text-gray-600 mb-1">影響: {issue.impact}</div>
                    <div className="text-xs text-green-600">解決策: {issue.solution}</div>
                    <div className="text-xs text-gray-500 mt-1">{issue.file}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 競合・業界分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            競合・業界標準との比較
          </CardTitle>
          <CardDescription>業界標準との技術比較とモダナイゼーション提案</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 業界比較 */}
          {competitiveAnalysis.industryComparison.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">技術スタック評価</h4>
              <div className="space-y-4">
                {competitiveAnalysis.industryComparison.map((comparison, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="font-medium">{comparison.category}</div>
                      <Badge className={getAssessmentColor(comparison.assessment)}>
                        {comparison.assessment === 'advanced' ? '業界先進' :
                         comparison.assessment === 'standard' ? '業界標準' : '改善余地'}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">業界標準</div>
                        <div className="text-sm text-gray-700">{comparison.standardApproach}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">現在の実装</div>
                        <div className="text-sm text-gray-700">{comparison.projectApproach}</div>
                      </div>
                    </div>
                    
                    {comparison.recommendations.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-2">改善提案</div>
                        <div className="space-y-1">
                          {comparison.recommendations.map((rec, i) => (
                            <div key={i} className="text-sm text-blue-600 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* モダナイゼーション提案 */}
          {competitiveAnalysis.modernizationNeeds.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">モダナイゼーション提案</h4>
              <div className="space-y-3">
                {competitiveAnalysis.modernizationNeeds.map((need, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{need.area}</div>
                      <div className="flex gap-2">
                        <Badge className={
                          need.priority === 'high' ? 'bg-red-100 text-red-800' :
                          need.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }>
                          優先度: {need.priority}
                        </Badge>
                        <Badge variant="outline">
                          工数: {need.effort}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {need.currentState} → {need.recommendedState}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SWOT分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            SWOT分析
          </CardTitle>
          <CardDescription>強み・弱み・機会・脅威の総合評価</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 強み・機会 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  強み (Strengths)
                </h4>
                <div className="space-y-2">
                  {insights.strengths.map((strength, index) => (
                    <div key={index} className="text-sm text-gray-700 p-2 bg-green-50 rounded">
                      • {strength}
                    </div>
                  ))}
                  {insights.strengths.length === 0 && (
                    <div className="text-sm text-gray-500 italic">明確な強みが検出されませんでした</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  機会 (Opportunities)
                </h4>
                <div className="space-y-2">
                  {insights.opportunities.map((opportunity, index) => (
                    <div key={index} className="text-sm text-gray-700 p-2 bg-blue-50 rounded">
                      • {opportunity}
                    </div>
                  ))}
                  {insights.opportunities.length === 0 && (
                    <div className="text-sm text-gray-500 italic">改善機会が検出されませんでした</div>
                  )}
                </div>
              </div>
            </div>

            {/* 弱み・脅威 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  弱み (Weaknesses)
                </h4>
                <div className="space-y-2">
                  {insights.weaknesses.map((weakness, index) => (
                    <div key={index} className="text-sm text-gray-700 p-2 bg-orange-50 rounded">
                      • {weakness}
                    </div>
                  ))}
                  {insights.weaknesses.length === 0 && (
                    <div className="text-sm text-gray-500 italic">重大な弱みが検出されませんでした</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  脅威 (Threats)
                </h4>
                <div className="space-y-2">
                  {insights.threats.map((threat, index) => (
                    <div key={index} className="text-sm text-gray-700 p-2 bg-red-50 rounded">
                      • {threat}
                    </div>
                  ))}
                  {insights.threats.length === 0 && (
                    <div className="text-sm text-gray-500 italic">明確な脅威が検出されませんでした</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アクションプラン */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-green-600" />
            実行可能なアクションプラン
          </CardTitle>
          <CardDescription>優先順位別の具体的改善提案</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 即座に対応 */}
            {actionableRecommendations.immediate.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  即座に対応（今日〜1週間）
                </h4>
                <div className="space-y-2">
                  {actionableRecommendations.immediate.map((action, index) => (
                    <div key={index} className="p-3 border-l-4 border-red-500 bg-red-50">
                      <div className="text-sm text-gray-700">{action}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 短期的改善 */}
            {actionableRecommendations.shortTerm.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  短期的改善（1週間〜1ヶ月）
                </h4>
                <div className="space-y-2">
                  {actionableRecommendations.shortTerm.map((action, index) => (
                    <div key={index} className="p-3 border-l-4 border-orange-500 bg-orange-50">
                      <div className="text-sm text-gray-700">{action}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 長期的戦略 */}
            {actionableRecommendations.longTerm.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  長期的戦略（1ヶ月〜3ヶ月）
                </h4>
                <div className="space-y-2">
                  {actionableRecommendations.longTerm.map((action, index) => (
                    <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50">
                      <div className="text-sm text-gray-700">{action}</div>
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