'use client';

import { useState, lazy, Suspense } from 'react';
import { TechStackItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Network, Eye } from 'lucide-react';

// 可視化コンポーネントを遅延ロード
const TechStackVisualizer = lazy(() => import('./tech-stack-visualizer'));

interface LazyTechStackVisualizerProps {
  techStack: TechStackItem[];
}

export default function LazyTechStackVisualizer({ techStack }: LazyTechStackVisualizerProps) {
  const [showVisualizer, setShowVisualizer] = useState(false);

  if (!showVisualizer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            技術スタック可視化
          </CardTitle>
          <CardDescription>
            {techStack.length}個の技術とその関係性をインタラクティブな図表で表示
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Network className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">
              可視化を開始するにはボタンをクリックしてください
            </p>
            <Button 
              onClick={() => setShowVisualizer(true)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              可視化を表示
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Suspense 
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              技術スタック可視化
            </CardTitle>
            <CardDescription>
              可視化データ生成
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 mt-4">
                インタラクティブ図表用のデータを準備中...
              </p>
            </div>
          </CardContent>
        </Card>
      }
    >
      <TechStackVisualizer techStack={techStack} />
    </Suspense>
  );
}