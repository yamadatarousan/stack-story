'use client';

import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ConnectionMode,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { TechStackItem } from '@/types';
import { createFlowElements, autoLayout, filterNodes } from '@/lib/flow-utils';
import { nodeTypes } from './custom-nodes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Search, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

interface TechStackVisualizerProps {
  techStack: TechStackItem[];
}

export default function TechStackVisualizer({ techStack }: TechStackVisualizerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 初期化
  useEffect(() => {
    if (techStack.length > 0) {
      const { nodes: initialNodes, edges: initialEdges } = createFlowElements(techStack);
      const layoutedNodes = autoLayout(initialNodes);
      
      setNodes(layoutedNodes);
      setEdges(initialEdges);
    }
  }, [techStack, setNodes, setEdges]);

  // フィルタリング
  useEffect(() => {
    if (techStack.length > 0) {
      const { nodes: initialNodes, edges: initialEdges } = createFlowElements(techStack);
      const layoutedNodes = autoLayout(initialNodes);
      const filteredNodes = filterNodes(layoutedNodes, searchTerm, selectedCategories);
      
      setNodes(filteredNodes);
      setEdges(initialEdges);
    }
  }, [searchTerm, selectedCategories, techStack, setNodes, setEdges]);

  const resetView = useCallback(() => {
    setSearchTerm('');
    setSelectedCategories([]);
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const categories = Array.from(new Set(techStack.map(tech => tech.category)));

  if (techStack.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Technology Visualization
          </CardTitle>
          <CardDescription>No technologies to visualize</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Technology Stack Visualization
            </CardTitle>
            <CardDescription>
              Interactive diagram showing {techStack.length} technologies and their relationships
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Controls */}
        <div className="p-4 border-b bg-gray-50/50 space-y-3">
          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Categories:</span>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category)}
                className="h-6 text-xs"
              >
                {selectedCategories.includes(category) ? (
                  <Eye className="w-3 h-3 mr-1" />
                ) : (
                  <EyeOff className="w-3 h-3 mr-1" />
                )}
                {category}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {techStack.filter(tech => tech.category === category).length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* React Flow */}
        <div className={`relative ${isFullscreen ? 'h-screen' : 'h-96'} bg-gray-50`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            fitViewOptions={{
              padding: 0.2,
              includeHiddenNodes: false,
            }}
            minZoom={0.2}
            maxZoom={2}
            defaultEdgeOptions={{
              style: { strokeWidth: 2, stroke: '#94a3b8' },
            }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={16} 
              size={1}
              color="#e2e8f0"
            />
            <Controls 
              showInteractive={false}
              className="bg-white border border-gray-200"
            />
            <MiniMap 
              nodeColor={(node: Node) => {
                if (node.type === 'category') return node.data.color;
                if (node.type === 'tech') return '#f1f5f9';
                return '#e2e8f0';
              }}
              nodeStrokeWidth={2}
              className="bg-white border border-gray-200"
            />
          </ReactFlow>
        </div>

        {/* Legend */}
        <div className="p-4 border-t bg-gray-50/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category) => {
              const categoryTechs = techStack.filter(tech => tech.category === category);
              const avgConfidence = categoryTechs.reduce((sum, tech) => sum + tech.confidence, 0) / categoryTechs.length;
              
              return (
                <div key={category} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ 
                      backgroundColor: getCategoryColor(category),
                      borderColor: getCategoryColor(category),
                    }}
                  />
                  <span className="font-medium">{category}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(avgConfidence * 100)}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    language: '#8B5CF6',
    framework: '#3B82F6',
    library: '#10B981',
    tool: '#F59E0B',
    database: '#EF4444',
    service: '#06B6D4',
  };
  return colors[category] || '#6B7280';
}