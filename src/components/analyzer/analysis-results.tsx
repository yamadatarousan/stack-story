'use client';

import { AnalysisResult } from '@/types';
import AnalysisOverview from './analysis-overview';
import TechStackDisplay from './tech-stack-display';
import DependenciesDisplay from './dependencies-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Share2, RotateCcw } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
  onGenerateArticle?: () => void;
}

export default function AnalysisResults({ 
  result, 
  onNewAnalysis, 
  onGenerateArticle 
}: AnalysisResultsProps) {
  const handleExportJson = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.repository.name}-analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${result.repository.name} - Tech Stack Analysis`,
          text: result.summary,
          url: result.repository.html_url,
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${result.repository.name} - Tech Stack Analysis\n\n${result.summary}\n\n${result.repository.html_url}`
        );
        // TODO: Show toast notification
        console.log('Analysis copied to clipboard');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analysis Complete</CardTitle>
              <CardDescription>
                Analysis completed for {result.repository.full_name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJson}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              {onGenerateArticle && (
                <Button onClick={onGenerateArticle}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Article
                </Button>
              )}
              <Button variant="outline" onClick={onNewAnalysis}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {result.techStack.length} Technologies
              </Badge>
              <Badge variant="secondary">
                {result.dependencies?.length || 0} Dependencies
              </Badge>
              <Badge variant="secondary">
                {result.detectedFiles?.length || 0} Config Files
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{result.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Overview */}
      <AnalysisOverview 
        repository={result.repository} 
        structure={result.structure} 
      />

      {/* Results Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TechStackDisplay techStack={result.techStack} />
        <DependenciesDisplay dependencies={result.dependencies || []} />
      </div>

      {/* Detected Files Summary */}
      {result.detectedFiles && result.detectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detected Configuration Files
            </CardTitle>
            <CardDescription>
              {result.detectedFiles?.length || 0} configuration files found and analyzed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(result.detectedFiles || [])
                .sort((a, b) => b.importance - a.importance)
                .map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 text-xs bg-gray-50 rounded border"
                  >
                    <span className="font-mono truncate">{file.path}</span>
                    <Badge 
                      variant="outline" 
                      className="ml-1 text-xs"
                    >
                      {file.type}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}