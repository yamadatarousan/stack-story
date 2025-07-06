'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Github, ArrowRight, AlertCircle } from 'lucide-react';
import { AnalysisResult, AnalysisError } from '@/types';
import { useToast } from '@/components/ui/toast';

interface RepositoryFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (error: AnalysisError) => void;
  onAnalysisStart?: (repositoryUrl: string) => void;
}

export default function RepositoryForm({ onAnalysisComplete, onError, onAnalysisStart }: RepositoryFormProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    // 基本的なURL検証
    if (!url.includes('github.com')) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    onAnalysisStart?.(url.trim());

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        onError(data.error);
        showError('分析エラー', data.error?.message || '分析中にエラーが発生しました');
        return;
      }

      onAnalysisComplete(data.data);
      success('分析完了', `${data.data.repository.name} の分析が完了しました`);
    } catch (err) {
      const analysisError: AnalysisError = {
        message: 'Failed to connect to the analysis service',
        status: 500,
        phase: 'github-fetch',
        details: err,
      };
      onError(analysisError);
      showError('接続エラー', 'サーバーに接続できませんでした');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) setError(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Github className="w-6 h-6" />
          Repository Analysis
        </CardTitle>
        <CardDescription>
          Enter a GitHub repository URL to analyze its tech stack and generate documentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="repo-url" className="text-sm font-medium">
              GitHub Repository URL
            </label>
            <Input
              id="repo-url"
              type="url"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={handleInputChange}
              disabled={isLoading}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Repository...
              </>
            ) : (
              <>
                Analyze Repository
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">What we analyze:</h4>
            <ul className="space-y-1 text-xs">
              <li>• Technology stack and dependencies</li>
              <li>• Project structure and architecture</li>
              <li>• Configuration files and build tools</li>
              <li>• Testing and documentation setup</li>
            </ul>
          </div>

          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">Example repositories:</h4>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => setUrl('https://github.com/vercel/next.js')}
                className="text-blue-600 hover:text-blue-800 block"
                disabled={isLoading}
              >
                https://github.com/vercel/next.js
              </button>
              <button
                type="button"
                onClick={() => setUrl('https://github.com/facebook/react')}
                className="text-blue-600 hover:text-blue-800 block"
                disabled={isLoading}
              >
                https://github.com/facebook/react
              </button>
              <button
                type="button"
                onClick={() => setUrl('https://github.com/vuejs/vue')}
                className="text-blue-600 hover:text-blue-800 block"
                disabled={isLoading}
              >
                https://github.com/vuejs/vue
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}