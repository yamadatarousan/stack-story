'use client';

import { TechStackItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network } from 'lucide-react';

interface SimpleTechVisualizerProps {
  techStack: TechStackItem[];
}

export default function SimpleTechVisualizer({ techStack }: SimpleTechVisualizerProps) {
  console.log('SimpleTechVisualizer rendering with techStack:', techStack);

  // カテゴリーごとにグループ化
  const groupedTech = techStack.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, TechStackItem[]>);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      '言語': '#8B5CF6',
      'フレームワーク': '#3B82F6',
      'ライブラリ': '#10B981',
      'ツール': '#F59E0B',
      'データベース': '#EF4444',
      'サービス': '#06B6D4',
      'ビルドツール': '#F97316',
      'テスト': '#84CC16',
      'スタイリング': '#EC4899',
      'バックエンド': '#6366F1',
      'フロントエンド': '#14B8A6',
      'インフラ': '#EAB308',
      'CI/CD': '#8B5A2B',
      'デプロイ': '#059669',
      'セキュリティ': '#DC2626',
      'モニタリング': '#7C3AED',
      'アナリティクス': '#EA580C',
    };
    return colors[category] || '#6B7280';
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.9) return '非常に高い';
    if (confidence >= 0.7) return '高い';
    if (confidence >= 0.5) return '中程度';
    return '低い';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5" />
          技術スタック可視化（簡易版）
        </CardTitle>
        <CardDescription>
          {techStack.length}個の技術をカテゴリー別に表示
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedTech).map(([category, technologies]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                <h3 className="font-semibold text-lg">{category}</h3>
                <Badge variant="outline">{technologies.length}個</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {technologies.map((tech, index) => (
                  <div 
                    key={index}
                    className="p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    style={{ 
                      borderLeft: `4px solid ${getCategoryColor(category)}` 
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{tech.name}</h4>
                        {tech.version && (
                          <Badge variant="outline" className="text-xs">
                            {tech.version}
                          </Badge>
                        )}
                      </div>
                      
                      {tech.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {tech.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                        >
                          信頼度: {getConfidenceText(tech.confidence)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {Math.round(tech.confidence * 100)}%
                        </span>
                      </div>
                      
                      {tech.usage && (
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {tech.usage}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* 統計情報 */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{techStack.length}</div>
              <div className="text-sm text-gray-600">総技術数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(groupedTech).length}
              </div>
              <div className="text-sm text-gray-600">カテゴリー数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  techStack.reduce((sum, tech) => sum + tech.confidence, 0) / techStack.length * 100
                )}%
              </div>
              <div className="text-sm text-gray-600">平均信頼度</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {techStack.filter(tech => tech.confidence >= 0.8).length}
              </div>
              <div className="text-sm text-gray-600">高信頼度技術</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}