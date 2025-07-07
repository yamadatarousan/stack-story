'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
import { Upload, FileText, Zap } from 'lucide-react';
import { TechStackItem, AnalysisResult } from '@/types';

interface OfflineAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export default function OfflineAnalyzer({ onAnalysisComplete }: OfflineAnalyzerProps) {
  const [packageJson, setPackageJson] = useState('');
  const [projectInfo, setProjectInfo] = useState({
    name: '',
    description: '',
  });
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeOffline = () => {
    setAnalyzing(true);
    
    try {
      const techStack: TechStackItem[] = [];
      
      if (packageJson.trim()) {
        const pkg = JSON.parse(packageJson);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        // 基本的な技術スタック検出
        Object.entries(allDeps).forEach(([name, version]) => {
          const tech = getTechInfo(name, version as string);
          if (tech) {
            techStack.push(tech);
          }
        });
      }
      
      // モック分析結果を作成
      const result: AnalysisResult = {
        repository: {
          id: Date.now(),
          name: projectInfo.name || 'オフライン分析プロジェクト',
          full_name: `offline/${projectInfo.name || 'project'}`,
          description: projectInfo.description || 'オフライン分析されたプロジェクト',
          html_url: '#',
          language: 'JavaScript',
          stargazers_count: 0,
          forks_count: 0,
          updated_at: new Date().toISOString(),
          default_branch: 'main',
          owner: {
            login: 'offline',
            avatar_url: '',
            html_url: '#',
          },
        },
        techStack,
        dependencies: [],
        structure: {
          type: 'web',
          language: 'JavaScript',
          hasTests: false,
          hasDocumentation: false,
          hasCI: false,
        },
        detectedFiles: [],
        summary: `${techStack.length}個の技術を使用したプロジェクトです。`,
      };
      
      setTimeout(() => {
        setAnalyzing(false);
        onAnalysisComplete(result);
      }, 1000);
      
    } catch (error) {
      console.error('Offline analysis error:', error);
      setAnalyzing(false);
      alert('JSONの形式が正しくありません。package.jsonの内容を確認してください。');
    }
  };

  const getTechInfo = (name: string, version: string): TechStackItem | null => {
    const techMap: Record<string, Omit<TechStackItem, 'version'>> = {
      'react': {
        name: 'React',
        category: 'フレームワーク',
        description: 'ユーザーインターフェース構築用JavaScriptライブラリ',
        confidence: 0.95,
      },
      'next': {
        name: 'Next.js',
        category: 'フレームワーク',
        description: 'React用のフルスタックフレームワーク',
        confidence: 0.95,
      },
      'vue': {
        name: 'Vue.js',
        category: 'フレームワーク',
        description: 'プログレッシブJavaScriptフレームワーク',
        confidence: 0.95,
      },
      'typescript': {
        name: 'TypeScript',
        category: '言語',
        description: 'JavaScriptに静的型付けを追加した言語',
        confidence: 0.9,
      },
      'tailwindcss': {
        name: 'Tailwind CSS',
        category: 'スタイリング',
        description: 'ユーティリティファーストCSSフレームワーク',
        confidence: 0.9,
      },
      'express': {
        name: 'Express.js',
        category: 'バックエンド',
        description: 'Node.js用の軽量Webアプリケーションフレームワーク',
        confidence: 0.9,
      },
      'jest': {
        name: 'Jest',
        category: 'テスト',
        description: 'JavaScript用テスティングフレームワーク',
        confidence: 0.8,
      },
      'eslint': {
        name: 'ESLint',
        category: 'ツール',
        description: 'JavaScriptコード品質管理ツール',
        confidence: 0.8,
      },
      'prettier': {
        name: 'Prettier',
        category: 'ツール',
        description: 'コードフォーマッター',
        confidence: 0.8,
      },
      'webpack': {
        name: 'Webpack',
        category: 'ビルドツール',
        description: 'モジュールバンドラー',
        confidence: 0.8,
      },
      'vite': {
        name: 'Vite',
        category: 'ビルドツール',
        description: '次世代フロントエンドビルドツール',
        confidence: 0.8,
      },
    };

    const tech = techMap[name];
    if (tech) {
      return {
        ...tech,
        version,
      };
    }

    // 一般的なライブラリとして処理
    return {
      name,
      version,
      category: 'ライブラリ',
      description: `${name} ライブラリ`,
      confidence: 0.6,
    };
  };

  const loadSampleData = () => {
    setProjectInfo({
      name: 'sample-react-app',
      description: 'サンプルのReactアプリケーション',
    });
    
    setPackageJson(`{
  "name": "sample-react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^13.5.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "jest": "^29.6.0"
  }
}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          オフライン分析モード
        </CardTitle>
        <CardDescription>
          GitHubのAPI制限を回避して、package.jsonから直接分析
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
              プロジェクト名
            </label>
            <input
              id="project-name"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: my-awesome-app"
              value={projectInfo.name}
              onChange={(e) => setProjectInfo(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <input
              id="project-description"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 素晴らしいWebアプリケーション"
              value={projectInfo.description}
              onChange={(e) => setProjectInfo(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Package.json Input */}
        <div>
          <label htmlFor="package-json" className="block text-sm font-medium text-gray-700 mb-1">
            package.json の内容
          </label>
          <textarea
            id="package-json"
            placeholder="package.jsonの内容をここに貼り付けてください..."
            value={packageJson}
            onChange={(e) => setPackageJson(e.target.value)}
            rows={10}
            className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={analyzeOffline} disabled={analyzing} className="flex-1">
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                分析中...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                分析実行
              </>
            )}
          </Button>
          <Button variant="outline" onClick={loadSampleData}>
            <Upload className="w-4 h-4 mr-2" />
            サンプル
          </Button>
        </div>

        {/* Help */}
        <div className="text-xs text-gray-600 p-3 bg-blue-50 rounded-lg">
          <p><strong>使い方:</strong></p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>プロジェクトのpackage.jsonファイルを開く</li>
            <li>内容をコピーして上のテキストエリアに貼り付け</li>
            <li>「分析実行」ボタンをクリック</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}