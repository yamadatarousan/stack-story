import { TechStackItem, FlowNode, FlowEdge } from '@/types';

/**
 * 技術スタックからReact Flowノードとエッジを生成
 */
export function createFlowElements(techStack: TechStackItem[]): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  // カテゴリーごとにグループ化
  const categories = techStack.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, TechStackItem[]>);

  // カテゴリーの配置設定
  const categoryPositions: Record<string, { x: number; y: number; color: string }> = {
    language: { x: 100, y: 100, color: '#8B5CF6' },
    framework: { x: 300, y: 100, color: '#3B82F6' },
    library: { x: 500, y: 200, color: '#10B981' },
    tool: { x: 300, y: 300, color: '#F59E0B' },
    database: { x: 100, y: 300, color: '#EF4444' },
    service: { x: 500, y: 100, color: '#06B6D4' },
  };

  let nodeId = 0;

  // カテゴリーノードの作成
  Object.entries(categories).forEach(([category, items]) => {
    const position = categoryPositions[category] || { x: 200, y: 200, color: '#6B7280' };
    
    // カテゴリーヘッダーノード
    nodes.push({
      id: `category-${category}`,
      type: 'category',
      position: { x: position.x, y: position.y },
      data: {
        label: category.charAt(0).toUpperCase() + category.slice(1),
        category,
        color: position.color,
      },
    });

    // 技術アイテムノード
    items.forEach((tech, index) => {
      const techNodeId = `tech-${nodeId++}`;
      const yOffset = 80 + (index * 70);
      
      nodes.push({
        id: techNodeId,
        type: 'tech',
        position: { x: position.x, y: position.y + yOffset },
        data: {
          label: tech.name,
          description: tech.description,
          version: tech.version,
          confidence: tech.confidence,
          category: tech.category,
          color: position.color,
        },
      });

      // カテゴリーと技術を繋ぐエッジ
      edges.push({
        id: `edge-${category}-${techNodeId}`,
        source: `category-${category}`,
        target: techNodeId,
        type: 'smoothstep',
        animated: false,
      });
    });
  });

  // 技術間の関係性を作成（フレームワークと言語、ライブラリとフレームワーク等）
  createTechRelationships(techStack, nodes, edges);

  return { nodes, edges };
}

/**
 * 技術間の関係性エッジを作成
 */
function createTechRelationships(
  techStack: TechStackItem[],
  nodes: FlowNode[],
  edges: FlowEdge[]
): void {
  const techNodes = nodes.filter(node => node.type === 'tech');
  
  // 一般的な技術関係のマッピング
  const relationships: Record<string, string[]> = {
    'React': ['TypeScript', 'JavaScript', 'Next.js'],
    'Next.js': ['React', 'TypeScript'],
    'Vue.js': ['TypeScript', 'JavaScript', 'Nuxt.js'],
    'Nuxt.js': ['Vue.js', 'TypeScript'],
    'Angular': ['TypeScript', 'RxJS'],
    'TypeScript': ['JavaScript'],
    'Prisma': ['PostgreSQL', 'MySQL', 'SQLite'],
    'Jest': ['TypeScript', 'JavaScript'],
    'Tailwind CSS': ['PostCSS'],
    'Webpack': ['Babel'],
    'Vite': ['TypeScript', 'JavaScript'],
  };

  techNodes.forEach(sourceNode => {
    const sourceTech = sourceNode.data.label;
    const relatedTechs = relationships[sourceTech] || [];
    
    relatedTechs.forEach(relatedTech => {
      const targetNode = techNodes.find(node => node.data.label === relatedTech);
      if (targetNode && sourceNode.id !== targetNode.id) {
        const edgeId = `relationship-${sourceNode.id}-${targetNode.id}`;
        
        // 既存のエッジがないかチェック
        if (!edges.some(edge => edge.id === edgeId)) {
          edges.push({
            id: edgeId,
            source: sourceNode.id,
            target: targetNode.id,
            type: 'straight',
            animated: true,
            label: 'uses',
          });
        }
      }
    });
  });
}

/**
 * 自動レイアウト - より良い配置を計算
 */
export function autoLayout(nodes: FlowNode[]): FlowNode[] {
  const categories = ['language', 'framework', 'library', 'tool', 'database', 'service'];
  const nodesPerRow = 3;
  const nodeSpacing = { x: 200, y: 150 };
  const categorySpacing = { x: 50, y: 50 };

  return nodes.map(node => {
    if (node.type === 'category') {
      const categoryIndex = categories.indexOf(node.data.category || '');
      const row = Math.floor(categoryIndex / nodesPerRow);
      const col = categoryIndex % nodesPerRow;
      
      return {
        ...node,
        position: {
          x: col * (nodeSpacing.x * 2) + categorySpacing.x,
          y: row * (nodeSpacing.y * 2) + categorySpacing.y,
        },
      };
    }

    // 技術ノードはカテゴリーノードの下に配置
    const categoryNode = nodes.find(n => n.id === `category-${node.data.category}`);
    if (categoryNode) {
      const categoryTechs = nodes.filter(n => 
        n.type === 'tech' && n.data.category === node.data.category
      );
      const techIndex = categoryTechs.findIndex(n => n.id === node.id);
      
      return {
        ...node,
        position: {
          x: categoryNode.position.x + (techIndex % 2) * 120,
          y: categoryNode.position.y + nodeSpacing.y + Math.floor(techIndex / 2) * 60,
        },
      };
    }

    return node;
  });
}

/**
 * ノードの色を信頼度に基づいて調整
 */
export function getNodeColor(confidence: number, baseColor: string): string {
  const opacity = Math.max(0.4, confidence);
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * 検索フィルターに基づいてノードの表示/非表示を制御
 */
export function filterNodes(
  nodes: FlowNode[],
  searchTerm: string,
  selectedCategories: string[]
): FlowNode[] {
  if (!searchTerm && selectedCategories.length === 0) {
    return nodes;
  }

  return nodes.map(node => {
    let isVisible = true;

    // カテゴリーフィルター
    if (selectedCategories.length > 0 && node.data.category) {
      isVisible = selectedCategories.includes(node.data.category);
    }

    // 検索フィルター
    if (searchTerm && isVisible) {
      const searchLower = searchTerm.toLowerCase();
      isVisible = Boolean(
        node.data.label.toLowerCase().includes(searchLower) ||
        (node.data.description && node.data.description.toLowerCase().includes(searchLower))
      );
    }

    return {
      ...node,
      hidden: !isVisible,
    } as FlowNode;
  });
}