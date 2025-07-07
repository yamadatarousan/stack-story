'use client';

import { useState } from 'react';
import { AnalysisResult, AnalysisError } from '@/types';
import RepositoryForm from '@/components/analyzer/repository-form';
import AnalysisResults from '@/components/analyzer/analysis-results';
import ErrorDisplay from '@/components/analyzer/error-display';
import AnalysisProgress from '@/components/analyzer/analysis-progress';
import LazyTechStackVisualizer from '@/components/visualizer/lazy-tech-stack-visualizer';
import RateLimitInfo from '@/components/analyzer/rate-limit-info';
import OfflineAnalyzer from '@/components/analyzer/offline-analyzer';
import LocalAnalyzerForm from '@/components/analyzer/local-analyzer-form';
import SelfImprovementDashboard from '@/components/self-improvement/self-improvement-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToastProvider } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Github, Sparkles, BarChart3, FileText } from 'lucide-react';

type AppState = 'initial' | 'analyzing' | 'results' | 'error' | 'self-improvement';

export default function HomePage() {
  const [state, setState] = useState<AppState>('initial');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [currentRepository, setCurrentRepository] = useState<string>('');

  const handleAnalysisStart = (repositoryUrl: string) => {
    setCurrentRepository(repositoryUrl);
    setState('analyzing');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setError(null);
    setState('results');
  };

  const handleError = (error: AnalysisError) => {
    setError(error);
    setAnalysisResult(null);
    setState('error');
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setState('initial');
  };

  const handleRetry = () => {
    setState('initial');
    setError(null);
  };

  const handleSelfImprovement = () => {
    setState('self-improvement');
  };

  const handleStartSelfAnalysis = async () => {
    console.log('Starting self-analysis...');
    // 実際の実装では SelfAnalyzer を呼び出し
  };

  const handleImplementImprovement = (planId: string) => {
    console.log('Implementing improvement:', planId);
    // 実際の実装では SafeAutoImprover を呼び出し
  };

  const handleGenerateImprovements = () => {
    console.log('Generating repository improvements...');
    // 実際の実装では RepositoryImprover.generateImprovementPlan() を呼び出し
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Stack Story
                </h1>
                <p className="text-sm text-gray-600">GitHub Tech Stack Analyzer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelfImprovement}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI自己改善
              </Button>
              <Badge variant="outline" className="bg-white">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {state === 'initial' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
              <h2 className="text-4xl font-bold text-gray-900">
                Analyze Any GitHub Repository
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the technology stack, visualize dependencies, and generate detailed documentation 
                for any public GitHub repository using AI.
              </p>
              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Github className="w-5 h-5" />
                  <span className="text-sm">GitHub Integration</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">Visual Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">AI Documentation</span>
                </div>
              </div>
            </div>

            {/* Local Analysis Form */}
            <LocalAnalyzerForm 
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleError}
              onAnalysisStart={handleAnalysisStart}
            />
            
            {/* Original GitHub API Form */}
            <RepositoryForm 
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleError}
              onAnalysisStart={handleAnalysisStart}
            />

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 pt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="w-5 h-5 text-blue-600" />
                    Smart Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automatically detects technologies, frameworks, and dependencies 
                    from your repository&apos;s configuration files.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Interactive Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Explore your tech stack through beautiful, interactive diagrams 
                    that show relationships between technologies.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    AI Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Generate comprehensive technical articles and documentation 
                    that explain your project&apos;s architecture and choices.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {state === 'analyzing' && (
          <AnalysisProgress 
            repository={currentRepository}
            onCancel={handleNewAnalysis}
          />
        )}

        {state === 'error' && error && (
          <div className="space-y-6">
            <ErrorDisplay error={error} onRetry={handleRetry} />
            {error.message?.includes('rate limit') && (
              <>
                <RateLimitInfo />
                <OfflineAnalyzer onAnalysisComplete={handleAnalysisComplete} />
              </>
            )}
          </div>
        )}

        {state === 'results' && analysisResult && (
          <div className="space-y-8">
            {/* Analysis Results */}
            <AnalysisResults 
              result={analysisResult}
              onNewAnalysis={handleNewAnalysis}
              onGenerateImprovements={handleGenerateImprovements}
            />

            {/* Visualization */}
            <LazyTechStackVisualizer techStack={analysisResult.techStack} />
          </div>
        )}

        {state === 'self-improvement' && (
          <SelfImprovementDashboard 
            onStartSelfAnalysis={handleStartSelfAnalysis}
            onImplementImprovement={handleImplementImprovement}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Built with Next.js, TypeScript, and Tailwind CSS. 
              Powered by GitHub API and OpenAI.
            </p>
            <p className="text-xs mt-2">
              🤖 Generated with{' '}
              <a 
                href="https://claude.ai/code" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Claude Code
              </a>
            </p>
          </div>
        </div>
      </footer>
      </div>
    </ToastProvider>
  );
}