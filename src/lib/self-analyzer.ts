import { LocalRepoAnalyzer } from './local-repo-analyzer';
import { AnalysisResult } from '@/types';
import fs from 'fs';
import path from 'path';

interface SelfAnalysisResult extends AnalysisResult {
  selfImprovements: SelfImprovement[];
  aiRecommendations: AIRecommendation[];
  implementationPlan: ImplementationStep[];
}

interface SelfImprovement {
  id: string;
  category: 'performance' | 'security' | 'ux' | 'code-quality' | 'feature' | 'architecture';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'small' | 'medium' | 'large';
  priority: number; // 1-10
  automatable: boolean;
  requiredFiles: string[];
  estimatedTime: string;
  businessValue: string;
}

interface AIRecommendation {
  id: string;
  type: 'code-generation' | 'refactoring' | 'optimization' | 'new-feature';
  title: string;
  rationale: string;
  implementation: string;
  riskLevel: 'low' | 'medium' | 'high';
  testingRequired: boolean;
  rollbackPlan: string;
}

interface ImplementationStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  automatable: boolean;
  dependencies: string[];
  estimatedDuration: string;
  validationCriteria: string[];
}

class SelfAnalyzer {
  private projectRoot: string;
  private excludePatterns: string[] = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    'coverage',
    '__tests__',
    '*.test.*',
    '*.spec.*'
  ];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async performSelfAnalysis(): Promise<SelfAnalysisResult> {
    console.log('🔍 Starting self-analysis of Stack Story application...');
    
    // 1. 基本的なリポジトリ分析
    const analyzer = new LocalRepoAnalyzer();
    const basicAnalysis = await analyzer.analyzeFromGitUrl('file://' + this.projectRoot);
    
    // 2. セルフ改善提案の生成
    const selfImprovements = await this.generateSelfImprovements(basicAnalysis);
    
    // 3. AI推奨事項の生成
    const aiRecommendations = await this.generateAIRecommendations(basicAnalysis);
    
    // 4. 実装計画の生成
    const implementationPlan = this.generateImplementationPlan(selfImprovements, aiRecommendations);
    
    console.log('✅ Self-analysis completed');
    
    return {
      ...basicAnalysis,
      selfImprovements,
      aiRecommendations,
      implementationPlan,
    };
  }

  private async generateSelfImprovements(analysis: AnalysisResult): Promise<SelfImprovement[]> {
    const improvements: SelfImprovement[] = [];
    
    // パフォーマンス改善
    improvements.push({
      id: 'perf-1',
      category: 'performance',
      title: 'React Flow の遅延読み込み最適化',
      description: 'React Flow コンポーネントが大きなファイルサイズを持っているため、動的インポートでさらに細分化し、初期読み込み時間を短縮する。',
      impact: 'medium',
      effort: 'small',
      priority: 7,
      automatable: true,
      requiredFiles: ['src/components/visualizer/lazy-tech-stack-visualizer.tsx'],
      estimatedTime: '2-3時間',
      businessValue: 'ユーザーの初期体験向上、直帰率の減少'
    });

    // セキュリティ改善
    improvements.push({
      id: 'sec-1',
      category: 'security',
      title: 'APIキーのサーバーサイド管理強化',
      description: 'クライアントサイドでのAPI呼び出しを減らし、機密情報の漏洩リスクを最小化する。',
      impact: 'high',
      effort: 'medium',
      priority: 9,
      automatable: false,
      requiredFiles: ['src/app/api/**/*', 'src/lib/github.ts', 'src/lib/openai.ts'],
      estimatedTime: '1-2日',
      businessValue: 'セキュリティリスクの軽減、信頼性の向上'
    });

    // UX改善
    improvements.push({
      id: 'ux-1',
      category: 'ux',
      title: 'プログレッシブ分析結果表示',
      description: '分析結果を段階的に表示し、ユーザーが途中でも価値を感じられるようにする。',
      impact: 'high',
      effort: 'medium',
      priority: 8,
      automatable: true,
      requiredFiles: ['src/components/analyzer/analysis-progress.tsx', 'src/components/analyzer/analysis-results.tsx'],
      estimatedTime: '4-6時間',
      businessValue: 'ユーザー満足度向上、離脱率減少'
    });

    // コード品質改善
    improvements.push({
      id: 'code-1',
      category: 'code-quality',
      title: 'TypeScript strict モードの有効化',
      description: 'より厳密な型チェックにより、実行時エラーを削減し、開発効率を向上させる。',
      impact: 'medium',
      effort: 'large',
      priority: 6,
      automatable: false,
      requiredFiles: ['tsconfig.json', 'src/**/*.ts', 'src/**/*.tsx'],
      estimatedTime: '2-3日',
      businessValue: 'バグ減少、開発効率向上、保守性改善'
    });

    // 新機能提案
    improvements.push({
      id: 'feat-1',
      category: 'feature',
      title: 'リアルタイム協調分析機能',
      description: 'チームメンバーが同時に分析結果を閲覧・コメントできる機能を追加。',
      impact: 'high',
      effort: 'large',
      priority: 5,
      automatable: false,
      requiredFiles: ['新規ファイル群'],
      estimatedTime: '1-2週間',
      businessValue: 'チーム協調の促進、意思決定の迅速化'
    });

    // アーキテクチャ改善
    improvements.push({
      id: 'arch-1',
      category: 'architecture',
      title: 'マイクロフロントエンド化',
      description: '分析エンジン、可視化、レポート生成を独立したモジュールに分離し、スケーラビリティを向上。',
      impact: 'high',
      effort: 'large',
      priority: 4,
      automatable: false,
      requiredFiles: ['src/lib/**/*', 'src/components/**/*'],
      estimatedTime: '3-4週間',
      businessValue: '開発スケーラビリティ、保守性の大幅向上'
    });

    return improvements.sort((a, b) => b.priority - a.priority);
  }

  private async generateAIRecommendations(analysis: AnalysisResult): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // コード生成推奨
    recommendations.push({
      id: 'ai-gen-1',
      type: 'code-generation',
      title: '自動テストケース生成',
      rationale: '現在のテストカバレッジが不十分。AIによる自動テスト生成で網羅性を向上。',
      implementation: `
1. 既存コンポーネントの props と state を分析
2. エッジケースを含むテストケースを自動生成
3. Jest + React Testing Library でのテスト実装
4. カバレッジレポートの自動生成
`,
      riskLevel: 'low',
      testingRequired: true,
      rollbackPlan: '生成されたテストファイルを削除し、既存のテスト構成に戻す'
    });

    // リファクタリング推奨
    recommendations.push({
      id: 'ai-refactor-1',
      type: 'refactoring',
      title: 'コンポーネントの自動最適化',
      rationale: '大きなコンポーネントファイルを自動で小さな再利用可能なコンポーネントに分割。',
      implementation: `
1. AST解析による責務の特定
2. 再利用可能な部分の抽出
3. Props インターフェースの最適化
4. パフォーマンス最適化（memo、callback等）の自動適用
`,
      riskLevel: 'medium',
      testingRequired: true,
      rollbackPlan: 'Git revert による原状復帰、段階的ロールバック'
    });

    // 最適化推奨
    recommendations.push({
      id: 'ai-opt-1',
      type: 'optimization',
      title: 'バンドルサイズの自動最適化',
      rationale: 'Tree shaking、Code splitting の最適化により初期読み込み時間を短縮。',
      implementation: `
1. Webpack Bundle Analyzer による分析
2. 未使用コードの自動検出・削除
3. 動的インポートの最適配置
4. CDN最適化の提案
`,
      riskLevel: 'low',
      testingRequired: true,
      rollbackPlan: 'webpack設定の復元、ビルド設定のロールバック'
    });

    // 新機能推奨
    recommendations.push({
      id: 'ai-feat-1',
      type: 'new-feature',
      title: 'AI駆動のコード改善提案',
      rationale: '分析結果に基づいて具体的なコード改善案をAIが自動生成。',
      implementation: `
1. 現在の分析エンジンと OpenAI API の統合
2. コード品質問題に対する具体的な修正コードの生成
3. 改善前後の比較機能
4. 安全性チェック機能
`,
      riskLevel: 'high',
      testingRequired: true,
      rollbackPlan: 'AI機能を無効化し、手動分析モードに切り替え'
    });

    return recommendations;
  }

  private generateImplementationPlan(
    improvements: SelfImprovement[], 
    recommendations: AIRecommendation[]
  ): ImplementationStep[] {
    const steps: ImplementationStep[] = [];
    let stepNumber = 1;

    // フェーズ1: 即座に実装可能な改善
    const quickWins = improvements.filter(imp => 
      imp.effort === 'small' && imp.automatable && imp.priority >= 7
    );

    quickWins.forEach(improvement => {
      steps.push({
        id: `step-${stepNumber}`,
        stepNumber: stepNumber++,
        title: `【即時実装】${improvement.title}`,
        description: improvement.description,
        automatable: true,
        dependencies: [],
        estimatedDuration: improvement.estimatedTime,
        validationCriteria: [
          'ビルドエラーがないこと',
          '既存機能に影響がないこと',
          'パフォーマンステストの通過'
        ]
      });
    });

    // フェーズ2: 中期改善項目
    const mediumTerms = improvements.filter(imp => 
      imp.effort === 'medium' && imp.priority >= 6
    );

    mediumTerms.forEach(improvement => {
      steps.push({
        id: `step-${stepNumber}`,
        stepNumber: stepNumber++,
        title: `【中期実装】${improvement.title}`,
        description: improvement.description,
        automatable: improvement.automatable,
        dependencies: steps.slice(0, 2).map(s => s.id), // 前の2ステップに依存
        estimatedDuration: improvement.estimatedTime,
        validationCriteria: [
          'セキュリティチェックの通過',
          'ユーザビリティテストの実施',
          'パフォーマンス指標の改善確認'
        ]
      });
    });

    // フェーズ3: AI推奨機能の実装
    const aiImplementations = recommendations.filter(rec => rec.riskLevel !== 'high');

    aiImplementations.forEach(recommendation => {
      steps.push({
        id: `step-${stepNumber}`,
        stepNumber: stepNumber++,
        title: `【AI実装】${recommendation.title}`,
        description: recommendation.rationale,
        automatable: recommendation.type === 'code-generation',
        dependencies: steps.slice(-2).map(s => s.id), // 直前の2ステップに依存
        estimatedDuration: '3-5日',
        validationCriteria: [
          'AI生成コードの品質チェック',
          '人間によるコードレビュー',
          'A/Bテストでの効果検証'
        ]
      });
    });

    // フェーズ4: 長期戦略的改善
    const longTerms = improvements.filter(imp => 
      imp.effort === 'large' && imp.impact === 'high'
    );

    longTerms.forEach(improvement => {
      steps.push({
        id: `step-${stepNumber}`,
        stepNumber: stepNumber++,
        title: `【戦略実装】${improvement.title}`,
        description: improvement.description,
        automatable: false,
        dependencies: steps.slice(-3).map(s => s.id), // 直前の3ステップに依存
        estimatedDuration: improvement.estimatedTime,
        validationCriteria: [
          'アーキテクチャレビューの通過',
          '段階的デプロイメントの成功',
          'KPI改善の確認'
        ]
      });
    });

    return steps;
  }

  async scanProjectFiles(): Promise<{ [key: string]: string }> {
    const files: { [key: string]: string } = {};
    
    const scanDirectory = (dirPath: string, relativePath = ''): void => {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        if (this.shouldExclude(item)) continue;
        
        const fullPath = path.join(dirPath, item);
        const relativeFilePath = path.join(relativePath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          scanDirectory(fullPath, relativeFilePath);
        } else if (this.isRelevantFile(item)) {
          try {
            files[relativeFilePath] = fs.readFileSync(fullPath, 'utf-8');
          } catch (error) {
            console.warn(`Failed to read ${relativeFilePath}:`, error);
          }
        }
      }
    };
    
    scanDirectory(this.projectRoot);
    return files;
  }

  private shouldExclude(fileName: string): boolean {
    return this.excludePatterns.some(pattern => 
      fileName.includes(pattern) || fileName.startsWith('.')
    );
  }

  private isRelevantFile(fileName: string): boolean {
    const relevantExtensions = [
      '.ts', '.tsx', '.js', '.jsx',
      '.json', '.md', '.yml', '.yaml',
      '.css', '.scss', '.tailwind'
    ];
    
    return relevantExtensions.some(ext => fileName.endsWith(ext)) ||
           ['package.json', 'tsconfig.json', 'next.config.js', 'tailwind.config.js'].includes(fileName);
  }
}

export { SelfAnalyzer };
export type { SelfAnalysisResult, SelfImprovement, AIRecommendation, ImplementationStep };