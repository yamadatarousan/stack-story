import { SelfImprovement, AIRecommendation } from './self-analyzer';
import type { SelfAnalysisResult } from './self-analyzer';
import { AnalysisResult } from '@/types';

interface AIImprovementRequest {
  analysisResult: SelfAnalysisResult;
  improvementTargets: string[]; // 'performance', 'security', 'ux', etc.
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeConstraints: 'immediate' | 'weekly' | 'monthly';
}

interface AIGeneratedCode {
  id: string;
  filePath: string;
  originalCode: string;
  improvedCode: string;
  changeDescription: string;
  riskAssessment: 'low' | 'medium' | 'high';
  testCases?: string[];
  reviewNotes: string;
}

interface AIImprovementPlan {
  id: string;
  title: string;
  description: string;
  generatedCode: AIGeneratedCode[];
  implementationSteps: string[];
  riskMitigation: string[];
  rollbackPlan: string;
  estimatedImpact: {
    performance: number; // -100 to 100
    security: number;
    maintainability: number;
    userExperience: number;
  };
  validationCriteria: string[];
}

export class AIImprovementEngine {
  private openaiApiKey: string | undefined;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async generateImprovementPlan(request: AIImprovementRequest): Promise<AIImprovementPlan[]> {
    console.log('🤖 AI改善エンジンを開始します...');
    
    const plans: AIImprovementPlan[] = [];
    
    // 1. 優先度の高い改善項目を特定
    const prioritizedImprovements = this.prioritizeImprovements(
      request.analysisResult.selfImprovements,
      request.improvementTargets,
      request.riskTolerance
    );

    // 2. 各改善項目に対してAI駆動の実装計画を生成
    for (const improvement of prioritizedImprovements.slice(0, 3)) { // 上位3項目
      const plan = await this.generateSpecificImprovementPlan(
        improvement,
        request.analysisResult,
        request.riskTolerance
      );
      plans.push(plan);
    }

    console.log(`✅ ${plans.length}個の改善計画を生成しました`);
    return plans;
  }

  private prioritizeImprovements(
    improvements: SelfImprovement[],
    targets: string[],
    riskTolerance: string
  ): SelfImprovement[] {
    return improvements
      .filter(imp => targets.includes(imp.category))
      .filter(imp => {
        if (riskTolerance === 'conservative') return imp.impact !== 'critical';
        if (riskTolerance === 'moderate') return true;
        return true; // aggressive accepts all
      })
      .sort((a, b) => {
        // 自動化可能 + 高優先度 + 低工数を優先
        const scoreA = (a.automatable ? 3 : 0) + a.priority + (a.effort === 'small' ? 2 : 0);
        const scoreB = (b.automatable ? 3 : 0) + b.priority + (b.effort === 'small' ? 2 : 0);
        return scoreB - scoreA;
      });
  }

  private async generateSpecificImprovementPlan(
    improvement: SelfImprovement,
    analysisResult: SelfAnalysisResult,
    riskTolerance: string
  ): Promise<AIImprovementPlan> {
    const planId = `ai-plan-${improvement.id}-${Date.now()}`;
    
    // 改善の種類に応じた具体的なコード生成
    const generatedCode = await this.generateCodeImprovements(improvement, analysisResult);
    
    return {
      id: planId,
      title: `AI改善計画: ${improvement.title}`,
      description: this.generateDetailedDescription(improvement),
      generatedCode,
      implementationSteps: this.generateImplementationSteps(improvement),
      riskMitigation: this.generateRiskMitigation(improvement, riskTolerance),
      rollbackPlan: this.generateRollbackPlan(improvement),
      estimatedImpact: this.estimateImpact(improvement),
      validationCriteria: this.generateValidationCriteria(improvement)
    };
  }

  private async generateCodeImprovements(
    improvement: SelfImprovement,
    analysisResult: SelfAnalysisResult
  ): Promise<AIGeneratedCode[]> {
    const codeImprovements: AIGeneratedCode[] = [];

    switch (improvement.category) {
      case 'performance':
        codeImprovements.push(...await this.generatePerformanceImprovements(improvement));
        break;
      case 'security':
        codeImprovements.push(...await this.generateSecurityImprovements(improvement));
        break;
      case 'ux':
        codeImprovements.push(...await this.generateUXImprovements(improvement));
        break;
      case 'code-quality':
        codeImprovements.push(...await this.generateCodeQualityImprovements(improvement));
        break;
      default:
        codeImprovements.push(...await this.generateGenericImprovements(improvement));
    }

    return codeImprovements;
  }

  private async generatePerformanceImprovements(improvement: SelfImprovement): Promise<AIGeneratedCode[]> {
    if (improvement.id === 'perf-1') {
      return [{
        id: 'perf-code-1',
        filePath: 'src/components/visualizer/optimized-tech-stack-visualizer.tsx',
        originalCode: '// 元のReact Flowコンポーネント',
        improvedCode: `'use client';

import { lazy, Suspense, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TechStackItem } from '@/types';

// 遅延読み込みでサブコンポーネントを分割
const ReactFlowRenderer = lazy(() => import('./react-flow-renderer'));
const TechStackMinimap = lazy(() => import('./tech-stack-minimap'));
const TechStackControls = lazy(() => import('./tech-stack-controls'));

interface OptimizedTechStackVisualizerProps {
  techStack: TechStackItem[];
  enableMinimap?: boolean;
  enableControls?: boolean;
}

export default function OptimizedTechStackVisualizer({ 
  techStack, 
  enableMinimap = true,
  enableControls = true 
}: OptimizedTechStackVisualizerProps) {
  // メモ化で再計算を防ぐ
  const processedData = useMemo(() => {
    return techStack.filter(item => item.confidence > 0.5);
  }, [techStack]);

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>技術スタック可視化 (最適化版)</CardTitle>
        <CardDescription>
          パフォーマンス最適化されたインタラクティブな技術構成図
        </CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        <Suspense fallback={<LoadingFallback />}>
          <ReactFlowRenderer data={processedData} />
        </Suspense>
        
        {enableMinimap && (
          <Suspense fallback={null}>
            <TechStackMinimap />
          </Suspense>
        )}
        
        {enableControls && (
          <Suspense fallback={null}>
            <TechStackControls />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}`,
        changeDescription: 'React Flowコンポーネントを細分化し、遅延読み込みとメモ化でパフォーマンスを向上',
        riskAssessment: 'low',
        testCases: [
          'コンポーネントの正常レンダリング',
          '遅延読み込みの動作確認',
          'メモ化の効果測定'
        ],
        reviewNotes: '既存のプロップスインターフェースを維持しつつ最適化。後方互換性確保済み。'
      }];
    }
    return [];
  }

  private async generateSecurityImprovements(improvement: SelfImprovement): Promise<AIGeneratedCode[]> {
    if (improvement.id === 'sec-1') {
      return [{
        id: 'sec-code-1',
        filePath: 'src/lib/secure-api-client.ts',
        originalCode: '// 既存のクライアントサイドAPI呼び出し',
        improvedCode: `// セキュアなAPIクライアント実装
export class SecureApiClient {
  private baseUrl: string;
  private sessionToken?: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers);
    
    // CSRFトークンの自動付与
    const csrfToken = await this.getCSRFToken();
    headers.set('X-CSRF-Token', csrfToken);
    
    // セッションベースの認証
    if (this.sessionToken) {
      headers.set('Authorization', \`Bearer \${this.sessionToken}\`);
    }

    // 機密情報のクライアントサイド露出を防ぐ
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      ...options,
      headers,
      credentials: 'same-origin', // CSRF攻撃対策
      mode: 'same-origin' // 同一オリジン制限
    });

    if (!response.ok) {
      throw new SecurityError(
        \`API request failed: \${response.status}\`,
        response.status
      );
    }

    return response.json();
  }

  private async getCSRFToken(): Promise<string> {
    const response = await fetch('/api/csrf-token');
    const { token } = await response.json();
    return token;
  }
}

class SecurityError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'SecurityError';
  }
}`,
        changeDescription: 'APIキーのクライアントサイド露出を防ぎ、CSRF対策とセッション管理を強化',
        riskAssessment: 'medium',
        testCases: [
          'CSRF攻撃のシミュレーション',
          'セッション管理の動作確認',
          'API呼び出しの正常性テスト'
        ],
        reviewNotes: '既存のAPI呼び出しを段階的に移行。セキュリティレビュー必須。'
      }];
    }
    return [];
  }

  private async generateUXImprovements(improvement: SelfImprovement): Promise<AIGeneratedCode[]> {
    if (improvement.id === 'ux-1') {
      return [{
        id: 'ux-code-1',
        filePath: 'src/components/analyzer/progressive-analysis-display.tsx',
        originalCode: '// 既存の一括表示コンポーネント',
        improvedCode: `'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';

interface ProgressiveAnalysisDisplayProps {
  analysisResult: AnalysisResult;
  onSectionComplete?: (section: string) => void;
}

type AnalysisSection = {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // seconds
  component: React.ComponentType<any>;
  dependencies?: string[];
};

export default function ProgressiveAnalysisDisplay({ 
  analysisResult, 
  onSectionComplete 
}: ProgressiveAnalysisDisplayProps) {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const analysisSections: AnalysisSection[] = [
    {
      id: 'overview',
      title: 'プロジェクト概要',
      description: '基本情報と構造の分析',
      estimatedTime: 2,
      component: lazy(() => import('./analysis-overview'))
    },
    {
      id: 'techstack',
      title: '技術スタック',
      description: '使用技術の特定と評価',
      estimatedTime: 3,
      component: lazy(() => import('./tech-stack-display')),
      dependencies: ['overview']
    },
    {
      id: 'quality',
      title: 'コード品質',
      description: '品質問題の分析',
      estimatedTime: 5,
      component: lazy(() => import('./deep-analysis-results')),
      dependencies: ['techstack']
    },
    {
      id: 'narrative',
      title: '詳細レポート',
      description: '包括的な改善提案',
      estimatedTime: 4,
      component: lazy(() => import('./narrative-report-display')),
      dependencies: ['quality']
    }
  ];

  useEffect(() => {
    const revealSections = async () => {
      for (const section of analysisSections) {
        // 依存関係のチェック
        const canReveal = !section.dependencies || 
          section.dependencies.every(dep => completedSections.has(dep));
        
        if (!canReveal) continue;

        setCurrentSection(section.id);
        
        // プログレッシブ表示のシミュレーション
        await new Promise(resolve => setTimeout(resolve, section.estimatedTime * 1000));
        
        setCompletedSections(prev => new Set([...prev, section.id]));
        setProgress(prev => prev + (100 / analysisSections.length));
        onSectionComplete?.(section.id);
      }
      setCurrentSection(null);
    };

    revealSections();
  }, [analysisResult]);

  return (
    <div className="space-y-6">
      {/* 全体進捗 */}
      <Card>
        <CardHeader>
          <CardTitle>分析進行状況</CardTitle>
          <CardDescription>
            段階的に結果を表示しています。各セクションは前の分析完了後に表示されます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-gray-600">
            {completedSections.size} / {analysisSections.length} セクション完了
          </p>
        </CardContent>
      </Card>

      {/* セクション別表示 */}
      {analysisSections.map(section => {
        const isCompleted = completedSections.has(section.id);
        const isCurrent = currentSection === section.id;
        const isLocked = section.dependencies && 
          !section.dependencies.every(dep => completedSections.has(dep));

        return (
          <Card key={section.id} className={
            \`transition-all duration-500 \${
              isCompleted ? 'opacity-100' : 
              isCurrent ? 'opacity-80' : 
              isLocked ? 'opacity-30' : 'opacity-60'
            }\`
          }>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                {section.title}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            
            {(isCompleted || isCurrent) && (
              <CardContent>
                <Suspense fallback={<div>読み込み中...</div>}>
                  <section.component result={analysisResult} />
                </Suspense>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}`,
        changeDescription: '分析結果を段階的に表示し、ユーザーエンゲージメントを向上',
        riskAssessment: 'low',
        testCases: [
          '段階表示のタイミング',
          '依存関係の正常動作',
          'ユーザビリティテスト'
        ],
        reviewNotes: 'UXの大幅改善が期待される。A/Bテストでの効果測定を推奨。'
      }];
    }
    return [];
  }

  private async generateCodeQualityImprovements(improvement: SelfImprovement): Promise<AIGeneratedCode[]> {
    return [{
      id: 'quality-code-1',
      filePath: 'tsconfig.json',
      originalCode: `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false
  }
}`,
      improvedCode: `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}`,
      changeDescription: 'TypeScript strict モードと追加の型チェックを有効化',
      riskAssessment: 'medium',
      reviewNotes: '段階的な導入が必要。既存コードの型エラー修正が必要。'
    }];
  }

  private async generateGenericImprovements(improvement: SelfImprovement): Promise<AIGeneratedCode[]> {
    return [{
      id: 'generic-code-1',
      filePath: improvement.requiredFiles[0] || 'src/components/generic-improvement.tsx',
      originalCode: '// 既存コード',
      improvedCode: '// 改善されたコード（具体的な実装は改善内容による）',
      changeDescription: improvement.description,
      riskAssessment: 'medium',
      reviewNotes: '具体的な実装内容は改善項目の詳細に基づく'
    }];
  }

  private generateDetailedDescription(improvement: SelfImprovement): string {
    return `
${improvement.description}

**ビジネス価値:** ${improvement.businessValue}

**技術的詳細:**
- カテゴリ: ${improvement.category}
- 工数: ${improvement.effort}
- 所要時間: ${improvement.estimatedTime}
- 自動化可能: ${improvement.automatable ? 'はい' : 'いいえ'}

**対象ファイル:**
${improvement.requiredFiles.map(file => `- ${file}`).join('\n')}
`;
  }

  private generateImplementationSteps(improvement: SelfImprovement): string[] {
    const baseSteps = [
      '現在のコードベースのバックアップ作成',
      '改善対象の詳細分析',
      '実装計画の策定'
    ];

    if (improvement.automatable) {
      baseSteps.push(
        'AI による自動コード生成',
        '生成されたコードの人間によるレビュー',
        'テスト実行と品質チェック'
      );
    } else {
      baseSteps.push(
        '手動実装の実行',
        'コードレビューの実施',
        '段階的なテストとデプロイ'
      );
    }

    baseSteps.push(
      '本番環境への段階的デプロイ',
      '効果測定とフィードバック収集'
    );

    return baseSteps;
  }

  private generateRiskMitigation(improvement: SelfImprovement, riskTolerance: string): string[] {
    const baseMitigations = [
      'Git による変更履歴の管理',
      '段階的なロールアウト',
      '自動テストの実行'
    ];

    if (riskTolerance === 'conservative') {
      baseMitigations.push(
        '本番環境前の staging 環境での十分なテスト',
        '複数人によるコードレビュー',
        '即座のロールバック計画'
      );
    }

    if (improvement.impact === 'critical' || improvement.category === 'security') {
      baseMitigations.push(
        'セキュリティ監査の実施',
        '外部専門家によるレビュー',
        'ペネトレーションテストの実行'
      );
    }

    return baseMitigations;
  }

  private generateRollbackPlan(improvement: SelfImprovement): string {
    return `
1. **即座のロールバック:**
   - Git revert を使用した変更の取り消し
   - デプロイメントパイプラインの自動ロールバック

2. **段階的復旧:**
   - 影響範囲の特定と隔離
   - 部分的な機能無効化
   - 旧バージョンへの段階的移行

3. **データ整合性の確保:**
   - データベース変更の逆転
   - キャッシュの無効化とクリア
   - セッション情報の再構築

4. **モニタリングと検証:**
   - システム状態の継続監視
   - 機能の正常性確認
   - ユーザー影響の評価
`;
  }

  private estimateImpact(improvement: SelfImprovement) {
    const baseImpact = {
      performance: 0,
      security: 0,
      maintainability: 0,
      userExperience: 0
    };

    switch (improvement.category) {
      case 'performance':
        baseImpact.performance = 75;
        baseImpact.userExperience = 50;
        break;
      case 'security':
        baseImpact.security = 80;
        baseImpact.maintainability = 30;
        break;
      case 'ux':
        baseImpact.userExperience = 90;
        baseImpact.performance = 20;
        break;
      case 'code-quality':
        baseImpact.maintainability = 85;
        baseImpact.performance = 25;
        break;
      case 'feature':
        baseImpact.userExperience = 70;
        baseImpact.maintainability = -10; // 複雑性増加
        break;
      case 'architecture':
        baseImpact.maintainability = 90;
        baseImpact.performance = 40;
        break;
    }

    // 工数による調整
    const effortMultiplier = {
      small: 0.7,
      medium: 1.0,
      large: 1.3
    }[improvement.effort];

    Object.keys(baseImpact).forEach(key => {
      baseImpact[key as keyof typeof baseImpact] *= effortMultiplier;
    });

    return baseImpact;
  }

  private generateValidationCriteria(improvement: SelfImprovement): string[] {
    const baseCriteria = [
      'ビルドプロセスの成功',
      '既存テストの全通過',
      'パフォーマンステストの基準値クリア'
    ];

    switch (improvement.category) {
      case 'performance':
        baseCriteria.push(
          'ページ読み込み時間の測定',
          'Lighthouse スコアの改善確認',
          'メモリ使用量の最適化確認'
        );
        break;
      case 'security':
        baseCriteria.push(
          'セキュリティスキャンの通過',
          'ペネトレーションテストの実施',
          'コンプライアンスチェックの通過'
        );
        break;
      case 'ux':
        baseCriteria.push(
          'ユーザビリティテストの実施',
          'A/B テストでの効果確認',
          'アクセシビリティ監査の通過'
        );
        break;
    }

    return baseCriteria;
  }
}

export type { AIImprovementRequest, AIGeneratedCode, AIImprovementPlan };