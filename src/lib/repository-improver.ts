import { AnalysisResult } from '@/types';
import { DeepAnalysisResult } from './deep-code-analyzer';

interface RepositoryImprovement {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'security' | 'quality' | 'maintainability' | 'testing' | 'documentation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'small' | 'medium' | 'large';
  impact: string;
  
  // 具体的な改善内容
  fileChanges: FileChange[];
  newFiles?: NewFile[];
  configUpdates?: ConfigUpdate[];
  
  // 実装情報
  implementationSteps: string[];
  testingGuidance: string[];
  rollbackPlan: string;
  estimatedTimeHours: number;
}

interface FileChange {
  filePath: string;
  changeType: 'modify' | 'delete' | 'rename';
  originalContent?: string;
  improvedContent: string;
  changeDescription: string;
  lineNumbers?: { start: number; end: number };
}

interface NewFile {
  filePath: string;
  content: string;
  description: string;
  fileType: 'component' | 'utility' | 'test' | 'config' | 'documentation';
}

interface ConfigUpdate {
  configFile: string;
  changes: Array<{
    path: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
}

interface ImprovementPlan {
  repositoryName: string;
  analysisDate: Date;
  improvements: RepositoryImprovement[];
  summary: {
    totalImprovements: number;
    estimatedTimeHours: number;
    impactScore: number; // 0-100
    categories: { [key: string]: number };
  };
  implementationStrategy: 'all-at-once' | 'phased' | 'selective';
  phases?: ImprovementPhase[];
}

interface ImprovementPhase {
  phase: number;
  title: string;
  description: string;
  improvements: string[]; // improvement IDs
  estimatedDuration: string;
  dependencies: string[];
}

class RepositoryImprover {
  constructor() {}

  async generateImprovementPlan(analysisResult: AnalysisResult): Promise<ImprovementPlan> {
    console.log('🔧 分析対象リポジトリの改善計画を生成中...');
    
    const improvements = await this.analyzeAndGenerateImprovements(analysisResult);
    const phases = this.createImplementationPhases(improvements);
    
    const summary = {
      totalImprovements: improvements.length,
      estimatedTimeHours: improvements.reduce((sum, imp) => sum + imp.estimatedTimeHours, 0),
      impactScore: this.calculateOverallImpact(improvements),
      categories: this.categorizeImprovements(improvements)
    };

    return {
      repositoryName: analysisResult.repository.name,
      analysisDate: new Date(),
      improvements,
      summary,
      implementationStrategy: this.determineStrategy(improvements),
      phases
    };
  }

  private async analyzeAndGenerateImprovements(analysis: AnalysisResult): Promise<RepositoryImprovement[]> {
    const improvements: RepositoryImprovement[] = [];
    
    // 1. パフォーマンス改善
    improvements.push(...await this.generatePerformanceImprovements(analysis));
    
    // 2. セキュリティ改善
    improvements.push(...await this.generateSecurityImprovements(analysis));
    
    // 3. コード品質改善
    improvements.push(...await this.generateQualityImprovements(analysis));
    
    // 4. 保守性改善
    improvements.push(...await this.generateMaintainabilityImprovements(analysis));
    
    // 5. テスト改善
    improvements.push(...await this.generateTestingImprovements(analysis));
    
    // 6. ドキュメント改善
    improvements.push(...await this.generateDocumentationImprovements(analysis));
    
    return improvements.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
  }

  private async generatePerformanceImprovements(analysis: AnalysisResult): Promise<RepositoryImprovement[]> {
    const improvements: RepositoryImprovement[] = [];
    const deepAnalysis = analysis.deepAnalysis as DeepAnalysisResult;
    
    if (!deepAnalysis) return improvements;

    // React/Next.js 最適化
    if (analysis.techStack.some(tech => tech.name.toLowerCase().includes('react'))) {
      improvements.push({
        id: 'perf-react-memo',
        title: 'React.memo によるコンポーネント最適化',
        description: '不要な再レンダリングを防ぐため、パフォーマンスが重要なコンポーネントに React.memo を適用',
        category: 'performance',
        priority: 'medium',
        effort: 'small',
        impact: '10-30%のレンダリング性能向上が期待できます',
        fileChanges: this.generateReactMemoChanges(analysis),
        implementationSteps: [
          '再レンダリング頻度の高いコンポーネントを特定',
          'React.memo でコンポーネントをラップ',
          'props の比較関数を必要に応じて実装',
          'パフォーマンステストで効果を確認'
        ],
        testingGuidance: [
          'React DevTools Profiler でレンダリング回数を確認',
          '親コンポーネントの state 変更時の動作をテスト',
          'メモ化の効果をベンチマークで測定'
        ],
        rollbackPlan: 'React.memo を削除し、元のコンポーネント定義に戻す',
        estimatedTimeHours: 2
      });
    }

    // Bundle size optimization
    if (analysis.structure.language === 'TypeScript' || analysis.structure.language === 'JavaScript') {
      improvements.push({
        id: 'perf-bundle-optimization',
        title: 'バンドルサイズの最適化',
        description: '未使用のライブラリやコードを削除し、動的インポートでコード分割を実装',
        category: 'performance',
        priority: 'high',
        effort: 'medium',
        impact: '20-50%の初期読み込み時間短縮が期待できます',
        fileChanges: this.generateBundleOptimizationChanges(analysis),
        newFiles: [{
          filePath: 'webpack-bundle-analyzer.config.js',
          content: this.generateBundleAnalyzerConfig(),
          description: 'バンドルサイズ分析用の設定ファイル',
          fileType: 'config'
        }],
        implementationSteps: [
          'webpack-bundle-analyzer でバンドルサイズを分析',
          '大きなライブラリの動的インポート化',
          '未使用のライブラリ・コードの削除',
          'Tree shaking の効果を確認'
        ],
        testingGuidance: [
          'Lighthouse でパフォーマンススコアを確認',
          'ネットワークタブで読み込み時間を測定',
          '各ページでのバンドルサイズを確認'
        ],
        rollbackPlan: 'package.json を元に戻し、npm install を実行',
        estimatedTimeHours: 6
      });
    }

    return improvements;
  }

  private async generateSecurityImprovements(analysis: AnalysisResult): Promise<RepositoryImprovement[]> {
    const improvements: RepositoryImprovement[] = [];

    // セキュリティヘッダー
    if (analysis.structure.type === 'web') {
      improvements.push({
        id: 'sec-headers',
        title: 'セキュリティヘッダーの実装',
        description: 'XSS、CSRF、クリックジャッキング等の攻撃を防ぐセキュリティヘッダーを設定',
        category: 'security',
        priority: 'critical',
        effort: 'small',
        impact: '主要なWeb攻撃に対する防御力を大幅に向上させます',
        fileChanges: [{
          filePath: 'next.config.js',
          changeType: 'modify',
          improvedContent: this.generateSecurityHeadersConfig(),
          changeDescription: 'セキュリティヘッダーの追加設定'
        }],
        configUpdates: [{
          configFile: 'next.config.js',
          changes: [{
            path: 'headers',
            oldValue: undefined,
            newValue: 'Security headers configuration',
            reason: 'Web攻撃対策のため'
          }]
        }],
        implementationSteps: [
          'Content Security Policy の設定',
          'X-Frame-Options の設定',
          'X-Content-Type-Options の設定',
          'セキュリティヘッダーのテスト'
        ],
        testingGuidance: [
          'securityheaders.com でヘッダーを確認',
          'ブラウザの開発者ツールでヘッダーを検証',
          'OWASP ZAP でセキュリティスキャンを実行'
        ],
        rollbackPlan: 'next.config.js から headers 設定を削除',
        estimatedTimeHours: 1
      });
    }

    // 依存関係の脆弱性
    if (analysis.dependencies && analysis.dependencies.length > 0) {
      improvements.push({
        id: 'sec-dependencies',
        title: '依存関係の脆弱性修正',
        description: '古いライブラリや脆弱性のあるパッケージを最新版に更新',
        category: 'security',
        priority: 'high',
        effort: 'medium',
        impact: '既知の脆弱性を解消し、セキュリティリスクを大幅に軽減します',
        fileChanges: [{
          filePath: 'package.json',
          changeType: 'modify',
          improvedContent: this.generateUpdatedPackageJson(analysis),
          changeDescription: '脆弱性のあるパッケージの更新'
        }],
        implementationSteps: [
          'npm audit で脆弱性をスキャン',
          '重要度の高い脆弱性から順次対応',
          'Breaking changes の確認と対応',
          '更新後のテスト実行'
        ],
        testingGuidance: [
          '全ての既存テストが通ることを確認',
          '主要機能の手動テストを実行',
          'npm audit で脆弱性が解消されたことを確認'
        ],
        rollbackPlan: 'package-lock.json をバックアップから復元',
        estimatedTimeHours: 4
      });
    }

    return improvements;
  }

  private async generateQualityImprovements(analysis: AnalysisResult): Promise<RepositoryImprovement[]> {
    const improvements: RepositoryImprovement[] = [];

    // TypeScript 導入/強化
    if (analysis.structure.language === 'JavaScript') {
      improvements.push({
        id: 'quality-typescript',
        title: 'TypeScript への移行',
        description: 'JavaScriptファイルをTypeScriptに移行し、型安全性を向上',
        category: 'quality',
        priority: 'high',
        effort: 'large',
        impact: 'コンパイル時エラー検出により、バグを大幅に削減できます',
        fileChanges: this.generateTypeScriptMigrationChanges(analysis),
        newFiles: [{
          filePath: 'tsconfig.json',
          content: this.generateTsConfig(),
          description: 'TypeScript設定ファイル',
          fileType: 'config'
        }],
        implementationSteps: [
          'tsconfig.json の作成',
          '.js ファイルを .ts/.tsx に順次リネーム',
          '型定義の追加',
          'コンパイルエラーの修正'
        ],
        testingGuidance: [
          'TypeScript コンパイルが成功することを確認',
          '既存テストが全て通ることを確認',
          '型エラーがないことを確認'
        ],
        rollbackPlan: 'TypeScript関連ファイルを削除し、元の.jsファイルに戻す',
        estimatedTimeHours: 20
      });
    }

    // ESLint/Prettier 設定強化
    improvements.push({
      id: 'quality-linting',
      title: 'コード品質ツールの強化',
      description: 'ESLint、Prettier の設定を最適化し、コード品質を向上',
      category: 'quality',
      priority: 'medium',
      effort: 'small',
      impact: 'コードの一貫性と可読性が向上し、チーム開発効率が改善します',
      fileChanges: [{
        filePath: '.eslintrc.json',
        changeType: 'modify',
        improvedContent: this.generateEnhancedESLintConfig(),
        changeDescription: 'ESLint ルールの強化と最適化'
      }],
      newFiles: [{
        filePath: '.prettierrc',
        content: this.generatePrettierConfig(),
        description: 'Prettier 設定ファイル',
        fileType: 'config'
      }],
      implementationSteps: [
        'ESLint設定の更新',
        'Prettier設定の追加',
        '既存コードのフォーマット修正',
        'pre-commit hook の設定'
      ],
      testingGuidance: [
        'npm run lint でエラーがないことを確認',
        'コードフォーマットが統一されていることを確認',
        'CI/CDでリントチェックが動作することを確認'
      ],
      rollbackPlan: '元の .eslintrc.json に戻し、.prettierrc を削除',
      estimatedTimeHours: 2
    });

    return improvements;
  }

  private async generateMaintainabilityImprovements(analysis: AnalysisResult): Promise<RepositoryImprovement[]> {
    const improvements: RepositoryImprovement[] = [];

    // コンポーネント分割
    if (analysis.structure.type === 'web') {
      improvements.push({
        id: 'maintainability-component-split',
        title: '大きなコンポーネントの分割',
        description: '複雑で大きなコンポーネントを小さく再利用可能な単位に分割',
        category: 'maintainability',
        priority: 'medium',
        effort: 'medium',
        impact: 'コードの理解しやすさと再利用性が向上し、保守コストが削減されます',
        fileChanges: this.generateComponentSplitChanges(analysis),
        implementationSteps: [
          '大きなコンポーネントファイルを特定',
          '責務ごとにコンポーネントを分割',
          'Props インターフェースの設計',
          '分割されたコンポーネントのテスト'
        ],
        testingGuidance: [
          '分割前後で同じ動作をすることを確認',
          '各コンポーネントが独立してテスト可能であることを確認',
          'Props の型が正しく定義されていることを確認'
        ],
        rollbackPlan: '分割されたコンポーネントを元のファイルに統合',
        estimatedTimeHours: 8
      });
    }

    // ユーティリティ関数の共通化
    improvements.push({
      id: 'maintainability-utils',
      title: 'ユーティリティ関数の共通化',
      description: '重複するロジックをユーティリティ関数として共通化し、再利用性を向上',
      category: 'maintainability',
      priority: 'low',
      effort: 'small',
      impact: 'コードの重複が減り、保守性が向上します',
      fileChanges: this.generateUtilsCommonizationChanges(analysis),
      newFiles: [{
        filePath: 'src/utils/common.ts',
        content: this.generateCommonUtilsFile(),
        description: '共通ユーティリティ関数集',
        fileType: 'utility'
      }],
      implementationSteps: [
        '重複するロジックの特定',
        'ユーティリティ関数の設計と実装',
        '既存コードでの共通関数の利用',
        'ユーティリティ関数のテスト作成'
      ],
      testingGuidance: [
        'ユーティリティ関数の単体テストを作成',
        '既存機能が正常に動作することを確認',
        'エッジケースのテストを実行'
      ],
      rollbackPlan: '共通化前の個別実装に戻す',
      estimatedTimeHours: 4
    });

    return improvements;
  }

  private async generateTestingImprovements(analysis: AnalysisResult): Promise<RepositoryImprovement[]> {
    const improvements: RepositoryImprovement[] = [];

    if (!analysis.structure.hasTests) {
      improvements.push({
        id: 'testing-setup',
        title: 'テスト環境の構築',
        description: 'Jest、React Testing Library等を用いたテスト環境を構築',
        category: 'testing',
        priority: 'high',
        effort: 'medium',
        impact: 'コードの品質と信頼性が大幅に向上し、リファクタリングが安全に行えます',
        fileChanges: [{
          filePath: 'package.json',
          changeType: 'modify',
          improvedContent: this.generateTestingPackageJson(analysis),
          changeDescription: 'テストライブラリの追加'
        }],
        newFiles: [
          {
            filePath: 'jest.config.js',
            content: this.generateJestConfig(),
            description: 'Jest 設定ファイル',
            fileType: 'config'
          },
          {
            filePath: 'src/components/__tests__/example.test.tsx',
            content: this.generateExampleTest(),
            description: 'サンプルテストファイル',
            fileType: 'test'
          }
        ],
        implementationSteps: [
          'テストライブラリのインストール',
          'Jest 設定ファイルの作成',
          'サンプルテストの作成',
          'CI/CDでのテスト実行設定'
        ],
        testingGuidance: [
          'npm test でテストが実行できることを確認',
          'サンプルテストが通ることを確認',
          'テストカバレッジが計測できることを確認'
        ],
        rollbackPlan: 'テスト関連の依存関係とファイルを削除',
        estimatedTimeHours: 6
      });
    }

    return improvements;
  }

  private async generateDocumentationImprovements(analysis: AnalysisResult): Promise<RepositoryImprovement[]> {
    const improvements: RepositoryImprovement[] = [];

    if (!analysis.structure.hasDocumentation) {
      improvements.push({
        id: 'docs-readme',
        title: 'READMEファイルの充実',
        description: 'プロジェクトの概要、セットアップ方法、使用方法を詳細に記載したREADMEを作成',
        category: 'documentation',
        priority: 'medium',
        effort: 'small',
        impact: '新規開発者のオンボーディングが円滑になり、プロジェクトの理解度が向上します',
        fileChanges: [{
          filePath: 'README.md',
          changeType: 'modify',
          improvedContent: this.generateComprehensiveReadme(analysis),
          changeDescription: '包括的なREADMEファイルの作成'
        }],
        newFiles: [{
          filePath: 'README.md',
          content: this.generateComprehensiveReadme(analysis),
          description: '包括的なREADMEファイル',
          fileType: 'documentation'
        }],
        implementationSteps: [
          'プロジェクト概要の執筆',
          'セットアップ手順の詳細化',
          'API/コンポーネントの使用例作成',
          'トラブルシューティングガイドの追加'
        ],
        testingGuidance: [
          'README通りにセットアップできることを確認',
          'リンクが正しく動作することを確認',
          'コードサンプルが実際に動くことを確認'
        ],
        rollbackPlan: '元のREADMEファイルに戻す',
        estimatedTimeHours: 3
      });
    }

    return improvements;
  }

  // ヘルパーメソッド群
  private getPriorityScore(priority: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 };
    return scores[priority as keyof typeof scores] || 0;
  }

  private calculateOverallImpact(improvements: RepositoryImprovement[]): number {
    const weights = { critical: 25, high: 15, medium: 10, low: 5 };
    const totalScore = improvements.reduce((sum, imp) => {
      return sum + (weights[imp.priority as keyof typeof weights] || 0);
    }, 0);
    return Math.min(100, totalScore);
  }

  private categorizeImprovements(improvements: RepositoryImprovement[]): { [key: string]: number } {
    return improvements.reduce((acc, imp) => {
      acc[imp.category] = (acc[imp.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private determineStrategy(improvements: RepositoryImprovement[]): 'all-at-once' | 'phased' | 'selective' {
    const totalHours = improvements.reduce((sum, imp) => sum + imp.estimatedTimeHours, 0);
    const criticalCount = improvements.filter(imp => imp.priority === 'critical').length;
    
    if (totalHours > 40 || criticalCount > 3) return 'phased';
    if (totalHours > 20 || improvements.length > 8) return 'selective';
    return 'all-at-once';
  }

  private createImplementationPhases(improvements: RepositoryImprovement[]): ImprovementPhase[] {
    const phases: ImprovementPhase[] = [];
    
    // フェーズ1: 緊急対応
    const critical = improvements.filter(imp => imp.priority === 'critical');
    if (critical.length > 0) {
      phases.push({
        phase: 1,
        title: '緊急セキュリティ対応',
        description: '重要なセキュリティ問題の即座の修正',
        improvements: critical.map(imp => imp.id),
        estimatedDuration: `${critical.reduce((sum, imp) => sum + imp.estimatedTimeHours, 0)}時間`,
        dependencies: []
      });
    }

    // フェーズ2: 基盤強化
    const foundational = improvements.filter(imp => 
      ['testing', 'quality'].includes(imp.category) && imp.priority === 'high'
    );
    if (foundational.length > 0) {
      phases.push({
        phase: 2,
        title: '開発基盤の強化',
        description: 'テスト環境とコード品質の向上',
        improvements: foundational.map(imp => imp.id),
        estimatedDuration: `${foundational.reduce((sum, imp) => sum + imp.estimatedTimeHours, 0)}時間`,
        dependencies: phases.length > 0 ? [phases[phases.length - 1].title] : []
      });
    }

    // フェーズ3: パフォーマンス・保守性
    const optimization = improvements.filter(imp => 
      ['performance', 'maintainability'].includes(imp.category)
    );
    if (optimization.length > 0) {
      phases.push({
        phase: 3,
        title: 'パフォーマンスと保守性の向上',
        description: 'システムの最適化と長期的な保守性の改善',
        improvements: optimization.map(imp => imp.id),
        estimatedDuration: `${optimization.reduce((sum, imp) => sum + imp.estimatedTimeHours, 0)}時間`,
        dependencies: phases.length > 0 ? [phases[phases.length - 1].title] : []
      });
    }

    return phases;
  }

  // 具体的なコード生成メソッド（簡略化）
  private generateReactMemoChanges(analysis: AnalysisResult): FileChange[] {
    // 実際の実装では、分析結果からコンポーネントファイルを特定し、
    // React.memo の適用が適切な箇所を判断して具体的な変更を生成
    return [{
      filePath: 'src/components/example.tsx',
      changeType: 'modify',
      improvedContent: `import React, { memo } from 'react';

interface Props {
  data: any[];
  onUpdate: (data: any) => void;
}

const ExampleComponent = memo(({ data, onUpdate }: Props) => {
  // コンポーネントの実装
  return <div>{/* 実装内容 */}</div>;
});

export default ExampleComponent;`,
      changeDescription: 'React.memo による最適化を適用'
    }];
  }

  private generateBundleOptimizationChanges(analysis: AnalysisResult): FileChange[] {
    return [{
      filePath: 'src/components/heavy-component.tsx',
      changeType: 'modify',
      improvedContent: `import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./charts/heavy-chart'));

export default function OptimizedComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyChart />
    </Suspense>
  );
}`,
      changeDescription: '重いコンポーネントの動的インポート化'
    }];
  }

  private generateBundleAnalyzerConfig(): string {
    return `const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    })
  ]
};`;
  }

  private generateSecurityHeadersConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;`;
  }

  private generateUpdatedPackageJson(analysis: AnalysisResult): string {
    // 簡略化：実際には脆弱性スキャン結果に基づいて更新
    return `{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`;
  }

  private generateTypeScriptMigrationChanges(analysis: AnalysisResult): FileChange[] {
    return [{
      filePath: 'src/example.js',
      changeType: 'modify',
      improvedContent: `interface User {
  id: number;
  name: string;
  email: string;
}

export function processUser(user: User): string {
  return \`\${user.name} (\${user.email})\`;
}`,
      changeDescription: 'JavaScript から TypeScript への変換と型定義の追加'
    }];
  }

  private generateTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
  }

  private generateEnhancedESLintConfig(): string {
    return `{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}`;
  }

  private generatePrettierConfig(): string {
    return `{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80
}`;
  }

  private generateComponentSplitChanges(analysis: AnalysisResult): FileChange[] {
    return [{
      filePath: 'src/components/large-component.tsx',
      changeType: 'modify',
      improvedContent: `import React from 'react';
import Header from './header';
import Content from './content';
import Footer from './footer';

export default function OptimizedComponent(props: Props) {
  return (
    <div>
      <Header title={props.title} />
      <Content data={props.data} />
      <Footer />
    </div>
  );
}`,
      changeDescription: '大きなコンポーネントを小さな責務に分割'
    }];
  }

  private generateUtilsCommonizationChanges(analysis: AnalysisResult): FileChange[] {
    return [{
      filePath: 'src/components/example.tsx',
      changeType: 'modify',
      improvedContent: `import { formatDate, validateEmail } from '@/utils/common';

export default function ExampleComponent() {
  const formattedDate = formatDate(new Date());
  const isValid = validateEmail('test@example.com');
  
  return <div>{formattedDate}</div>;
}`,
      changeDescription: '重複ロジックを共通ユーティリティ関数に置き換え'
    }];
  }

  private generateCommonUtilsFile(): string {
    return `export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}`;
  }

  private generateTestingPackageJson(analysis: AnalysisResult): string {
    return `{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}`;
  }

  private generateJestConfig(): string {
    return `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)`;
  }

  private generateExampleTest(): string {
    return `import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExampleComponent from '../example';

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent />);
    expect(screen.getByText('Example')).toBeInTheDocument();
  });
});`;
  }

  private generateComprehensiveReadme(analysis: AnalysisResult): string {
    return `# ${analysis.repository.name}

## 概要
${analysis.repository.description || 'プロジェクトの説明'}

## 技術スタック
${analysis.techStack.map(tech => `- ${tech.name}`).join('\n')}

## セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール
\`\`\`bash
git clone ${analysis.repository.html_url}
cd ${analysis.repository.name}
npm install
\`\`\`

### 開発サーバーの起動
\`\`\`bash
npm run dev
\`\`\`

## 使用方法
[使用方法の詳細説明]

## API仕様
[API の説明（該当する場合）]

## テスト
\`\`\`bash
npm test
\`\`\`

## デプロイ
[デプロイ方法の説明]

## 貢献
[コントリビューションガイドライン]

## ライセンス
[ライセンス情報]`;
  }
}

export type { RepositoryImprovement, ImprovementPlan, ImprovementPhase, FileChange };
export { RepositoryImprover };