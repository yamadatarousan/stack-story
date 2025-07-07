import { AnalysisResult, TechStackItem, GitHubRepository } from '@/types';

interface IntelligentAnalysisResult extends AnalysisResult {
  projectOverview: {
    purpose: string;
    category: string;
    targetAudience: string;
    keyFeatures: string[];
    businessDomain: string;
  };
  architectureInsights: {
    pattern: string;
    layerStructure: string[];
    designPrinciples: string[];
    scalabilityApproach: string;
  };
  technologyChoices: {
    rationale: Record<string, string>;
    alternatives: Record<string, string[]>;
    tradeoffs: Record<string, string>;
  };
  codeQualityAssessment: {
    testCoverage: 'high' | 'medium' | 'low' | 'none';
    typeSafety: 'strict' | 'moderate' | 'minimal' | 'none';
    documentationQuality: 'excellent' | 'good' | 'basic' | 'poor';
    maintainabilityScore: number;
  };
  maturityLevel: {
    stage: 'prototype' | 'development' | 'production' | 'maintenance';
    indicators: string[];
    recommendations: string[];
  };
}

export class IntelligentAnalyzer {
  private repository: GitHubRepository;
  private files: Record<string, string | null>;
  private fileStructure: Array<{ name: string; path: string; type: 'file' | 'dir' }>;

  constructor(
    repository: GitHubRepository,
    files: Record<string, string | null>,
    fileStructure: Array<{ name: string; path: string; type: 'file' | 'dir' }>
  ) {
    this.repository = repository;
    this.files = files;
    this.fileStructure = fileStructure;
  }

  async performIntelligentAnalysis(): Promise<IntelligentAnalysisResult> {
    const projectOverview = this.analyzeProjectOverview();
    const architectureInsights = this.analyzeArchitecture();
    const technologyChoices = this.analyzeTechnologyChoices();
    const codeQualityAssessment = this.assessCodeQuality();
    const maturityLevel = this.assessMaturityLevel();

    // 基本的な技術スタック分析
    const techStack = this.extractTechStack();

    return {
      repository: this.repository,
      techStack,
      dependencies: [],
      structure: { 
        type: 'unknown', 
        language: this.repository.language || 'Unknown',
        hasTests: false,
        hasDocumentation: false,
        hasCI: false
      },
      detectedFiles: [],
      summary: projectOverview.purpose,
      projectOverview,
      architectureInsights,
      technologyChoices,
      codeQualityAssessment,
      maturityLevel,
    };
  }

  private analyzeProjectOverview() {
    const readme = this.files['README.md'] || this.files['readme.md'] || '';
    const packageJson = this.files['package.json'];
    const repoDescription = this.repository.description || '';

    // プロジェクト目的の推論
    let purpose = repoDescription;
    if (readme && readme.length > 100) {
      const lines = readme.split('\n').filter(line => line.trim());
      purpose = this.extractPurposeFromReadme(lines);
    }

    // カテゴリ推論
    const category = this.inferProjectCategory();
    
    // ターゲットユーザー推論
    const targetAudience = this.inferTargetAudience();

    // 主要機能抽出
    const keyFeatures = this.extractKeyFeatures(readme);

    // ビジネスドメイン推論
    const businessDomain = this.inferBusinessDomain();

    return {
      purpose: purpose || 'プロジェクトの詳細な説明が見つかりませんでした',
      category,
      targetAudience,
      keyFeatures,
      businessDomain,
    };
  }

  private extractPurposeFromReadme(lines: string[]): string {
    // READMEの最初の段落や説明部分を抽出
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i].trim();
      
      // ヘッダーをスキップ
      if (line.startsWith('#')) continue;
      
      // バッジやリンクをスキップ
      if (line.includes('![') || line.includes('[![')) continue;
      
      // 意味のある文章を見つける
      if (line.length > 50 && (line.includes('は') || line.includes('です') || line.includes('を') || 
          line.includes('is') || line.includes('provides') || line.includes('allows'))) {
        return line;
      }
    }
    return this.repository.description || '';
  }

  private inferProjectCategory(): string {
    const name = this.repository.name.toLowerCase();
    const description = (this.repository.description || '').toLowerCase();
    const files = Object.keys(this.files);
    
    // Webアプリケーション
    if (files.includes('package.json') && 
        (files.some(f => f.includes('next.config')) || 
         files.some(f => f.includes('react')) ||
         files.some(f => f.includes('vue')))) {
      return 'Webアプリケーション';
    }

    // モバイルアプリ
    if (files.includes('pubspec.yaml') || files.includes('android') || files.includes('ios')) {
      return 'モバイルアプリケーション';
    }

    // CLI ツール
    if (name.includes('cli') || description.includes('command') || description.includes('tool')) {
      return 'コマンドラインツール';
    }

    // ライブラリ
    if (files.includes('setup.py') || files.includes('Cargo.toml') || 
        (files.includes('package.json') && !files.includes('public'))) {
      return 'ライブラリ・SDK';
    }

    // データ処理
    if (description.includes('data') || description.includes('analytics') || 
        files.some(f => f.includes('jupyter')) || files.some(f => f.endsWith('.ipynb'))) {
      return 'データ分析・処理';
    }

    // API/バックエンド
    if (files.includes('Dockerfile') && files.some(f => f.includes('api'))) {
      return 'API・バックエンドサービス';
    }

    return '汎用ソフトウェア';
  }

  private inferTargetAudience(): string {
    const readme = this.files['README.md'] || '';
    const description = this.repository.description || '';
    const combined = (readme + ' ' + description).toLowerCase();

    if (combined.includes('developer') || combined.includes('開発者')) {
      return '開発者';
    }
    if (combined.includes('business') || combined.includes('enterprise') || combined.includes('企業')) {
      return '企業・ビジネスユーザー';
    }
    if (combined.includes('student') || combined.includes('学習') || combined.includes('tutorial')) {
      return '学習者・学生';
    }
    if (combined.includes('admin') || combined.includes('system') || combined.includes('管理')) {
      return 'システム管理者';
    }

    return '一般ユーザー';
  }

  private extractKeyFeatures(readme: string): string[] {
    const features: string[] = [];
    const lines = readme.split('\n');
    
    let inFeatureSection = false;
    for (const line of lines) {
      const trimmed = line.trim();
      
      // 機能セクションの開始を検出
      if (trimmed.toLowerCase().includes('feature') || 
          trimmed.includes('機能') || 
          trimmed.includes('できること')) {
        inFeatureSection = true;
        continue;
      }
      
      // セクション終了の検出
      if (inFeatureSection && trimmed.startsWith('#')) {
        break;
      }
      
      // 機能項目の抽出
      if (inFeatureSection && (trimmed.startsWith('- ') || trimmed.startsWith('* '))) {
        const feature = trimmed.substring(2).trim();
        if (feature.length > 5 && feature.length < 100) {
          features.push(feature);
        }
      }
    }

    // 機能セクションが見つからない場合は、技術的特徴から推論
    if (features.length === 0) {
      features.push(...this.inferFeaturesFromTech());
    }

    return features.slice(0, 5); // 最大5つまで
  }

  private inferFeaturesFromTech(): string[] {
    const features: string[] = [];
    const files = Object.keys(this.files);

    if (files.includes('package.json')) {
      const pkg = JSON.parse(this.files['package.json'] || '{}');
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.react) features.push('Reactベースのユーザーインターフェース');
      if (deps.typescript) features.push('TypeScriptによる型安全性');
      if (deps.tailwindcss) features.push('モダンなスタイリング');
      if (deps.jest || deps.vitest) features.push('自動テスト機能');
      if (deps.eslint) features.push('コード品質管理');
    }

    if (files.includes('Dockerfile')) {
      features.push('コンテナ化対応');
    }

    return features;
  }

  private inferBusinessDomain(): string {
    const name = this.repository.name.toLowerCase();
    const description = (this.repository.description || '').toLowerCase();
    const combined = name + ' ' + description;

    const domains = {
      'E-commerce': ['shop', 'store', 'cart', 'payment', 'ecommerce', 'commerce'],
      '金融・FinTech': ['bank', 'finance', 'payment', 'crypto', 'trading', 'wallet'],
      '教育・EdTech': ['education', 'learning', 'course', 'student', 'quiz', 'lesson'],
      'ヘルスケア': ['health', 'medical', 'hospital', 'patient', 'wellness'],
      'メディア・エンターテイメント': ['media', 'video', 'music', 'game', 'streaming'],
      'IoT・ハードウェア': ['iot', 'sensor', 'device', 'hardware', 'arduino', 'raspberry'],
      '開発ツール': ['dev', 'tool', 'cli', 'build', 'deploy', 'debug'],
      'データ・AI': ['data', 'analytics', 'ml', 'ai', 'machine', 'learning'],
    };

    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => combined.includes(keyword))) {
        return domain;
      }
    }

    return '汎用';
  }

  private analyzeArchitecture() {
    const directories = this.fileStructure
      .filter(item => item.type === 'dir')
      .map(item => item.name.toLowerCase());
    
    // アーキテクチャパターンの推論
    let pattern = 'モノリシック';
    
    if (directories.includes('microservices') || directories.includes('services')) {
      pattern = 'マイクロサービス';
    } else if (directories.includes('layers') || 
               (directories.includes('controllers') && directories.includes('models'))) {
      pattern = 'レイヤードアーキテクチャ';
    } else if (directories.includes('components') && directories.includes('pages')) {
      pattern = 'コンポーネントベース';
    }

    // レイヤー構造の分析
    const layerStructure: string[] = [];
    const layerPatterns = {
      'プレゼンテーション層': ['components', 'pages', 'views', 'ui'],
      'ビジネスロジック層': ['services', 'business', 'logic', 'domain'],
      'データアクセス層': ['models', 'data', 'repositories', 'dao'],
      'インフラ層': ['config', 'utils', 'infrastructure', 'shared']
    };

    for (const [layer, patterns] of Object.entries(layerPatterns)) {
      if (patterns.some(pattern => directories.includes(pattern))) {
        layerStructure.push(layer);
      }
    }

    // 設計原則の推論
    const designPrinciples: string[] = [];
    if (directories.includes('interfaces') || this.files['tsconfig.json']) {
      designPrinciples.push('インターフェース指向設計');
    }
    if (directories.includes('tests') || directories.includes('__tests__')) {
      designPrinciples.push('テスト駆動開発');
    }
    if (this.files['package.json'] && JSON.parse(this.files['package.json'] || '{}').dependencies?.typescript) {
      designPrinciples.push('型安全性');
    }

    return {
      pattern,
      layerStructure,
      designPrinciples,
      scalabilityApproach: this.inferScalabilityApproach(),
    };
  }

  private inferScalabilityApproach(): string {
    const files = Object.keys(this.files);
    
    if (files.includes('Dockerfile') && files.includes('docker-compose.yml')) {
      return 'コンテナベーススケーリング';
    }
    if (files.includes('serverless.yml') || files.some(f => f.includes('lambda'))) {
      return 'サーバーレススケーリング';
    }
    if (files.includes('kubernetes') || files.some(f => f.includes('k8s'))) {
      return 'Kubernetesオーケストレーション';
    }
    
    return '水平スケーリング対応';
  }

  private analyzeTechnologyChoices() {
    const rationale: Record<string, string> = {};
    const alternatives: Record<string, string[]> = {};
    const tradeoffs: Record<string, string> = {};

    if (this.files['package.json']) {
      const pkg = JSON.parse(this.files['package.json'] || '{}');
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.react) {
        rationale['React'] = 'コンポーネントベースのUI開発、豊富なエコシステム';
        alternatives['React'] = ['Vue.js', 'Angular', 'Svelte'];
        tradeoffs['React'] = '学習コストが高い、頻繁なアップデート';
      }

      if (deps.typescript) {
        rationale['TypeScript'] = '型安全性による開発効率向上、大規模開発向け';
        alternatives['TypeScript'] = ['JavaScript', 'Flow'];
        tradeoffs['TypeScript'] = '初期セットアップのオーバーヘッド';
      }

      if (deps.next) {
        rationale['Next.js'] = 'SSR/SSG対応、フルスタックフレームワーク';
        alternatives['Next.js'] = ['Create React App', 'Gatsby', 'Remix'];
        tradeoffs['Next.js'] = 'Vercel生態系への依存';
      }
    }

    return { rationale, alternatives, tradeoffs };
  }

  private assessCodeQuality() {
    const files = Object.keys(this.files);
    
    // テストカバレッジ推定
    let testCoverage: 'high' | 'medium' | 'low' | 'none' = 'none';
    const testFiles = files.filter(f => 
      f.includes('test') || f.includes('spec') || f.includes('__tests__')
    );
    if (testFiles.length > 5) testCoverage = 'high';
    else if (testFiles.length > 2) testCoverage = 'medium';
    else if (testFiles.length > 0) testCoverage = 'low';

    // 型安全性評価
    let typeSafety: 'strict' | 'moderate' | 'minimal' | 'none' = 'none';
    if (this.files['tsconfig.json']) {
      const tsconfig = JSON.parse(this.files['tsconfig.json'] || '{}');
      if (tsconfig.compilerOptions?.strict) typeSafety = 'strict';
      else typeSafety = 'moderate';
    } else if (files.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
      typeSafety = 'minimal';
    }

    // ドキュメント品質
    let documentationQuality: 'excellent' | 'good' | 'basic' | 'poor' = 'poor';
    const readmeLength = (this.files['README.md'] || '').length;
    if (readmeLength > 2000) documentationQuality = 'excellent';
    else if (readmeLength > 1000) documentationQuality = 'good';
    else if (readmeLength > 200) documentationQuality = 'basic';

    // メンテナビリティスコア（0-100）
    let maintainabilityScore = 50;
    if (testCoverage === 'high') maintainabilityScore += 20;
    else if (testCoverage === 'medium') maintainabilityScore += 10;
    
    if (typeSafety === 'strict') maintainabilityScore += 15;
    else if (typeSafety === 'moderate') maintainabilityScore += 10;
    
    if (documentationQuality === 'excellent') maintainabilityScore += 15;
    else if (documentationQuality === 'good') maintainabilityScore += 10;
    else if (documentationQuality === 'basic') maintainabilityScore += 5;

    return {
      testCoverage,
      typeSafety,
      documentationQuality,
      maintainabilityScore: Math.min(100, maintainabilityScore),
    };
  }

  private assessMaturityLevel() {
    const pkg = this.files['package.json'] ? JSON.parse(this.files['package.json'] || '{}') : null;
    const version = pkg?.version || '0.1.0';
    const hasTests = Object.keys(this.files).some(f => f.includes('test'));
    const hasCI = Object.keys(this.files).some(f => f.includes('.github') || f.includes('ci'));
    const hasDocumentation = (this.files['README.md'] || '').length > 500;

    let stage: 'prototype' | 'development' | 'production' | 'maintenance';
    const indicators: string[] = [];
    const recommendations: string[] = [];

    if (version.startsWith('0.')) {
      stage = 'prototype';
      indicators.push('バージョン0.x系', '初期開発段階');
      recommendations.push('テストの追加', 'ドキュメントの充実');
    } else if (version.startsWith('1.') && !hasCI) {
      stage = 'development';
      indicators.push('v1以上', 'CI/CD未整備');
      recommendations.push('継続的インテグレーションの導入');
    } else if (hasTests && hasCI && hasDocumentation) {
      stage = 'production';
      indicators.push('テスト完備', 'CI/CD整備済み', '文書化完了');
    } else {
      stage = 'maintenance';
      indicators.push('安定版リリース済み');
    }

    return { stage, indicators, recommendations };
  }

  private extractTechStack(): TechStackItem[] {
    const techStack: TechStackItem[] = [];
    
    if (this.files['package.json']) {
      const pkg = JSON.parse(this.files['package.json'] || '{}');
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      Object.entries(deps).forEach(([name, version]) => {
        const tech = this.getTechInfo(name, version as string);
        if (tech) {
          techStack.push(tech);
        }
      });
    }

    return techStack;
  }

  private getTechInfo(name: string, version: string): TechStackItem | null {
    const techMap: Record<string, Omit<TechStackItem, 'version'>> = {
      'react': {
        name: 'React',
        category: 'フレームワーク',
        description: 'コンポーネントベースのUIライブラリ',
        confidence: 0.95,
      },
      'next': {
        name: 'Next.js',
        category: 'フレームワーク',
        description: 'React用の本格的Webフレームワーク',
        confidence: 0.95,
      },
      'typescript': {
        name: 'TypeScript',
        category: '言語',
        description: '型安全なJavaScript',
        confidence: 0.9,
      },
    };

    const tech = techMap[name];
    if (tech) {
      return { ...tech, version };
    }
    return null;
  }
}