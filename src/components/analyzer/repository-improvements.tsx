'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Wrench,
  Shield, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  FileCode,
  GitPullRequest,
  Play,
  Pause,
  Info,
  Download,
  ExternalLink,
  Check
} from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';

interface RepositoryImprovementsProps {
  analysisResult: AnalysisResult;
  onGenerateImprovements?: () => void;
}

// Mock data - 実際の実装では RepositoryImprover から取得
const mockImprovementPlan = {
  repositoryName: 'sample-project',
  analysisDate: new Date(),
  improvements: [
    {
      id: 'perf-react-memo',
      title: 'React.memo によるコンポーネント最適化',
      description: '不要な再レンダリングを防ぐため、パフォーマンスが重要なコンポーネントに React.memo を適用',
      category: 'performance' as const,
      priority: 'medium' as const,
      effort: 'small' as const,
      impact: '10-30%のレンダリング性能向上が期待できます',
      estimatedTimeHours: 2,
      riskLevel: 'low' as const,
      fileChanges: [
        {
          filePath: 'src/components/example.tsx',
          changeType: 'modify' as const,
          improvedContent: 'React.memo による最適化コード...',
          changeDescription: 'React.memo による最適化を適用'
        }
      ],
      implementationSteps: [
        '再レンダリング頻度の高いコンポーネントを特定',
        'React.memo でコンポーネントをラップ',
        'props の比較関数を必要に応じて実装',
        'パフォーマンステストで効果を確認'
      ]
    },
    {
      id: 'sec-headers',
      title: 'セキュリティヘッダーの実装',
      description: 'XSS、CSRF、クリックジャッキング等の攻撃を防ぐセキュリティヘッダーを設定',
      category: 'security' as const,
      priority: 'critical' as const,
      effort: 'small' as const,
      impact: '主要なWeb攻撃に対する防御力を大幅に向上させます',
      estimatedTimeHours: 1,
      riskLevel: 'low' as const,
      fileChanges: [
        {
          filePath: 'next.config.js',
          changeType: 'modify' as const,
          improvedContent: 'セキュリティヘッダー設定...',
          changeDescription: 'セキュリティヘッダーの追加設定'
        }
      ],
      implementationSteps: [
        'Content Security Policy の設定',
        'X-Frame-Options の設定',
        'X-Content-Type-Options の設定',
        'セキュリティヘッダーのテスト'
      ]
    },
    {
      id: 'quality-typescript',
      title: 'TypeScript への移行',
      description: 'JavaScriptファイルをTypeScriptに移行し、型安全性を向上',
      category: 'quality' as const,
      priority: 'high' as const,
      effort: 'large' as const,
      impact: 'コンパイル時エラー検出により、バグを大幅に削減できます',
      estimatedTimeHours: 20,
      riskLevel: 'medium' as const,
      fileChanges: [
        {
          filePath: 'src/example.js',
          changeType: 'modify' as const,
          improvedContent: 'TypeScript変換コード...',
          changeDescription: 'JavaScript から TypeScript への変換と型定義の追加'
        }
      ],
      implementationSteps: [
        'tsconfig.json の作成',
        '.js ファイルを .ts/.tsx に順次リネーム',
        '型定義の追加',
        'コンパイルエラーの修正'
      ]
    }
  ],
  summary: {
    totalImprovements: 3,
    estimatedTimeHours: 23,
    impactScore: 85,
    categories: {
      performance: 1,
      security: 1,
      quality: 1
    }
  },
  implementationStrategy: 'phased' as const
};

export default function RepositoryImprovements({ 
  analysisResult, 
  onGenerateImprovements 
}: RepositoryImprovementsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImprovement, setSelectedImprovement] = useState<string | null>(null);
  const [improvementPlan, setImprovementPlan] = useState(mockImprovementPlan);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);

  const handleGenerateImprovements = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/repository-improvements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisResult }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate improvements');
      }

      const data = await response.json();
      setImprovementPlan(data.improvementPlan);
      setHasGenerated(true);
      onGenerateImprovements?.();
    } catch (error) {
      console.error('Failed to generate improvements:', error);
      // エラーハンドリング - UI上でエラー表示する
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePullRequest = async (improvementIds: string[], mode: 'preview' | 'create' = 'preview') => {
    const improvements = improvementPlan.improvements.filter(imp => improvementIds.includes(imp.id));
    
    try {
      const response = await fetch('/api/generate-pull-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          improvements,
          repositoryUrl: analysisResult.repository.html_url,
          mode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate pull request');
      }

      const data = await response.json();
      
      if (mode === 'preview' && data.previewUrl) {
        window.open(data.previewUrl, '_blank');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to create pull request:', error);
      throw error;
    }
  };

  const handleToggleImprovement = (improvementId: string) => {
    setSelectedImprovements(prev => 
      prev.includes(improvementId)
        ? prev.filter(id => id !== improvementId)
        : [...prev, improvementId]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'quality': return <CheckCircle className="w-4 h-4" />;
      case 'maintainability': return <Wrench className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'text-blue-600 bg-blue-50';
      case 'security': return 'text-red-600 bg-red-50';
      case 'quality': return 'text-green-600 bg-green-50';
      case 'maintainability': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'small': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'large': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Repository Improvement Recommendations</CardTitle>
                <CardDescription>
                  AI-powered analysis and improvement suggestions for {analysisResult.repository.name}
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleGenerateImprovements} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Bot className="w-4 h-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  Generate Improvements
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{improvementPlan.summary.totalImprovements}</div>
            <p className="text-sm text-gray-600">Actionable suggestions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Estimated Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {improvementPlan.summary.estimatedTimeHours}h
            </div>
            <p className="text-sm text-gray-600">Implementation effort</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Impact Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {improvementPlan.summary.impactScore}/100
            </div>
            <p className="text-sm text-gray-600">Expected improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 capitalize">
              {improvementPlan.implementationStrategy}
            </div>
            <p className="text-sm text-gray-600">Implementation approach</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value="improvements" onValueChange={() => {}} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="improvements">Improvement List</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="improvements" className="space-y-4">
          {/* Pull Request Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5" />
                Generate Pull Request
              </CardTitle>
              <CardDescription>
                Select improvements to include in a pull request for the target repository
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Risk Assessment */}
                {selectedImprovements.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-yellow-800">Security Assessment</div>
                        <div className="text-yellow-700 mt-1">
                          {(() => {
                            const selectedImps = improvementPlan.improvements.filter(imp => 
                              selectedImprovements.includes(imp.id)
                            );
                            const riskLevels = selectedImps.map(imp => (imp as any).riskLevel || 'low');
                            const highRisk = riskLevels.filter(r => r === 'high').length;
                            const mediumRisk = riskLevels.filter(r => r === 'medium').length;
                            const lowRisk = riskLevels.filter(r => r === 'low').length;
                            
                            return `Selected improvements: ${highRisk} high risk, ${mediumRisk} medium risk, ${lowRisk} low risk. Please review carefully before applying.`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedImprovements.length} of {improvementPlan.improvements.length} improvements selected
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedImprovements.length === improvementPlan.improvements.length) {
                          setSelectedImprovements([]);
                        } else {
                          setSelectedImprovements(improvementPlan.improvements.map(imp => imp.id));
                        }
                      }}
                    >
                      {selectedImprovements.length === improvementPlan.improvements.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                      disabled={selectedImprovements.length === 0}
                      onClick={() => handleCreatePullRequest(selectedImprovements, 'preview')}
                    >
                      <GitPullRequest className="w-4 h-4 mr-2" />
                      Preview Pull Request
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Improvements</CardTitle>
              <CardDescription>
                Select improvements and click on any improvement to see detailed implementation steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {improvementPlan.improvements.map((improvement) => (
                    <Card 
                      key={improvement.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedImprovement === improvement.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedImprovement(
                        selectedImprovement === improvement.id ? null : improvement.id
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedImprovements.includes(improvement.id)}
                              onCheckedChange={() => handleToggleImprovement(improvement.id)}
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            />
                            <CardTitle className="text-lg flex items-center gap-2">
                              {getCategoryIcon(improvement.category)}
                              {improvement.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getCategoryColor(improvement.category)}>
                              {improvement.category}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(improvement.priority)}>
                              {improvement.priority}
                            </Badge>
                            <Badge variant="outline" className={getEffortColor(improvement.effort)}>
                              {improvement.effort}
                            </Badge>
                            <Badge variant="outline" className={getRiskColor((improvement as any).riskLevel || 'low')}>
                              {getRiskIcon((improvement as any).riskLevel || 'low')}
                              <span className="ml-1">{(improvement as any).riskLevel || 'low'} risk</span>
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          {improvement.description}
                        </CardDescription>
                      </CardHeader>

                      {selectedImprovement === improvement.id && (
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Expected Impact
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">{improvement.impact}</p>
                              
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Implementation Details
                              </h4>
                              <div className="text-sm space-y-1">
                                <div>Estimated time: {improvement.estimatedTimeHours} hours</div>
                                <div>Files affected: {improvement.fileChanges.length}</div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Implementation Steps
                              </h4>
                              <ul className="text-sm space-y-1">
                                {improvement.implementationSteps.map((step, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-0.5">{index + 1}.</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <FileCode className="w-4 h-4" />
                              File Changes Preview
                            </h4>
                            <div className="space-y-2">
                              {improvement.fileChanges.map((change, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-md">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-sm">{change.filePath}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {change.changeType}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{change.changeDescription}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => console.log('Export code changes for:', improvement.id)}
                            >
                              <Download className="w-3 h-3 mr-2" />
                              Export Code Changes
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCreatePullRequest([improvement.id], 'preview')}
                            >
                              <GitPullRequest className="w-3 h-3 mr-2" />
                              Create Pull Request
                            </Button>
                            <Button size="sm">
                              <Play className="w-3 h-3 mr-2" />
                              Implement Now
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

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(improvementPlan.summary.categories).map(([category, count]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {getCategoryIcon(category)}
                    {category} Improvements
                  </CardTitle>
                  <CardDescription>
                    {count} improvement{count !== 1 ? 's' : ''} in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {improvementPlan.improvements
                      .filter(imp => imp.category === category)
                      .map(improvement => (
                        <div key={improvement.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{improvement.title}</div>
                            <div className="text-xs text-gray-600">{improvement.estimatedTimeHours}h effort</div>
                          </div>
                          <Badge variant="outline" className={getPriorityColor(improvement.priority)}>
                            {improvement.priority}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Strategy: {improvementPlan.implementationStrategy}</CardTitle>
              <CardDescription>
                Recommended approach for implementing these improvements safely and efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Implementation plan generation is in development.</p>
                  <p className="text-sm mt-2">
                    This will include phased rollout plans, dependency analysis, and risk mitigation strategies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}