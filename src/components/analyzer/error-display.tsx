'use client';

import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisError } from '@/types';

interface ErrorDisplayProps {
  error: AnalysisError;
  onRetry: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const getErrorTitle = (phase: AnalysisError['phase']) => {
    switch (phase) {
      case 'github-fetch':
        return 'Repository Access Error';
      case 'file-analysis':
        return 'File Analysis Error';
      case 'dependency-resolution':
        return 'Dependency Resolution Error';
      case 'ai-processing':
        return 'AI Processing Error';
      default:
        return 'Analysis Error';
    }
  };

  const getErrorDescription = (phase: AnalysisError['phase']) => {
    switch (phase) {
      case 'github-fetch':
        return 'We couldn\'t access the repository. Please check if the URL is correct and the repository is public.';
      case 'file-analysis':
        return 'We encountered an issue while analyzing the repository files.';
      case 'dependency-resolution':
        return 'We couldn\'t resolve all dependencies and analyze the tech stack.';
      case 'ai-processing':
        return 'There was an issue processing the analysis with our AI service.';
      default:
        return 'An unexpected error occurred during the analysis.';
    }
  };

  const getSuggestions = (phase: AnalysisError['phase']) => {
    switch (phase) {
      case 'github-fetch':
        return [
          'Verify the repository URL is correct',
          'Make sure the repository is public',
          'Check if the repository exists',
          'Ensure you have proper network connectivity',
        ];
      case 'file-analysis':
        return [
          'The repository might be very large',
          'Some files might be corrupted',
          'Try again in a few moments',
        ];
      case 'dependency-resolution':
        return [
          'The package.json might have syntax errors',
          'Some dependencies might be private',
          'Try analyzing a different branch',
        ];
      case 'ai-processing':
        return [
          'Our AI service might be temporarily busy',
          'Try again in a few moments',
          'The repository might be too complex',
        ];
      default:
        return [
          'Try refreshing the page',
          'Check your internet connection',
          'Try again in a few moments',
        ];
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {getErrorTitle(error.phase)}
        </CardTitle>
        <CardDescription>
          {getErrorDescription(error.phase)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
          <p className="text-sm text-red-700">{error.message}</p>
          {error.repository && (
            <p className="text-xs text-red-600 mt-1">
              Repository: {error.repository}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Suggestions:</p>
          <ul className="space-y-1">
            {getSuggestions(error.phase).map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-1">
                <span className="text-blue-500 mt-1">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={onRetry} variant="outline" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://github.com/status', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            GitHub Status
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error.details && (
          <details className="mt-4">
            <summary className="text-sm font-medium cursor-pointer text-gray-600 hover:text-gray-800">
              Developer Details
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}