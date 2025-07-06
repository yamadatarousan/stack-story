'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Gauge } from 'lucide-react';

// Tech Node - 個別の技術を表示
export function TechNode({ data }: NodeProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="min-w-[180px] shadow-md border-2" style={{ borderColor: data.color }}>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm truncate">{data.label}</h3>
            {data.version && (
              <Badge variant="outline" className="text-xs">
                {data.version}
              </Badge>
            )}
          </div>
          
          {data.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{data.description}</p>
          )}
          
          {data.confidence && (
            <div className="flex items-center gap-2">
              <Gauge className="w-3 h-3 text-gray-400" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {getConfidenceText(data.confidence)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(data.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full ${getConfidenceColor(data.confidence).split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`}
                    style={{ width: `${data.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </Card>
  );
}

// Category Node - 技術カテゴリーを表示
export function CategoryNode({ data }: NodeProps) {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      framework: '🚀',
      library: '📚',
      tool: '🔧',
      language: '💻',
      database: '🗄️',
      service: '☁️',
    };
    return icons[category] || '📦';
  };

  return (
    <Card 
      className="min-w-[120px] shadow-lg border-2 bg-gradient-to-br from-white to-gray-50" 
      style={{ borderColor: data.color }}
    >
      <CardContent className="p-4 text-center">
        <div className="space-y-2">
          <div className="text-2xl">{getCategoryIcon(data.category)}</div>
          <h3 
            className="font-bold text-sm"
            style={{ color: data.color }}
          >
            {data.label}
          </h3>
        </div>
      </CardContent>
      
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </Card>
  );
}

// Connection Node - 技術間の関係を表示（オプション）
export function ConnectionNode({ data }: NodeProps) {
  return (
    <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full shadow-md">
      <div className="w-2 h-2 bg-gray-400 rounded-full" />
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

// ノードタイプのマッピング
export const nodeTypes = {
  tech: TechNode,
  category: CategoryNode,
  connection: ConnectionNode,
};