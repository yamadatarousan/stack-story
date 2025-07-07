'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import { DeepContentAnalysis } from '@/lib/deep-content-analyzer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText,
  Package,
  Code,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Shield,
  Zap,
  Bug,
  RefreshCw,
  Search,
  BarChart3,
  GitBranch,
  Users,
  Star,
  Eye,
  Clock,
  Target
} from 'lucide-react';

interface DeepContentAnalysisProps {
  analysisResult: AnalysisResult;
  onAnalyze?: () => void;
}

export default function DeepContentAnalysisComponent({ 
  analysisResult, 
  onAnalyze 
}: DeepContentAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deepAnalysis, setDeepAnalysis] = useState<DeepContentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeepAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/deep-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          analysisResult,
          githubToken: localStorage.getItem('github_token') 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform deep analysis');
      }

      const data = await response.json();
      setDeepAnalysis(data.deepContentAnalysis);
      onAnalyze?.();
    } catch (error) {
      console.error('Deep analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!deepAnalysis) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Deep Content Analysis</CardTitle>
                <CardDescription>
                  Comprehensive analysis of README, dependencies, code structure, and quality metrics
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleDeepAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Deep Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {error && (
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          </CardContent>
        )}
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Ready for Deep Analysis</h3>
            <p className="text-sm max-w-md mx-auto">
              This will analyze README content, package.json dependencies, code structure, 
              technical debt, and calculate comprehensive quality metrics.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>README Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-green-600" />
                <span>Dependency Audit</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-600" />
                <span>Code Structure</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span>Quality Metrics</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overall Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${getQualityColor(deepAnalysis.qualityMetrics.overallScore)}`}>
              {getQualityIcon(deepAnalysis.qualityMetrics.overallScore)}
              {deepAnalysis.qualityMetrics.overallScore}/100
            </div>
            <Progress value={deepAnalysis.qualityMetrics.overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Technical Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {deepAnalysis.technicalDebt.overallDebtLevel}
            </div>
            <p className="text-sm text-gray-600">
              {deepAnalysis.technicalDebt.debtCategories.length} categories identified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Dependencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deepAnalysis.packageJson.dependencies.total}
            </div>
            <p className="text-sm text-gray-600">
              {deepAnalysis.packageJson.dependencies.outdated.length} outdated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${getQualityColor(deepAnalysis.architectureInsights.securityAssessment.overallScore)}`}>
              {getQualityIcon(deepAnalysis.architectureInsights.securityAssessment.overallScore)}
              {deepAnalysis.architectureInsights.securityAssessment.overallScore}/100
            </div>
            <Progress value={deepAnalysis.architectureInsights.securityAssessment.overallScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs value="readme" onValueChange={() => {}} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="readme" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            README
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Dependencies
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Structure
          </TabsTrigger>
          <TabsTrigger value="debt" className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Tech Debt
          </TabsTrigger>
          <TabsTrigger value="architecture" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Architecture
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Quality
          </TabsTrigger>
        </TabsList>

        <TabsContent value="readme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                README.md Analysis
              </CardTitle>
              <CardDescription>
                Content quality, structure, and completeness assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* README Quality */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Overall Quality</h4>
                    <Badge variant="outline" className={getQualityColor(deepAnalysis.readme.contentAnalysis.structureScore)}>
                      {deepAnalysis.readme.quality}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Word Count</div>
                      <div className="font-medium">{deepAnalysis.readme.contentAnalysis.wordCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Code Blocks</div>
                      <div className="font-medium">{deepAnalysis.readme.contentAnalysis.codeBlockCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Links</div>
                      <div className="font-medium">{deepAnalysis.readme.contentAnalysis.linkCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Images</div>
                      <div className="font-medium">{deepAnalysis.readme.contentAnalysis.imageCount}</div>
                    </div>
                  </div>
                </div>

                {/* README Sections */}
                <div>
                  <h4 className="font-medium mb-3">Available Sections</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(deepAnalysis.readme.sections).map(([section, present]) => (
                      <div key={section} className="flex items-center gap-2 text-sm">
                        {present ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={present ? 'text-gray-900' : 'text-gray-500'}>
                          {section.charAt(0).toUpperCase() + section.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Elements & Recommendations */}
                {deepAnalysis.readme.missingElements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Missing Elements</h4>
                    <div className="space-y-2">
                      {deepAnalysis.readme.missingElements.map((element, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-orange-600">
                          <AlertTriangle className="w-4 h-4" />
                          {element}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {deepAnalysis.readme.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {deepAnalysis.readme.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Dependency Analysis
              </CardTitle>
              <CardDescription>
                Package.json analysis, security audit, and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Dependency Overview */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{deepAnalysis.packageJson.dependencies.production}</div>
                    <div className="text-sm text-gray-600">Production</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{deepAnalysis.packageJson.dependencies.development}</div>
                    <div className="text-sm text-gray-600">Development</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{deepAnalysis.packageJson.dependencies.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>

                {/* Scripts Analysis */}
                <div>
                  <h4 className="font-medium mb-3">Available Scripts</h4>
                  <div className="space-y-2">
                    {deepAnalysis.packageJson.scripts.availableScripts.map((script, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{script.type}</Badge>
                          <span className="font-mono text-sm">{script.name}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Complexity: {script.complexity}/10
                        </div>
                      </div>
                    ))}
                  </div>
                  {deepAnalysis.packageJson.scripts.missingStandardScripts.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Missing Standard Scripts</h5>
                      <div className="flex flex-wrap gap-2">
                        {deepAnalysis.packageJson.scripts.missingStandardScripts.map((script, index) => (
                          <Badge key={index} variant="outline" className="text-orange-600 border-orange-200">
                            {script}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Issues */}
                {deepAnalysis.packageJson.securityIssues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      Security Issues
                    </h4>
                    <div className="space-y-2">
                      {deepAnalysis.packageJson.securityIssues.map((issue, index) => (
                        <div key={index} className={`p-3 border rounded-md ${getSeverityColor(issue.severity)}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{issue.type}</span>
                            <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm">{issue.description}</p>
                          <p className="text-xs mt-1 opacity-75">{issue.fix}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optimization Opportunities */}
                {deepAnalysis.packageJson.optimizationOpportunities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      Optimization Opportunities
                    </h4>
                    <div className="space-y-2">
                      {deepAnalysis.packageJson.optimizationOpportunities.map((opp, index) => (
                        <div key={index} className="p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{opp.type}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">
                                Impact: {opp.impact}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Effort: {opp.effort}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm">{opp.description}</p>
                          <p className="text-xs mt-1 text-yellow-700">{opp.implementation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Code Structure Analysis
              </CardTitle>
              <CardDescription>
                Architecture patterns, organization, and test coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Architecture Patterns */}
                <div>
                  <h4 className="font-medium mb-3">Detected Architecture Patterns</h4>
                  <div className="space-y-2">
                    {deepAnalysis.codeStructure.architecturePatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{pattern.pattern}</div>
                          <div className="text-sm text-gray-600">
                            Evidence: {pattern.evidence.join(', ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={pattern.confidence} className="w-20" />
                          <span className="text-sm font-medium">{pattern.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code Organization Metrics */}
                <div>
                  <h4 className="font-medium mb-3">Code Organization</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Separation of Concerns</div>
                      <div className="flex items-center gap-2">
                        <Progress value={deepAnalysis.codeStructure.codeOrganization.separationOfConcerns} className="flex-1" />
                        <span className="text-sm font-medium">{deepAnalysis.codeStructure.codeOrganization.separationOfConcerns}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Modularity</div>
                      <div className="flex items-center gap-2">
                        <Progress value={deepAnalysis.codeStructure.codeOrganization.modularity} className="flex-1" />
                        <span className="text-sm font-medium">{deepAnalysis.codeStructure.codeOrganization.modularity}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Reusability</div>
                      <div className="flex items-center gap-2">
                        <Progress value={deepAnalysis.codeStructure.codeOrganization.reusability} className="flex-1" />
                        <span className="text-sm font-medium">{deepAnalysis.codeStructure.codeOrganization.reusability}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Consistency</div>
                      <div className="flex items-center gap-2">
                        <Progress value={deepAnalysis.codeStructure.codeOrganization.consistency} className="flex-1" />
                        <span className="text-sm font-medium">{deepAnalysis.codeStructure.codeOrganization.consistency}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Coverage */}
                <div>
                  <h4 className="font-medium mb-3">Test Coverage Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Coverage Estimate</div>
                      <div className="flex items-center gap-2">
                        <Progress value={deepAnalysis.codeStructure.testCoverage.estimatedCoverage} className="flex-1" />
                        <span className="text-sm font-medium">{deepAnalysis.codeStructure.testCoverage.estimatedCoverage}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Test Quality</div>
                      <Badge variant="outline" className={getQualityColor(deepAnalysis.codeStructure.testCoverage.estimatedCoverage)}>
                        {deepAnalysis.codeStructure.testCoverage.testQuality}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-2">Test Types</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(deepAnalysis.codeStructure.testCoverage.testTypes).map(([type, present]) => (
                        <div key={type} className="flex items-center gap-2 text-sm">
                          {present ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={present ? 'text-gray-900' : 'text-gray-500'}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {deepAnalysis.codeStructure.testCoverage.testFrameworks.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-600 mb-2">Frameworks</div>
                      <div className="flex flex-wrap gap-2">
                        {deepAnalysis.codeStructure.testCoverage.testFrameworks.map((framework, index) => (
                          <Badge key={index} variant="outline">{framework}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Technical Debt Analysis
              </CardTitle>
              <CardDescription>
                Identification and prioritization of technical debt issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Debt Level */}
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    deepAnalysis.technicalDebt.overallDebtLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    deepAnalysis.technicalDebt.overallDebtLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    deepAnalysis.technicalDebt.overallDebtLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {deepAnalysis.technicalDebt.overallDebtLevel.toUpperCase()} Technical Debt
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Maintenance Score: {deepAnalysis.technicalDebt.maintenanceScore}/100
                  </p>
                  <Progress value={deepAnalysis.technicalDebt.maintenanceScore} className="mt-2 max-w-xs mx-auto" />
                </div>

                {/* Debt Categories */}
                <div>
                  <h4 className="font-medium mb-3">Debt Categories</h4>
                  <div className="space-y-3">
                    {deepAnalysis.technicalDebt.debtCategories.map((category, index) => (
                      <div key={index} className={`p-4 border rounded-lg ${
                        category.severity === 'critical' ? 'border-red-200 bg-red-50' :
                        category.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                        category.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-green-200 bg-green-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              category.severity === 'critical' ? 'bg-red-500' :
                              category.severity === 'high' ? 'bg-orange-500' :
                              category.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`} />
                            <span className="font-medium capitalize">
                              {category.category.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getSeverityColor(category.severity)}>
                              {category.severity}
                            </Badge>
                            <Badge variant="outline">
                              {category.count} issues
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          <div className="font-medium mb-1">Examples:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {category.examples.map((example, idx) => (
                              <li key={idx}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Issues */}
                <div>
                  <h4 className="font-medium mb-3">Priority Issues</h4>
                  <div className="space-y-2">
                    {deepAnalysis.technicalDebt.prioritizedIssues.slice(0, 5).map((issue, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{issue.type.replace('-', ' ')}</span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {issue.effort} effort
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{issue.description}</p>
                        <p className="text-xs text-gray-600">{issue.location}</p>
                        <p className="text-xs text-blue-600 mt-1">{issue.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refactoring Opportunities */}
                {deepAnalysis.technicalDebt.refactoringOpportunities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Refactoring Opportunities</h4>
                    <div className="space-y-2">
                      {deepAnalysis.technicalDebt.refactoringOpportunities.map((opportunity, index) => (
                        <div key={index} className="p-3 border border-blue-200 bg-blue-50 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">
                              {opportunity.type.replace('-', ' ')}
                            </span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">
                                Impact: {opportunity.impact}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {opportunity.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{opportunity.description}</p>
                          <p className="text-xs text-gray-600">
                            Files: {opportunity.files.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Architecture Insights
              </CardTitle>
              <CardDescription>
                Architecture patterns, scalability, and design analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Architecture Style */}
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                    <GitBranch className="w-4 h-4 mr-2" />
                    {deepAnalysis.architectureInsights.architectureStyle}
                  </div>
                </div>

                {/* Scalability Assessment */}
                <div>
                  <h4 className="font-medium mb-3">Scalability Assessment</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Horizontal Scaling</div>
                      <div className="flex items-center gap-2">
                        <Progress value={deepAnalysis.architectureInsights.scalabilityAssessment.horizontal} className="flex-1" />
                        <span className="text-sm font-medium">
                          {deepAnalysis.architectureInsights.scalabilityAssessment.horizontal}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Vertical Scaling</div>
                      <div className="flex items-center gap-2">
                        <Progress value={deepAnalysis.architectureInsights.scalabilityAssessment.vertical} className="flex-1" />
                        <span className="text-sm font-medium">
                          {deepAnalysis.architectureInsights.scalabilityAssessment.vertical}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {deepAnalysis.architectureInsights.scalabilityAssessment.bottlenecks.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Potential Bottlenecks</div>
                      <div className="space-y-1">
                        {deepAnalysis.architectureInsights.scalabilityAssessment.bottlenecks.map((bottleneck, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-orange-600">
                            <AlertTriangle className="w-4 h-4" />
                            {bottleneck}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {deepAnalysis.architectureInsights.scalabilityAssessment.recommendations.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Recommendations</div>
                      <div className="space-y-1">
                        {deepAnalysis.architectureInsights.scalabilityAssessment.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Assessment */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Assessment
                  </h4>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Security Score</span>
                      <span className={`text-sm font-medium ${
                        deepAnalysis.architectureInsights.securityAssessment.overallScore >= 80 ? 'text-green-600' :
                        deepAnalysis.architectureInsights.securityAssessment.overallScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {deepAnalysis.architectureInsights.securityAssessment.overallScore}/100
                      </span>
                    </div>
                    <Progress value={deepAnalysis.architectureInsights.securityAssessment.overallScore} />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Best Practices */}
                    <div>
                      <div className="text-sm font-medium mb-2">Security Best Practices</div>
                      <div className="space-y-2">
                        {deepAnalysis.architectureInsights.securityAssessment.bestPractices.map((practice, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {practice.implemented ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span>{practice.practice}</span>
                            </div>
                            <Badge variant="outline" className={getSeverityColor(practice.importance)}>
                              {practice.importance}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Recommendations */}
                    <div>
                      <div className="text-sm font-medium mb-2">Security Recommendations</div>
                      <div className="space-y-1">
                        {deepAnalysis.architectureInsights.securityAssessment.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-blue-600">
                            <Shield className="w-4 h-4 mt-0.5" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Bottlenecks */}
                {deepAnalysis.architectureInsights.performanceBottlenecks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Performance Bottlenecks
                    </h4>
                    <div className="space-y-2">
                      {deepAnalysis.architectureInsights.performanceBottlenecks.map((bottleneck, index) => (
                        <div key={index} className={`p-3 border rounded-md ${
                          bottleneck.impact === 'high' ? 'border-red-200 bg-red-50' :
                          bottleneck.impact === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                          'border-green-200 bg-green-50'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">
                              {bottleneck.type.replace('-', ' ')}
                            </span>
                            <Badge variant="outline" className={getSeverityColor(bottleneck.impact)}>
                              {bottleneck.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{bottleneck.location}</p>
                          <p className="text-xs text-blue-600">{bottleneck.solution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Design Patterns */}
                {deepAnalysis.architectureInsights.designPatterns.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Design Patterns</h4>
                    <div className="space-y-2">
                      {deepAnalysis.architectureInsights.designPatterns.map((pattern, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{pattern.pattern}</div>
                            <div className="text-sm text-gray-600">
                              Usage: {pattern.usage.join(', ')}
                            </div>
                          </div>
                          <Badge variant="outline" className={getQualityColor(
                            pattern.appropriateness === 'excellent' ? 90 :
                            pattern.appropriateness === 'good' ? 70 :
                            pattern.appropriateness === 'questionable' ? 40 : 20
                          )}>
                            {pattern.appropriateness}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quality Metrics
              </CardTitle>
              <CardDescription>
                Comprehensive code quality assessment and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Quality Score */}
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    deepAnalysis.qualityMetrics.overallScore >= 80 ? 'text-green-600' :
                    deepAnalysis.qualityMetrics.overallScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {deepAnalysis.qualityMetrics.overallScore}/100
                  </div>
                  <p className="text-sm text-gray-600">Overall Quality Score</p>
                  <Progress value={deepAnalysis.qualityMetrics.overallScore} className="mt-2 max-w-xs mx-auto" />
                </div>

                {/* Quality Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {deepAnalysis.qualityMetrics.maintainabilityIndex}
                    </div>
                    <div className="text-sm text-gray-600">Maintainability Index</div>
                    <Progress value={deepAnalysis.qualityMetrics.maintainabilityIndex} className="mt-2" />
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {100 - deepAnalysis.qualityMetrics.duplicationLevel}%
                    </div>
                    <div className="text-sm text-gray-600">Code Uniqueness</div>
                    <Progress value={100 - deepAnalysis.qualityMetrics.duplicationLevel} className="mt-2" />
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {deepAnalysis.qualityMetrics.documentationCoverage}%
                    </div>
                    <div className="text-sm text-gray-600">Documentation</div>
                    <Progress value={deepAnalysis.qualityMetrics.documentationCoverage} className="mt-2" />
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {deepAnalysis.qualityMetrics.testCoverage}%
                    </div>
                    <div className="text-sm text-gray-600">Test Coverage</div>
                    <Progress value={deepAnalysis.qualityMetrics.testCoverage} className="mt-2" />
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      {deepAnalysis.qualityMetrics.codeComplexity.cyclomaticComplexity}
                    </div>
                    <div className="text-sm text-gray-600">Cyclomatic Complexity</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {deepAnalysis.qualityMetrics.codeSmells.length}
                    </div>
                    <div className="text-sm text-gray-600">Code Smells</div>
                  </div>
                </div>

                {/* Code Complexity Details */}
                <div>
                  <h4 className="font-medium mb-3">Code Complexity Analysis</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded">
                      <div className="text-lg font-semibold">
                        {deepAnalysis.qualityMetrics.codeComplexity.cyclomaticComplexity}
                      </div>
                      <div className="text-sm text-gray-600">Cyclomatic Complexity</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Measures code path complexity
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-lg font-semibold">
                        {deepAnalysis.qualityMetrics.codeComplexity.cognitiveComplexity}
                      </div>
                      <div className="text-sm text-gray-600">Cognitive Complexity</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Measures how hard code is to understand
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-lg font-semibold">
                        {deepAnalysis.qualityMetrics.codeComplexity.halsteadComplexity}
                      </div>
                      <div className="text-sm text-gray-600">Halstead Complexity</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Measures program difficulty
                      </div>
                    </div>
                  </div>
                  
                  {deepAnalysis.qualityMetrics.codeComplexity.filesAboveThreshold.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Files Above Complexity Threshold</div>
                      <div className="flex flex-wrap gap-2">
                        {deepAnalysis.qualityMetrics.codeComplexity.filesAboveThreshold.map((file, index) => (
                          <Badge key={index} variant="outline" className="text-orange-600 border-orange-200">
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Code Smells */}
                {deepAnalysis.qualityMetrics.codeSmells.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Code Smells</h4>
                    <div className="space-y-2">
                      {deepAnalysis.qualityMetrics.codeSmells.map((smell, index) => (
                        <div key={index} className={`p-3 border rounded-md ${
                          smell.severity === 'critical' ? 'border-red-200 bg-red-50' :
                          smell.severity === 'major' ? 'border-orange-200 bg-orange-50' :
                          'border-yellow-200 bg-yellow-50'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{smell.smell}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className={getSeverityColor(smell.severity)}>
                                {smell.severity}
                              </Badge>
                              <Badge variant="outline">
                                {smell.count} occurrences
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{smell.impact}</p>
                          <div className="text-xs text-gray-600">
                            <div className="font-medium mb-1">Examples:</div>
                            <ul className="list-disc list-inside">
                              {smell.examples.map((example, idx) => (
                                <li key={idx}>{example}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs font-medium text-blue-700 mb-1">Suggestions:</div>
                            <ul className="list-disc list-inside text-xs text-blue-600">
                              {smell.suggestions.map((suggestion, idx) => (
                                <li key={idx}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}