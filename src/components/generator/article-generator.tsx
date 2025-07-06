'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/toast';
import { 
  FileText, 
  Download, 
  Copy, 
  Eye, 
  Settings,
  Sparkles,
  Clock,
  Hash,
  BarChart3
} from 'lucide-react';
import { AnalysisResult, GeneratedArticle } from '@/types';

interface ArticleGeneratorProps {
  analysisResult: AnalysisResult;
  onArticleGenerated?: (article: GeneratedArticle) => void;
}

const templates = [
  {
    id: 'standard',
    name: '標準的な技術解説',
    description: 'バランスの取れた一般的な技術記事',
    icon: '📄',
  },
  {
    id: 'beginner',
    name: '初心者向け解説',
    description: '技術初心者にも分かりやすい構成',
    icon: '🎓',
  },
  {
    id: 'architecture',
    name: 'アーキテクチャ重視',
    description: 'システム設計に焦点を当てた記事',
    icon: '🏗️',
  },
];

export default function ArticleGenerator({ 
  analysisResult, 
  onArticleGenerated 
}: ArticleGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { success, error: showError } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisResult,
          templateId: selectedTemplate,
          type: 'article',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate article');
      }

      setGeneratedArticle(data.data);
      setShowPreview(true);
      onArticleGenerated?.(data.data);
      success('記事生成完了', '技術記事が正常に生成されました');
    } catch (err) {
      console.error('Article generation error:', err);
      showError('生成エラー', err instanceof Error ? err.message : '記事生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedArticle) return;

    try {
      await navigator.clipboard.writeText(generatedArticle.markdown);
      success('コピー完了', 'Markdownがクリップボードにコピーされました');
    } catch (err) {
      showError('コピーエラー', 'クリップボードへのコピーに失敗しました');
    }
  };

  const handleDownload = () => {
    if (!generatedArticle) return;

    const blob = new Blob([generatedArticle.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysisResult.repository.name}-tech-article.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return '不明';
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI記事生成
          </CardTitle>
          <CardDescription>
            分析結果から技術記事を自動生成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selection */}
          <div>
            <h4 className="text-sm font-medium mb-3">記事テンプレート</h4>
            <div className="grid gap-3">
              {templates.map((template) => (
                <label
                  key={template.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={selectedTemplate === template.id}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{template.icon}</span>
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">記事を生成中...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                記事を生成
              </>
            )}
          </Button>

          {/* Estimated Time */}
          {isGenerating && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                推定時間: 30-60秒
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Article */}
      {generatedArticle && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  生成された記事
                </CardTitle>
                <CardDescription>{generatedArticle.title}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? '非表示' : 'プレビュー'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  コピー
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  ダウンロード
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Article Metadata */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 text-sm">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">文字数:</span>
                <span className="font-medium">{generatedArticle.metadata.wordCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">読了時間:</span>
                <span className="font-medium">{generatedArticle.metadata.readingTime}分</span>
              </div>
              <Badge 
                variant="secondary" 
                className={getDifficultyColor(generatedArticle.metadata.difficulty)}
              >
                {getDifficultyText(generatedArticle.metadata.difficulty)}
              </Badge>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">タグ:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {generatedArticle.metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Article Preview */}
            {showPreview && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  記事プレビュー
                </h4>
                <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: generatedArticle.content
                        .replace(/^# /gm, '## ')
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}