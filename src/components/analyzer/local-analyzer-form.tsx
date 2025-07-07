'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Progress from '@/components/ui/progress';
import { 
  GitBranch, 
  Upload, 
  Folder, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  HardDrive,
  Zap 
} from 'lucide-react';
import { AnalysisResult, AnalysisError } from '@/types';

interface LocalAnalyzerFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (error: AnalysisError) => void;
  onAnalysisStart: (method: string) => void;
}

interface AnalysisProgress {
  stage: 'cloning' | 'scanning' | 'analyzing' | 'completed' | 'error';
  message: string;
  progress: number;
  currentFile?: string;
}

export default function LocalAnalyzerForm({ 
  onAnalysisComplete, 
  onError, 
  onAnalysisStart 
}: LocalAnalyzerFormProps) {
  const [gitUrl, setGitUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'git' | 'zip'>('git');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGitAnalysis = async () => {
    if (!gitUrl.trim()) {
      onError({
        message: 'Git URLを入力してください',
        status: 400,
        phase: 'validation',
      });
      return;
    }

    const gitUrlPattern = /^https:\/\/github\.com\/[\w\-_]+\/[\w\-_]+(?:\.git)?$/;
    if (!gitUrlPattern.test(gitUrl)) {
      onError({
        message: '有効なGitHub URLを入力してください (例: https://github.com/user/repo)',
        status: 400,
        phase: 'validation',
      });
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress({
      stage: 'cloning',
      message: 'リポジトリクローンを準備中...',
      progress: 0,
    });
    onAnalysisStart(`Git Clone: ${gitUrl}`);

    try {
      const formData = new FormData();
      formData.append('type', 'git');
      formData.append('gitUrl', gitUrl);

      const response = await fetch('/api/analyze-local', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.details || result.error || 'Analysis failed');
      }

      if (result.success) {
        setAnalysisProgress({
          stage: 'completed',
          message: '分析完了！',
          progress: 100,
        });
        setTimeout(() => {
          onAnalysisComplete(result.analysis);
        }, 500);
      } else {
        throw new Error(result.error?.message || 'Analysis failed');
      }

    } catch (error) {
      console.error('Git analysis error:', error);
      setAnalysisProgress({
        stage: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        progress: 0,
      });
      
      setTimeout(() => {
        onError({
          message: 'Git分析に失敗しました',
          details: error instanceof Error ? error.message : 'Unknown error',
          status: 500,
          phase: 'git-clone',
        });
        setAnalyzing(false);
        setAnalysisProgress(null);
      }, 2000);
    }
  };

  const handleZipAnalysis = async () => {
    if (!selectedFile) {
      onError({
        message: 'ZIPファイルを選択してください',
        status: 400,
        phase: 'validation',
      });
      return;
    }

    if (!projectName.trim()) {
      onError({
        message: 'プロジェクト名を入力してください',
        status: 400,
        phase: 'validation',
      });
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      onError({
        message: 'ファイルサイズが大きすぎます（最大50MB）',
        status: 413,
        phase: 'validation',
      });
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress({
      stage: 'cloning',
      message: 'ZIPファイルを処理中...',
      progress: 5,
    });
    onAnalysisStart(`ZIP Upload: ${selectedFile.name}`);

    try {
      const formData = new FormData();
      formData.append('type', 'zip');
      formData.append('zipFile', selectedFile);
      formData.append('projectName', projectName);

      // 進捗シミュレーション
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev && prev.progress < 90) {
            return {
              ...prev,
              progress: Math.min(prev.progress + 5, 90),
              message: prev.progress < 30 ? 'ZIP展開中...' :
                      prev.progress < 60 ? 'ファイルスキャン中...' :
                      'ディープ分析実行中...',
            };
          }
          return prev;
        });
      }, 300);

      const response = await fetch('/api/analyze-local', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.details || result.error || 'Analysis failed');
      }

      if (result.success) {
        setAnalysisProgress({
          stage: 'completed',
          message: '分析完了！',
          progress: 100,
        });
        setTimeout(() => {
          onAnalysisComplete(result.analysis);
        }, 500);
      } else {
        throw new Error(result.error?.message || 'Analysis failed');
      }

    } catch (error) {
      console.error('ZIP analysis error:', error);
      setAnalysisProgress({
        stage: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        progress: 0,
      });
      
      setTimeout(() => {
        onError({
          message: 'ZIP分析に失敗しました',
          details: error instanceof Error ? error.message : 'Unknown error',
          status: 500,
          phase: 'zip-upload',
        });
        setAnalyzing(false);
        setAnalysisProgress(null);
      }, 2000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
        onError({
          message: 'ZIPファイルのみ対応しています',
          status: 400,
          phase: 'validation',
        });
        return;
      }
      setSelectedFile(file);
      if (!projectName) {
        const nameWithoutExt = file.name.replace(/\.zip$/i, '');
        setProjectName(nameWithoutExt);
      }
    }
  };

  const resetForm = () => {
    setAnalyzing(false);
    setAnalysisProgress(null);
    if (activeTab === 'git') {
      setGitUrl('');
    } else {
      setSelectedFile(null);
      setProjectName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-green-600" />
          ローカル分析エンジン
        </CardTitle>
        <CardDescription>
          GitHub API制限なし • 無制限ファイルアクセス • プライベートリポジトリ対応
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 分析進捗表示 */}
        {analyzing && analysisProgress && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-3">
              {analysisProgress.stage === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : analysisProgress.stage === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              )}
              <span className="font-medium">{analysisProgress.message}</span>
            </div>
            <Progress 
              value={analysisProgress.progress} 
              max={100} 
              size="md" 
              color={analysisProgress.stage === 'error' ? 'red' : 'green'}
            />
            {analysisProgress.currentFile && (
              <div className="text-sm text-gray-600 mt-2">
                処理中: {analysisProgress.currentFile}
              </div>
            )}
          </div>
        )}

        {/* タブ選択 */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'git'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('git')}
            disabled={analyzing}
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Git Clone分析
            </div>
          </button>
          <button
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'zip'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('zip')}
            disabled={analyzing}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              ZIPアップロード
            </div>
          </button>
        </div>

        {/* Git Clone分析 */}
        {activeTab === 'git' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="git-url" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub リポジトリ URL
              </label>
              <input
                id="git-url"
                type="url"
                placeholder="https://github.com/username/repository"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                disabled={analyzing}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleGitAnalysis} 
                disabled={analyzing || !gitUrl.trim()}
                className="flex-1"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Git分析開始
                  </>
                )}
              </Button>
              
              {analyzing && (
                <Button variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              )}
            </div>

            {/* Git分析の利点 */}
            <div className="text-xs text-gray-600 p-3 bg-green-50 rounded-lg">
              <p><strong>Git分析の利点:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>GitHub API制限を完全回避</li>
                <li>全ファイルへの無制限アクセス</li>
                <li>大規模リポジトリにも対応</li>
                <li>最新のコミット状態を分析</li>
              </ul>
            </div>
          </div>
        )}

        {/* ZIP アップロード分析 */}
        {activeTab === 'zip' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
                プロジェクト名
              </label>
              <input
                id="project-name"
                type="text"
                placeholder="例: my-awesome-project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={analyzing}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="zip-file" className="block text-sm font-medium text-gray-700 mb-2">
                ZIP ファイル
              </label>
              <div className="relative">
                <input
                  id="zip-file"
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  disabled={analyzing}
                  ref={fileInputRef}
                  className="hidden"
                />
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    analyzing 
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onClick={() => !analyzing && fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div>
                      <Folder className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-medium">{selectedFile.name}</div>
                      <div className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-gray-600">ZIPファイルをクリックして選択</div>
                      <div className="text-xs text-gray-500 mt-1">最大50MB</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleZipAnalysis} 
                disabled={analyzing || !selectedFile || !projectName.trim()}
                className="flex-1"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    ZIP分析開始
                  </>
                )}
              </Button>
              
              {analyzing && (
                <Button variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              )}
            </div>

            {/* ZIP分析の利点 */}
            <div className="text-xs text-gray-600 p-3 bg-purple-50 rounded-lg">
              <p><strong>ZIP分析の利点:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>プライベートリポジトリ対応</li>
                <li>インターネット接続不要</li>
                <li>ローカルプロジェクトの分析</li>
                <li>機密コードも安全に分析</li>
              </ul>
            </div>
          </div>
        )}

        {/* 機能説明 */}
        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-3">ローカル分析の特徴</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">無制限アクセス</Badge>
              </div>
              <p className="text-sm text-gray-600">
                GitHub API制限を完全回避し、全ファイルを詳細分析
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">プライバシー保護</Badge>
              </div>
              <p className="text-sm text-gray-600">
                ローカル処理により機密情報も安全に分析
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}