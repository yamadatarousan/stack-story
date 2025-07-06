'use client';

import { TechStackItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Gauge } from 'lucide-react';

interface TechStackDisplayProps {
  techStack: TechStackItem[];
}

export default function TechStackDisplay({ techStack }: TechStackDisplayProps) {
  const groupedStack = techStack.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TechStackItem[]>);

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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      framework: 'bg-blue-100 text-blue-800',
      library: 'bg-green-100 text-green-800',
      tool: 'bg-orange-100 text-orange-800',
      language: 'bg-purple-100 text-purple-800',
      database: 'bg-red-100 text-red-800',
      service: 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  if (techStack.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Technology Stack
          </CardTitle>
          <CardDescription>No technologies detected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Technology Stack
        </CardTitle>
        <CardDescription>
          Detected {techStack.length} technologies across {Object.keys(groupedStack).length} categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedStack)
          .sort(([a], [b]) => {
            const order = ['framework', 'language', 'library', 'tool', 'database', 'service'];
            return order.indexOf(a) - order.indexOf(b);
          })
          .map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <span>{getCategoryIcon(category)}</span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <Badge variant="outline" className="ml-auto">
                  {items.length}
                </Badge>
              </h3>
              <div className="grid gap-3">
                {items
                  .sort((a, b) => b.confidence - a.confidence)
                  .map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.version && (
                            <Badge variant="outline" className="text-xs">
                              {item.version}
                            </Badge>
                          )}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getCategoryColor(item.category)}`}
                          >
                            {item.category}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-gray-400" />
                          <span className={`text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                            {getConfidenceText(item.confidence)}
                          </span>
                        </div>
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.confidence >= 0.8 ? 'bg-green-500' :
                              item.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}