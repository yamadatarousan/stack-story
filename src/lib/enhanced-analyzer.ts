import { AnalysisResult, TechStackItem, GitHubRepository, GitHubFile, ProjectStructure, DependencyInfo } from '@/types';

/**
 * 強化された分析エンジン
 */
export class EnhancedAnalyzer {
  private owner: string;
  private repo: string;
  private configFiles: Record<string, string | null>;
  private fileStructure: GitHubFile[];
  private repository: GitHubRepository;

  constructor(
    owner: string,
    repo: string,
    configFiles: Record<string, string | null>,
    fileStructure: GitHubFile[],
    repository: GitHubRepository
  ) {
    this.owner = owner;
    this.repo = repo;
    this.configFiles = configFiles;
    this.fileStructure = fileStructure;
    this.repository = repository;
  }

  /**
   * 完全な分析を実行
   */
  async performEnhancedAnalysis(): Promise<AnalysisResult> {
    const techStack = await this.analyzeTechStack();
    const architecture = this.analyzeArchitecture();
    const codeQuality = this.analyzeCodeQuality();
    const cicd = this.analyzeCICD();
    const security = this.analyzeSecurity();
    const performance = this.analyzePerformance();
    const structure = this.analyzeProjectStructure();
    const languages = this.analyzeLanguageDetails();
    const dependencies = this.analyzeDependencies();

    return {
      repository: this.repository,
      techStack,
      structure: {
        ...structure,
        architecture,
        codeQuality,
        cicd,
        security,
        performance,
      } as ProjectStructure,
      languages,
      dependencies,
      summary: this.generateSummary(techStack, architecture, codeQuality),
      analysisId: `${this.owner}/${this.repo}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 技術スタックの詳細分析
   */
  private async analyzeTechStack(): Promise<TechStackItem[]> {
    const techStack: TechStackItem[] = [];
    
    // JavaScript/TypeScript エコシステム
    if (this.configFiles['package.json']) {
      techStack.push(...await this.analyzePackageJson());
    }
    
    // Python エコシステム
    if (this.configFiles['requirements.txt'] || this.configFiles['pyproject.toml'] || this.configFiles['Pipfile']) {
      techStack.push(...await this.analyzePython());
    }
    
    // Java エコシステム
    if (this.configFiles['pom.xml'] || this.configFiles['build.gradle']) {
      techStack.push(...await this.analyzeJava());
    }
    
    // Go エコシステム
    if (this.configFiles['go.mod']) {
      techStack.push(...await this.analyzeGo());
    }
    
    // Rust エコシステム
    if (this.configFiles['Cargo.toml']) {
      techStack.push(...await this.analyzeRust());
    }
    
    // PHP エコシステム
    if (this.configFiles['composer.json']) {
      techStack.push(...await this.analyzePHP());
    }
    
    // Ruby エコシステム
    if (this.configFiles['Gemfile']) {
      techStack.push(...await this.analyzeRuby());
    }
    
    // Docker
    if (this.configFiles['Dockerfile'] || this.configFiles['docker-compose.yml']) {
      techStack.push(...this.analyzeDocker());
    }
    
    // インフラ・DevOps
    techStack.push(...this.analyzeInfrastructure());
    
    return techStack;
  }

  /**
   * package.jsonの詳細分析
   */
  private async analyzePackageJson(): Promise<TechStackItem[]> {
    const techStack: TechStackItem[] = [];
    const packageJson = this.configFiles['package.json'];
    
    if (!packageJson) return techStack;
    
    try {
      const pkg = JSON.parse(packageJson);
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
      };
      
      // フレームワークの検出
      if (allDeps['react']) {
        techStack.push({
          name: 'React',
          version: allDeps['react'],
          category: 'framework',
          description: 'UI構築用JavaScriptライブラリ',
          confidence: 0.95,
          usage: this.detectReactUsage(allDeps),
        });
      }
      
      if (allDeps['next']) {
        techStack.push({
          name: 'Next.js',
          version: allDeps['next'],
          category: 'framework',
          description: 'React用フルスタックフレームワーク',
          confidence: 0.95,
          usage: this.detectNextjsUsage(allDeps),
        });
      }
      
      if (allDeps['vue']) {
        techStack.push({
          name: 'Vue.js',
          version: allDeps['vue'],
          category: 'framework',
          description: 'プログレッシブJavaScriptフレームワーク',
          confidence: 0.95,
          usage: this.detectVueUsage(allDeps),
        });
      }
      
      if (allDeps['@angular/core']) {
        techStack.push({
          name: 'Angular',
          version: allDeps['@angular/core'],
          category: 'framework',
          description: 'TypeScript用フルスタックフレームワーク',
          confidence: 0.95,
          usage: this.detectAngularUsage(allDeps),
        });
      }
      
      // バックエンドフレームワーク
      if (allDeps['express']) {
        techStack.push({
          name: 'Express.js',
          version: allDeps['express'],
          category: 'backend',
          description: 'Node.js用Webアプリケーションフレームワーク',
          confidence: 0.9,
          usage: this.detectExpressUsage(allDeps),
        });
      }
      
      if (allDeps['fastify']) {
        techStack.push({
          name: 'Fastify',
          version: allDeps['fastify'],
          category: 'backend',
          description: '高速なNode.js Webフレームワーク',
          confidence: 0.9,
        });
      }
      
      // データベース
      if (allDeps['mongoose']) {
        techStack.push({
          name: 'MongoDB',
          version: allDeps['mongoose'],
          category: 'database',
          description: 'MongoDBとMongoose ODM',
          confidence: 0.85,
        });
      }
      
      if (allDeps['pg'] || allDeps['postgres']) {
        techStack.push({
          name: 'PostgreSQL',
          version: allDeps['pg'] || allDeps['postgres'],
          category: 'database',
          description: 'PostgreSQLデータベース',
          confidence: 0.85,
        });
      }
      
      // TypeScript
      if (allDeps['typescript'] || this.configFiles['tsconfig.json']) {
        techStack.push({
          name: 'TypeScript',
          version: allDeps['typescript'] || 'detected',
          category: 'language',
          description: 'JavaScriptに静的型付けを追加',
          confidence: 0.95,
          usage: this.detectTypeScriptUsage(allDeps),
        });
      }
      
      // テスティング
      if (allDeps['jest']) {
        techStack.push({
          name: 'Jest',
          version: allDeps['jest'],
          category: 'testing',
          description: 'JavaScript テスティングフレームワーク',
          confidence: 0.9,
        });
      }
      
      if (allDeps['vitest']) {
        techStack.push({
          name: 'Vitest',
          version: allDeps['vitest'],
          category: 'testing',
          description: 'Vite用高速テスティングフレームワーク',
          confidence: 0.9,
        });
      }
      
      // CSS フレームワーク
      if (allDeps['tailwindcss']) {
        techStack.push({
          name: 'Tailwind CSS',
          version: allDeps['tailwindcss'],
          category: 'styling',
          description: 'ユーティリティファーストCSSフレームワーク',
          confidence: 0.9,
        });
      }
      
      // バンドラー
      if (allDeps['webpack']) {
        techStack.push({
          name: 'Webpack',
          version: allDeps['webpack'],
          category: 'build',
          description: 'モジュールバンドラー',
          confidence: 0.9,
        });
      }
      
      if (allDeps['vite']) {
        techStack.push({
          name: 'Vite',
          version: allDeps['vite'],
          category: 'build',
          description: '高速フロントエンドビルドツール',
          confidence: 0.9,
        });
      }
      
    } catch (error) {
      console.error('Error parsing package.json:', error);
    }
    
    return techStack;
  }

  /**
   * Python プロジェクトの分析
   */
  private async analyzePython(): Promise<TechStackItem[]> {
    const techStack: TechStackItem[] = [];
    
    // requirements.txt の分析
    if (this.configFiles['requirements.txt']) {
      const requirements = this.configFiles['requirements.txt'];
      const lines = requirements.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      for (const line of lines) {
        const [pkg, version] = line.split(/[>=<]/);
        if (pkg) {
          techStack.push({
            name: pkg.trim(),
            version: version || 'latest',
            category: 'library',
            description: `Python パッケージ`,
            confidence: 0.8,
          });
        }
      }
    }
    
    // pyproject.toml の分析
    if (this.configFiles['pyproject.toml']) {
      try {
        const pyproject = this.configFiles['pyproject.toml'];
        // TOML パーサーがないので、基本的な検出のみ
        if (pyproject.includes('django')) {
          techStack.push({
            name: 'Django',
            version: 'detected',
            category: 'framework',
            description: 'Python Web フレームワーク',
            confidence: 0.9,
          });
        }
        
        if (pyproject.includes('fastapi')) {
          techStack.push({
            name: 'FastAPI',
            version: 'detected',
            category: 'framework',
            description: 'モダンなPython Web フレームワーク',
            confidence: 0.9,
          });
        }
        
        if (pyproject.includes('flask')) {
          techStack.push({
            name: 'Flask',
            version: 'detected',
            category: 'framework',
            description: 'Python マイクロWebフレームワーク',
            confidence: 0.9,
          });
        }
      } catch (error) {
        console.error('Error parsing pyproject.toml:', error);
      }
    }
    
    return techStack;
  }

  /**
   * Java プロジェクトの分析
   */
  private async analyzeJava(): Promise<TechStackItem[]> {
    const techStack: TechStackItem[] = [];
    
    if (this.configFiles['pom.xml']) {
      const pom = this.configFiles['pom.xml'];
      
      // Spring Boot の検出
      if (pom.includes('spring-boot')) {
        techStack.push({
          name: 'Spring Boot',
          version: 'detected',
          category: 'framework',
          description: 'Java アプリケーションフレームワーク',
          confidence: 0.9,
        });
      }
      
      // Maven の検出
      techStack.push({
        name: 'Maven',
        version: 'detected',
        category: 'build',
        description: 'Java プロジェクト管理ツール',
        confidence: 0.95,
      });
    }
    
    if (this.configFiles['build.gradle']) {
      // Gradle の検出
      techStack.push({
        name: 'Gradle',
        version: 'detected',
        category: 'build',
        description: 'Java/Kotlin ビルドシステム',
        confidence: 0.95,
      });
    }
    
    return techStack;
  }

  /**
   * Go プロジェクトの分析
   */
  private async analyzeGo(): Promise<TechStackItem[]> {
    const techStack: TechStackItem[] = [];
    
    if (this.configFiles['go.mod']) {
      const goMod = this.configFiles['go.mod'];
      
      techStack.push({
        name: 'Go',
        version: 'detected',
        category: 'language',
        description: 'Go プログラミング言語',
        confidence: 0.95,
      });
      
      // 一般的な Go フレームワークの検出
      if (goMod.includes('gin-gonic/gin')) {
        techStack.push({
          name: 'Gin',
          version: 'detected',
          category: 'framework',
          description: 'Go Web フレームワーク',
          confidence: 0.9,
        });
      }
      
      if (goMod.includes('echo')) {
        techStack.push({
          name: 'Echo',
          version: 'detected',
          category: 'framework',
          description: 'Go Web フレームワーク',
          confidence: 0.9,
        });
      }
    }
    
    return techStack;
  }

  /**
   * Rust プロジェクトの分析
   */
  private async analyzeRust(): Promise<TechStackItem[]> {
    const techStack: TechStackItem[] = [];
    
    if (this.configFiles['Cargo.toml']) {
      techStack.push({
        name: 'Rust',
        version: 'detected',
        category: 'language',
        description: 'Rust プログラミング言語',
        confidence: 0.95,
      });
      
      techStack.push({
        name: 'Cargo',
        version: 'detected',
        category: 'build',
        description: 'Rust パッケージマネージャー',
        confidence: 0.95,
      });
      
      const cargo = this.configFiles['Cargo.toml'];
      
      // Web フレームワークの検出
      if (cargo.includes('actix-web')) {
        techStack.push({
          name: 'Actix Web',
          version: 'detected',
          category: 'framework',
          description: 'Rust Web フレームワーク',
          confidence: 0.9,
        });
      }
      
      if (cargo.includes('warp')) {
        techStack.push({
          name: 'Warp',
          version: 'detected',
          category: 'framework',
          description: 'Rust Web フレームワーク',
          confidence: 0.9,
        });
      }
    }
    
    return techStack;
  }

  /**
   * PHP プロジェクトの分析
   */
  private async analyzePHP(): Promise<TechStackItem[]> {
    const techStack: TechStackItem[] = [];
    
    if (this.configFiles['composer.json']) {
      try {
        const composer = JSON.parse(this.configFiles['composer.json']);
        const allDeps = {
          ...composer.require,
          ...composer['require-dev'],
        };
        
        // Laravel の検出
        if (allDeps['laravel/framework']) {
          techStack.push({
            name: 'Laravel',
            version: allDeps['laravel/framework'],
            category: 'framework',
            description: 'PHP Web フレームワーク',
            confidence: 0.9,
          });
        }
        
        // Symfony の検出
        if (allDeps['symfony/framework-bundle']) {
          techStack.push({
            name: 'Symfony',
            version: allDeps['symfony/framework-bundle'],
            category: 'framework',
            description: 'PHP Web フレームワーク',
            confidence: 0.9,
          });
        }
        
        techStack.push({
          name: 'Composer',
          version: 'detected',
          category: 'build',
          description: 'PHP パッケージマネージャー',
          confidence: 0.95,
        });
        
      } catch (error) {
        console.error('Error parsing composer.json:', error);
      }
    }
    
    return techStack;
  }

  /**
   * Ruby プロジェクトの分析
   */
  private async analyzeRuby(): Promise<TechStackItem[]> {
    const techStack: TechStackItem[] = [];
    
    if (this.configFiles['Gemfile']) {
      const gemfile = this.configFiles['Gemfile'];
      
      // Rails の検出
      if (gemfile.includes('rails')) {
        techStack.push({
          name: 'Ruby on Rails',
          version: 'detected',
          category: 'framework',
          description: 'Ruby Web フレームワーク',
          confidence: 0.9,
        });
      }
      
      // Sinatra の検出
      if (gemfile.includes('sinatra')) {
        techStack.push({
          name: 'Sinatra',
          version: 'detected',
          category: 'framework',
          description: 'Ruby マイクロWebフレームワーク',
          confidence: 0.9,
        });
      }
      
      techStack.push({
        name: 'Bundler',
        version: 'detected',
        category: 'build',
        description: 'Ruby パッケージマネージャー',
        confidence: 0.95,
      });
    }
    
    return techStack;
  }

  /**
   * Docker の分析
   */
  private analyzeDocker(): TechStackItem[] {
    const techStack: TechStackItem[] = [];
    
    if (this.configFiles['Dockerfile']) {
      techStack.push({
        name: 'Docker',
        version: 'detected',
        category: 'infrastructure',
        description: 'コンテナ化プラットフォーム',
        confidence: 0.95,
      });
    }
    
    if (this.configFiles['docker-compose.yml'] || this.configFiles['docker-compose.yaml']) {
      techStack.push({
        name: 'Docker Compose',
        version: 'detected',
        category: 'infrastructure',
        description: 'マルチコンテナ Docker アプリケーション定義',
        confidence: 0.95,
      });
    }
    
    return techStack;
  }

  /**
   * インフラストラクチャの分析
   */
  private analyzeInfrastructure(): TechStackItem[] {
    const techStack: TechStackItem[] = [];
    
    // GitHub Actions の検出
    const githubWorkflows = this.fileStructure.filter(
      file => file.path.startsWith('.github/workflows/') && file.path.endsWith('.yml')
    );
    
    if (githubWorkflows.length > 0) {
      techStack.push({
        name: 'GitHub Actions',
        version: 'detected',
        category: 'cicd',
        description: 'GitHub統合CI/CDプラットフォーム',
        confidence: 0.95,
        usage: `${githubWorkflows.length}個のワークフロー`,
      });
    }
    
    // Vercel の検出
    const vercelConfig = this.fileStructure.find(
      file => file.name === 'vercel.json' || file.name === 'now.json'
    );
    
    if (vercelConfig) {
      techStack.push({
        name: 'Vercel',
        version: 'detected',
        category: 'infrastructure',
        description: 'フロントエンドデプロイプラットフォーム',
        confidence: 0.9,
      });
    }
    
    // Netlify の検出
    const netlifyConfig = this.fileStructure.find(
      file => file.name === 'netlify.toml' || file.name === '_redirects'
    );
    
    if (netlifyConfig) {
      techStack.push({
        name: 'Netlify',
        version: 'detected',
        category: 'infrastructure',
        description: 'JAMstack デプロイプラットフォーム',
        confidence: 0.9,
      });
    }
    
    return techStack;
  }

  /**
   * アーキテクチャパターンの分析
   */
  private analyzeArchitecture(): string[] {
    const patterns: string[] = [];
    
    // MVC パターンの検出
    const hasMVC = this.fileStructure.some(file => 
      file.path.includes('/controllers/') || 
      file.path.includes('/models/') || 
      file.path.includes('/views/')
    );
    
    if (hasMVC) {
      patterns.push('MVC');
    }
    
    // マイクロサービス パターンの検出
    const hasMultipleServices = this.fileStructure.filter(file => 
      file.name === 'Dockerfile' || file.name === 'docker-compose.yml'
    ).length > 1;
    
    if (hasMultipleServices) {
      patterns.push('Microservices');
    }
    
    // モノリス パターンの検出
    const hasMonolith = this.fileStructure.some(file => 
      file.path.includes('app/') && file.path.includes('src/')
    );
    
    if (hasMonolith && !hasMultipleServices) {
      patterns.push('Monolith');
    }
    
    // JAMstack パターンの検出
    const hasJAMstack = this.fileStructure.some(file => 
      file.path.includes('static/') || file.path.includes('public/')
    ) && (this.configFiles['package.json'] || this.configFiles['netlify.toml']);
    
    if (hasJAMstack) {
      patterns.push('JAMstack');
    }
    
    return patterns;
  }

  /**
   * コード品質の分析
   */
  private analyzeCodeQuality(): Record<string, boolean | string> {
    const quality = {
      hasLinting: false,
      hasFormatting: false,
      hasTypeChecking: false,
      hasPreCommitHooks: false,
      testCoverage: 'unknown',
      codeComplexity: 'unknown',
    };
    
    // リンティング
    if (this.configFiles['package.json']) {
      const pkg = JSON.parse(this.configFiles['package.json']);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (allDeps['eslint']) quality.hasLinting = true;
      if (allDeps['prettier']) quality.hasFormatting = true;
      if (allDeps['typescript']) quality.hasTypeChecking = true;
      if (allDeps['husky'] || allDeps['lint-staged']) quality.hasPreCommitHooks = true;
    }
    
    return quality;
  }

  /**
   * CI/CD の分析
   */
  private analyzeCICD(): Record<string, string[] | boolean> {
    const cicd = {
      platform: [],
      hasAutomatedTesting: false,
      hasAutomatedDeployment: false,
      hasCodeQualityChecks: false,
      hasSecurityScanning: false,
    };
    
    // GitHub Actions
    const githubWorkflows = this.fileStructure.filter(
      file => file.path.startsWith('.github/workflows/')
    );
    
    if (githubWorkflows.length > 0) {
      (cicd.platform as string[]).push('GitHub Actions');
      cicd.hasAutomatedTesting = true;
      cicd.hasAutomatedDeployment = true;
    }
    
    return cicd;
  }

  /**
   * セキュリティの分析
   */
  private analyzeSecurity(): Record<string, boolean | string[]> {
    const security = {
      hasSecurityDependencies: false,
      hasSecurityWorkflows: false,
      hasSecurityConfig: false,
      vulnerabilities: [],
    };
    
    // セキュリティ関連の依存関係
    if (this.configFiles['package.json']) {
      const pkg = JSON.parse(this.configFiles['package.json']);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (allDeps['helmet'] || allDeps['cors'] || allDeps['express-rate-limit']) {
        security.hasSecurityDependencies = true;
      }
    }
    
    return security;
  }

  /**
   * パフォーマンスの分析
   */
  private analyzePerformance(): Record<string, boolean> {
    const performance = {
      hasPerformanceOptimizations: false,
      hasCaching: false,
      hasLazyLoading: false,
      hasImageOptimization: false,
    };
    
    // パフォーマンス関連の検出
    if (this.configFiles['package.json']) {
      const pkg = JSON.parse(this.configFiles['package.json']);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (allDeps['react-lazyload'] || allDeps['next/image']) {
        performance.hasLazyLoading = true;
      }
      
      if (allDeps['redis'] || allDeps['memcached']) {
        performance.hasCaching = true;
      }
    }
    
    return performance;
  }

  /**
   * プロジェクト構造の分析
   */
  private analyzeProjectStructure(): ProjectStructure {
    const structure: ProjectStructure = {
      type: 'unknown',
      language: this.repository.language || 'unknown',
      framework: null,
      buildTool: null,
      packageManager: null,
      hasTests: false,
      hasDocumentation: false,
      hasCI: false,
      hasLinting: false,
      hasTypeScript: false,
    };
    
    // プロジェクトタイプの決定
    if (this.configFiles['package.json']) {
      structure.type = 'web';
      structure.language = 'JavaScript';
      
      if (this.configFiles['tsconfig.json']) {
        structure.hasTypeScript = true;
        structure.language = 'TypeScript';
      }
    }
    
    // フレームワークの検出
    if (this.configFiles['package.json']) {
      const pkg = JSON.parse(this.configFiles['package.json']);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (allDeps['react']) structure.framework = 'React';
      if (allDeps['next']) structure.framework = 'Next.js';
      if (allDeps['vue']) structure.framework = 'Vue.js';
      if (allDeps['@angular/core']) structure.framework = 'Angular';
    }
    
    // パッケージマネージャーの検出
    if (this.configFiles['package-lock.json']) structure.packageManager = 'npm';
    if (this.configFiles['yarn.lock']) structure.packageManager = 'yarn';
    if (this.configFiles['bun.lockb']) structure.packageManager = 'bun';
    
    // テストの検出
    structure.hasTests = this.fileStructure.some(file => 
      file.path.includes('test/') || 
      file.path.includes('__tests__/') || 
      file.name.includes('.test.') || 
      file.name.includes('.spec.')
    );
    
    // ドキュメントの検出
    structure.hasDocumentation = this.fileStructure.some(file => 
      file.name.toLowerCase().includes('readme') || 
      file.path.includes('docs/') || 
      file.name.includes('.md')
    );
    
    // CI の検出
    structure.hasCI = this.fileStructure.some(file => 
      file.path.includes('.github/workflows/') || 
      file.path.includes('.gitlab-ci.yml') || 
      file.path.includes('.circleci/')
    );
    
    return structure;
  }

  /**
   * 言語詳細の分析
   */
  private analyzeLanguageDetails(): Record<string, number> {
    const languages = {};
    
    // ファイル拡張子による言語検出
    const extensions = this.fileStructure.map(file => {
      const ext = file.name.split('.').pop();
      return ext ? ext.toLowerCase() : '';
    });
    
    const extensionCount = extensions.reduce((acc, ext) => {
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return extensionCount;
  }

  /**
   * 依存関係の分析
   */
  private analyzeDependencies(): DependencyInfo[] {
    const dependencies: DependencyInfo[] = [];
    
    if (this.configFiles['package.json']) {
      try {
        const pkg = JSON.parse(this.configFiles['package.json']);
        
        // プロダクション依存関係
        if (pkg.dependencies) {
          Object.entries(pkg.dependencies).forEach(([name, version]) => {
            dependencies.push({
              name,
              version: version as string,
              isDev: false,
              isOptional: false,
              description: this.getPackageDescription(name),
            });
          });
        }
        
        // 開発依存関係
        if (pkg.devDependencies) {
          Object.entries(pkg.devDependencies).forEach(([name, version]) => {
            dependencies.push({
              name,
              version: version as string,
              isDev: true,
              isOptional: false,
              description: this.getPackageDescription(name),
            });
          });
        }
        
        // オプション依存関係
        if (pkg.optionalDependencies) {
          Object.entries(pkg.optionalDependencies).forEach(([name, version]) => {
            dependencies.push({
              name,
              version: version as string,
              isDev: false,
              isOptional: true,
              description: this.getPackageDescription(name),
            });
          });
        }
      } catch (error) {
        console.error('Error parsing package.json for dependencies:', error);
      }
    }
    
    return dependencies;
  }

  /**
   * パッケージの説明を取得
   */
  private getPackageDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'react': 'ユーザーインターフェース構築用JavaScriptライブラリ',
      'next': 'React用のフルスタックフレームワーク',
      'vue': 'プログレッシブJavaScriptフレームワーク',
      'angular': 'TypeScript用のフルスタックWebアプリケーションフレームワーク',
      'typescript': 'JavaScriptに静的型付けを追加した言語',
      'tailwindcss': 'ユーティリティファーストCSSフレームワーク',
      'prisma': '次世代TypeScript/Node.js用ORM',
      'jest': 'JavaScript用テスティングフレームワーク',
      'express': 'Node.js用の軽量Webアプリケーションフレームワーク',
      'axios': 'Promise based HTTP client',
      'lodash': 'JavaScript utility library',
      'eslint': 'JavaScriptコード品質管理ツール',
      'prettier': 'コードフォーマッター',
      'webpack': 'モジュールバンドラー',
      'vite': '次世代フロントエンドビルドツール',
    };
    
    return descriptions[name] || '';
  }

  /**
   * 使用パターンの検出ヘルパー
   */
  private detectReactUsage(deps: any): string {
    const patterns = [];
    if (deps['react-router-dom']) patterns.push('Router');
    if (deps['redux']) patterns.push('Redux');
    if (deps['@reduxjs/toolkit']) patterns.push('Redux Toolkit');
    if (deps['react-query']) patterns.push('React Query');
    if (deps['@tanstack/react-query']) patterns.push('TanStack Query');
    return patterns.join(', ') || 'Basic';
  }

  private detectNextjsUsage(deps: any): string {
    const patterns = [];
    if (deps['@next/mdx']) patterns.push('MDX');
    if (deps['next-auth']) patterns.push('Authentication');
    if (deps['@vercel/analytics']) patterns.push('Analytics');
    return patterns.join(', ') || 'Basic';
  }

  private detectVueUsage(deps: any): string {
    const patterns = [];
    if (deps['vue-router']) patterns.push('Router');
    if (deps['vuex']) patterns.push('Vuex');
    if (deps['pinia']) patterns.push('Pinia');
    return patterns.join(', ') || 'Basic';
  }

  private detectAngularUsage(deps: any): string {
    const patterns = [];
    if (deps['@angular/router']) patterns.push('Router');
    if (deps['@ngrx/store']) patterns.push('NgRx');
    if (deps['@angular/material']) patterns.push('Material');
    return patterns.join(', ') || 'Basic';
  }

  private detectExpressUsage(deps: any): string {
    const patterns = [];
    if (deps['express-session']) patterns.push('Session');
    if (deps['passport']) patterns.push('Passport Auth');
    if (deps['helmet']) patterns.push('Security');
    return patterns.join(', ') || 'Basic';
  }

  private detectTypeScriptUsage(deps: any): string {
    const patterns = [];
    if (deps['@types/node']) patterns.push('Node.js');
    if (deps['@types/react']) patterns.push('React');
    if (deps['ts-node']) patterns.push('Runtime');
    return patterns.join(', ') || 'Basic';
  }

  /**
   * サマリーの生成
   */
  private generateSummary(techStack: TechStackItem[], architecture: string[], codeQuality: any): string {
    const frameworks = techStack.filter(tech => tech.category === 'framework');
    const languages = techStack.filter(tech => tech.category === 'language');
    
    let summary = `このプロジェクトは`;
    
    if (languages.length > 0) {
      summary += `${languages.map(l => l.name).join(', ')}を使用し、`;
    }
    
    if (frameworks.length > 0) {
      summary += `${frameworks.map(f => f.name).join(', ')}フレームワークで構築されています。`;
    }
    
    if (architecture.length > 0) {
      summary += `アーキテクチャパターンは${architecture.join(', ')}を採用しています。`;
    }
    
    if (codeQuality.hasLinting) {
      summary += `コード品質管理ツールが導入されています。`;
    }
    
    return summary;
  }
}