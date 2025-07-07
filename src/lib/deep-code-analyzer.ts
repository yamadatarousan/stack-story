import { GitHubRepository } from '@/types';

interface CodeStructure {
  functions: {
    name: string;
    file: string;
    lineCount: number;
    complexity: number;
    isAsync: boolean;
    parameters: string[];
    dependencies: string[];
  }[];
  classes: {
    name: string;
    file: string;
    methods: string[];
    properties: string[];
    inheritance: string[];
    responsibilities: string[];
  }[];
  modules: {
    name: string;
    file: string;
    exports: string[];
    imports: string[];
    purpose: string;
    coupling: number;
  }[];
}

interface BusinessLogic {
  domains: {
    name: string;
    entities: string[];
    operations: string[];
    dataFlow: string[];
    businessRules: string[];
  }[];
  workflows: {
    name: string;
    steps: string[];
    triggers: string[];
    outputs: string[];
    complexity: 'simple' | 'moderate' | 'complex';
  }[];
  dataModels: {
    entity: string;
    fields: string[];
    relationships: string[];
    validations: string[];
    file: string;
  }[];
}

interface APIAnalysis {
  endpoints: {
    path: string;
    method: string;
    purpose: string;
    inputSchema: any;
    outputSchema: any;
    middleware: string[];
    file: string;
  }[];
  database: {
    type: string;
    schema: {
      tables: string[];
      relationships: string[];
      indexes: string[];
    };
    queries: {
      type: 'select' | 'insert' | 'update' | 'delete';
      complexity: number;
      file: string;
    }[];
  };
  integrations: {
    service: string;
    type: 'api' | 'database' | 'queue' | 'cache';
    usage: string[];
  }[];
}

interface QualityIssues {
  codeSmells: {
    type: string;
    description: string;
    file: string;
    line: number;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
  }[];
  performanceIssues: {
    type: string;
    description: string;
    file: string;
    impact: string;
    solution: string;
  }[];
  securityVulnerabilities: {
    type: string;
    description: string;
    file: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
  }[];
  technicalDebt: {
    category: string;
    description: string;
    estimatedEffort: string;
    businessImpact: string;
  }[];
}

interface CompetitiveAnalysis {
  industryComparison: {
    category: string;
    standardApproach: string;
    projectApproach: string;
    assessment: 'behind' | 'standard' | 'advanced';
    recommendations: string[];
  }[];
  modernizationNeeds: {
    area: string;
    currentState: string;
    recommendedState: string;
    effort: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high';
  }[];
}

export interface DeepAnalysisResult {
  codeStructure: CodeStructure;
  businessLogic: BusinessLogic;
  apiAnalysis: APIAnalysis;
  qualityIssues: QualityIssues;
  competitiveAnalysis: CompetitiveAnalysis;
  insights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  actionableRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export class DeepCodeAnalyzer {
  private repository: GitHubRepository;
  private files: Record<string, string | null>;
  private sourceFiles: Record<string, string>;

  constructor(
    repository: GitHubRepository,
    files: Record<string, string | null>
  ) {
    this.repository = repository;
    this.files = files;
    this.sourceFiles = this.extractSourceFiles(files);
  }

  async performDeepAnalysis(): Promise<DeepAnalysisResult> {
    const codeStructure = this.analyzeCodeStructure();
    const businessLogic = this.analyzeBusinessLogic();
    const apiAnalysis = this.analyzeAPIStructure();
    const qualityIssues = this.identifyQualityIssues();
    const competitiveAnalysis = this.performCompetitiveAnalysis();
    const insights = this.generateInsights(codeStructure, businessLogic, qualityIssues);
    const actionableRecommendations = this.generateRecommendations(qualityIssues, competitiveAnalysis);

    return {
      codeStructure,
      businessLogic,
      apiAnalysis,
      qualityIssues,
      competitiveAnalysis,
      insights,
      actionableRecommendations,
    };
  }

  private extractSourceFiles(files: Record<string, string | null>): Record<string, string> {
    const sourceFiles: Record<string, string> = {};
    
    Object.entries(files).forEach(([path, content]) => {
      if (content && this.isSourceFile(path)) {
        sourceFiles[path] = content;
      }
    });

    return sourceFiles;
  }

  private isSourceFile(path: string): boolean {
    const sourceExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.php', '.rb'];
    return sourceExtensions.some(ext => path.endsWith(ext)) && 
           !path.includes('node_modules') && 
           !path.includes('.test.') && 
           !path.includes('.spec.');
  }

  private analyzeCodeStructure(): CodeStructure {
    const functions: CodeStructure['functions'] = [];
    const classes: CodeStructure['classes'] = [];
    const modules: CodeStructure['modules'] = [];

    Object.entries(this.sourceFiles).forEach(([filePath, content]) => {
      // 関数解析
      const fileFunctions = this.extractFunctions(content, filePath);
      functions.push(...fileFunctions);

      // クラス解析
      const fileClasses = this.extractClasses(content, filePath);
      classes.push(...fileClasses);

      // モジュール解析
      const moduleInfo = this.analyzeModule(content, filePath);
      if (moduleInfo) {
        modules.push(moduleInfo);
      }
    });

    return { functions, classes, modules };
  }

  private extractFunctions(content: string, filePath: string): CodeStructure['functions'] {
    const functions: CodeStructure['functions'] = [];
    const lines = content.split('\n');

    // JavaScript/TypeScript関数パターン
    const functionPatterns = [
      /function\s+(\w+)\s*\(([^)]*)\)/g,
      /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
      /(\w+)\s*:\s*\(([^)]*)\)\s*=>/g,
      /async\s+function\s+(\w+)\s*\(([^)]*)\)/g,
    ];

    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        const params = match[2].split(',').map(p => p.trim()).filter(p => p);
        
        functions.push({
          name,
          file: filePath,
          lineCount: this.estimateLineCount(content, match.index),
          complexity: this.estimateComplexity(content, match.index),
          isAsync: content.includes('async'),
          parameters: params,
          dependencies: this.extractDependencies(content, match.index),
        });
      }
    });

    return functions;
  }

  private extractClasses(content: string, filePath: string): CodeStructure['classes'] {
    const classes: CodeStructure['classes'] = [];
    const classPattern = /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{([^}]*)}/g;
    
    let match;
    while ((match = classPattern.exec(content)) !== null) {
      const name = match[1];
      const inheritance = match[2] ? [match[2]] : [];
      const classBody = match[3];
      
      const methods = this.extractMethods(classBody);
      const properties = this.extractProperties(classBody);
      const responsibilities = this.inferClassResponsibilities(name, methods, properties);

      classes.push({
        name,
        file: filePath,
        methods,
        properties,
        inheritance,
        responsibilities,
      });
    }

    return classes;
  }

  private extractMethods(classBody: string): string[] {
    const methods: string[] = [];
    const methodPattern = /(\w+)\s*\([^)]*\)\s*{/g;
    
    let match;
    while ((match = methodPattern.exec(classBody)) !== null) {
      methods.push(match[1]);
    }

    return methods;
  }

  private extractProperties(classBody: string): string[] {
    const properties: string[] = [];
    const propertyPattern = /(?:private|public|protected)?\s*(\w+)\s*[:=]/g;
    
    let match;
    while ((match = propertyPattern.exec(classBody)) !== null) {
      properties.push(match[1]);
    }

    return properties;
  }

  private inferClassResponsibilities(name: string, methods: string[], properties: string[]): string[] {
    const responsibilities: string[] = [];

    // 命名規則から推論
    if (name.toLowerCase().includes('service')) {
      responsibilities.push('ビジネスロジック処理');
    }
    if (name.toLowerCase().includes('controller')) {
      responsibilities.push('リクエスト処理とレスポンス生成');
    }
    if (name.toLowerCase().includes('model') || name.toLowerCase().includes('entity')) {
      responsibilities.push('データモデルの定義');
    }
    if (name.toLowerCase().includes('repository') || name.toLowerCase().includes('dao')) {
      responsibilities.push('データアクセス処理');
    }

    // メソッド名から推論
    const crudMethods = methods.filter(m => 
      m.includes('create') || m.includes('read') || m.includes('update') || m.includes('delete') ||
      m.includes('get') || m.includes('set') || m.includes('save') || m.includes('find')
    );
    if (crudMethods.length > 0) {
      responsibilities.push('CRUD操作');
    }

    if (methods.some(m => m.includes('validate'))) {
      responsibilities.push('データ検証');
    }

    if (methods.some(m => m.includes('auth') || m.includes('login') || m.includes('permission'))) {
      responsibilities.push('認証・認可');
    }

    return responsibilities.length > 0 ? responsibilities : ['汎用処理'];
  }

  private analyzeModule(content: string, filePath: string): CodeStructure['modules'][0] | null {
    const imports = this.extractImports(content);
    const exports = this.extractExports(content);
    const purpose = this.inferModulePurpose(filePath, imports, exports);
    const coupling = this.calculateCoupling(imports);

    return {
      name: filePath.split('/').pop()?.replace(/\.(js|ts|jsx|tsx)$/, '') || filePath,
      file: filePath,
      exports,
      imports,
      purpose,
      coupling,
    };
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importPatterns = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ];

    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1]);
      }
    });

    return imports;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportPatterns = [
      /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
      /export\s*{\s*([^}]+)\s*}/g,
    ];

    exportPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (pattern.source.includes('{')) {
          // 複数エクスポートの場合
          const items = match[1].split(',').map(item => item.trim());
          exports.push(...items);
        } else {
          exports.push(match[1]);
        }
      }
    });

    return exports;
  }

  private inferModulePurpose(filePath: string, imports: string[], exports: string[]): string {
    const fileName = filePath.toLowerCase();
    
    if (fileName.includes('controller')) return 'HTTPリクエスト処理';
    if (fileName.includes('service')) return 'ビジネスロジック実装';
    if (fileName.includes('model') || fileName.includes('entity')) return 'データモデル定義';
    if (fileName.includes('repository') || fileName.includes('dao')) return 'データアクセス層';
    if (fileName.includes('middleware')) return 'リクエスト前処理';
    if (fileName.includes('util') || fileName.includes('helper')) return 'ユーティリティ機能';
    if (fileName.includes('config')) return '設定管理';
    if (fileName.includes('route')) return 'ルーティング定義';
    if (fileName.includes('component')) return 'UIコンポーネント';
    if (fileName.includes('hook')) return 'カスタムフック';

    // インポートから推論
    if (imports.some(imp => imp.includes('react'))) return 'Reactコンポーネント';
    if (imports.some(imp => imp.includes('express'))) return 'Express処理';
    if (imports.some(imp => imp.includes('prisma') || imp.includes('sequelize'))) return 'データベース操作';

    return '汎用モジュール';
  }

  private calculateCoupling(imports: string[]): number {
    // 外部依存度を0-10のスケールで評価
    const externalImports = imports.filter(imp => !imp.startsWith('.'));
    return Math.min(externalImports.length, 10);
  }

  private estimateLineCount(content: string, functionStart: number): number {
    const beforeFunction = content.substring(0, functionStart);
    const startLine = beforeFunction.split('\n').length;
    
    // 簡単な推定（実際の実装ではASTを使用すべき）
    const afterFunction = content.substring(functionStart);
    const braceCount = (afterFunction.match(/{/g) || []).length - (afterFunction.match(/}/g) || []).length;
    
    return Math.min(50, Math.max(5, braceCount * 3)); // 5-50行の範囲で推定
  }

  private estimateComplexity(content: string, functionStart: number): number {
    const functionContent = this.extractFunctionContent(content, functionStart);
    
    let complexity = 1; // 基本複雑度
    
    // 条件分岐
    complexity += (functionContent.match(/if\s*\(/g) || []).length;
    complexity += (functionContent.match(/else/g) || []).length;
    complexity += (functionContent.match(/switch/g) || []).length;
    complexity += (functionContent.match(/case\s/g) || []).length;
    
    // ループ
    complexity += (functionContent.match(/for\s*\(/g) || []).length;
    complexity += (functionContent.match(/while\s*\(/g) || []).length;
    complexity += (functionContent.match(/forEach/g) || []).length;
    
    // 例外処理
    complexity += (functionContent.match(/try\s*{/g) || []).length;
    complexity += (functionContent.match(/catch\s*\(/g) || []).length;
    
    return complexity;
  }

  private extractFunctionContent(content: string, functionStart: number): string {
    // 関数の中身を抽出する簡単な実装
    const afterFunction = content.substring(functionStart);
    const openBrace = afterFunction.indexOf('{');
    if (openBrace === -1) return '';
    
    let braceCount = 0;
    let endIndex = openBrace;
    
    for (let i = openBrace; i < afterFunction.length; i++) {
      if (afterFunction[i] === '{') braceCount++;
      if (afterFunction[i] === '}') braceCount--;
      if (braceCount === 0) {
        endIndex = i;
        break;
      }
    }
    
    return afterFunction.substring(openBrace + 1, endIndex);
  }

  private extractDependencies(content: string, functionStart: number): string[] {
    const functionContent = this.extractFunctionContent(content, functionStart);
    const dependencies: string[] = [];
    
    // 関数呼び出しを検出
    const functionCalls = functionContent.match(/(\w+)\s*\(/g);
    if (functionCalls) {
      functionCalls.forEach(call => {
        const funcName = call.replace(/\s*\($/, '');
        if (funcName && !['if', 'for', 'while', 'switch'].includes(funcName)) {
          dependencies.push(funcName);
        }
      });
    }
    
    return [...new Set(dependencies)]; // 重複除去
  }

  private analyzeBusinessLogic(): BusinessLogic {
    // 実装は続く...
    return {
      domains: [],
      workflows: [],
      dataModels: [],
    };
  }

  private analyzeAPIStructure(): APIAnalysis {
    const endpoints: APIAnalysis['endpoints'] = [];
    
    // Express.js ルート検出
    Object.entries(this.sourceFiles).forEach(([filePath, content]) => {
      const routePatterns = [
        /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      ];

      routePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          endpoints.push({
            path: match[2],
            method: match[1].toUpperCase(),
            purpose: this.inferEndpointPurpose(match[2], match[1]),
            inputSchema: {},
            outputSchema: {},
            middleware: this.extractMiddleware(content, match.index),
            file: filePath,
          });
        }
      });
    });

    return {
      endpoints,
      database: {
        type: this.detectDatabaseType(),
        schema: {
          tables: this.extractDatabaseTables(),
          relationships: [],
          indexes: [],
        },
        queries: [],
      },
      integrations: this.detectIntegrations(),
    };
  }

  private inferEndpointPurpose(path: string, method: string): string {
    const normalizedPath = path.toLowerCase();
    
    if (method === 'get') {
      if (normalizedPath.includes('list') || normalizedPath.endsWith('s')) return 'データ一覧取得';
      if (normalizedPath.includes(':id')) return '単一データ取得';
      return 'データ取得';
    }
    
    if (method === 'post') {
      if (normalizedPath.includes('login')) return 'ログイン処理';
      if (normalizedPath.includes('register')) return 'ユーザー登録';
      return 'データ作成';
    }
    
    if (method === 'put' || method === 'patch') return 'データ更新';
    if (method === 'delete') return 'データ削除';
    
    return '不明な処理';
  }

  private extractMiddleware(content: string, routeIndex: number): string[] {
    // ルート定義周辺からミドルウェアを検出
    const middlewares: string[] = [];
    const beforeRoute = content.substring(Math.max(0, routeIndex - 200), routeIndex);
    
    const middlewarePatterns = [
      /(\w+Auth)/g,
      /(\w+Validate)/g,
      /(\w+Check)/g,
    ];

    middlewarePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(beforeRoute)) !== null) {
        middlewares.push(match[1]);
      }
    });

    return middlewares;
  }

  private detectDatabaseType(): string {
    const dbIndicators = {
      'PostgreSQL': ['pg', 'postgres', 'postgresql'],
      'MySQL': ['mysql', 'mysql2'],
      'MongoDB': ['mongodb', 'mongoose'],
      'SQLite': ['sqlite', 'sqlite3'],
      'Redis': ['redis', 'ioredis'],
    };

    for (const [dbType, indicators] of Object.entries(dbIndicators)) {
      if (indicators.some(indicator => 
        Object.values(this.files).some(content => 
          content && content.includes(indicator)
        )
      )) {
        return dbType;
      }
    }

    return '不明';
  }

  private extractDatabaseTables(): string[] {
    const tables: string[] = [];
    
    Object.values(this.sourceFiles).forEach(content => {
      // Prisma schema検出
      const prismaModels = content.match(/model\s+(\w+)\s*{/g);
      if (prismaModels) {
        prismaModels.forEach(model => {
          const tableName = model.match(/model\s+(\w+)/)?.[1];
          if (tableName) tables.push(tableName);
        });
      }
      
      // Sequelize モデル検出
      const sequelizeModels = content.match(/sequelize\.define\s*\(\s*['"`](\w+)['"`]/g);
      if (sequelizeModels) {
        sequelizeModels.forEach(model => {
          const tableName = model.match(/['"`](\w+)['"`]/)?.[1];
          if (tableName) tables.push(tableName);
        });
      }
    });
    
    return [...new Set(tables)];
  }

  private detectIntegrations(): APIAnalysis['integrations'] {
    const integrations: APIAnalysis['integrations'] = [];
    
    const servicePatterns = {
      'AWS': ['aws-sdk', 'boto3', '@aws-sdk'],
      'Google Cloud': ['@google-cloud', 'google-cloud'],
      'Stripe': ['stripe'],
      'SendGrid': ['sendgrid', '@sendgrid'],
      'Twilio': ['twilio'],
      'Firebase': ['firebase', 'firebase-admin'],
      'OpenAI': ['openai'],
    };

    Object.entries(servicePatterns).forEach(([service, patterns]) => {
      patterns.forEach(pattern => {
        if (Object.values(this.files).some(content => 
          content && content.includes(pattern)
        )) {
          integrations.push({
            service,
            type: 'api',
            usage: this.extractServiceUsage(service, pattern),
          });
        }
      });
    });

    return integrations;
  }

  private extractServiceUsage(service: string, pattern: string): string[] {
    const usage: string[] = [];
    
    Object.entries(this.sourceFiles).forEach(([filePath, content]) => {
      if (content.includes(pattern)) {
        // サービス固有の使用パターンを検出
        if (service === 'Stripe') {
          if (content.includes('createPaymentIntent')) usage.push('決済処理');
          if (content.includes('createCustomer')) usage.push('顧客管理');
        }
        if (service === 'AWS') {
          if (content.includes('S3')) usage.push('ファイルストレージ');
          if (content.includes('SES')) usage.push('メール送信');
          if (content.includes('Lambda')) usage.push('サーバーレス実行');
        }
        if (service === 'OpenAI') {
          if (content.includes('createCompletion')) usage.push('テキスト生成');
          if (content.includes('createEmbedding')) usage.push('埋め込み生成');
        }
      }
    });

    return usage.length > 0 ? usage : ['一般的な利用'];
  }

  private identifyQualityIssues(): QualityIssues {
    const codeSmells: QualityIssues['codeSmells'] = [];
    const performanceIssues: QualityIssues['performanceIssues'] = [];
    const securityVulnerabilities: QualityIssues['securityVulnerabilities'] = [];
    const technicalDebt: QualityIssues['technicalDebt'] = [];

    Object.entries(this.sourceFiles).forEach(([filePath, content]) => {
      // コードスメル検出
      this.detectCodeSmells(content, filePath, codeSmells);
      
      // パフォーマンス問題検出
      this.detectPerformanceIssues(content, filePath, performanceIssues);
      
      // セキュリティ脆弱性検出
      this.detectSecurityVulnerabilities(content, filePath, securityVulnerabilities);
    });

    // 技術的負債の評価
    this.assessTechnicalDebt(technicalDebt);

    return {
      codeSmells,
      performanceIssues,
      securityVulnerabilities,
      technicalDebt,
    };
  }

  private detectCodeSmells(content: string, filePath: string, codeSmells: QualityIssues['codeSmells']): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // 長すぎる行
      if (line.length > 120) {
        codeSmells.push({
          type: 'Long Line',
          description: `行が${line.length}文字と長すぎます（推奨: 120文字以下）`,
          file: filePath,
          line: index + 1,
          severity: 'low',
          suggestion: '行を分割して可読性を向上させてください',
        });
      }
      
      // コメントアウトされたコード
      if (line.trim().startsWith('//') && line.length > 50) {
        codeSmells.push({
          type: 'Commented Code',
          description: 'コメントアウトされたコードが残っています',
          file: filePath,
          line: index + 1,
          severity: 'medium',
          suggestion: '不要なコードは削除し、必要であればバージョン管理システムで管理してください',
        });
      }
      
      // マジックナンバー
      const magicNumbers = line.match(/\b\d{3,}\b/g);
      if (magicNumbers) {
        codeSmells.push({
          type: 'Magic Number',
          description: `マジックナンバー ${magicNumbers.join(', ')} が使用されています`,
          file: filePath,
          line: index + 1,
          severity: 'medium',
          suggestion: '名前付き定数を使用してください',
        });
      }
    });

    // 長い関数
    const longFunctions = this.findLongFunctions(content);
    longFunctions.forEach(func => {
      codeSmells.push({
        type: 'Long Function',
        description: `関数 ${func.name} が${func.lines}行と長すぎます`,
        file: filePath,
        line: func.startLine,
        severity: 'high',
        suggestion: '関数を小さな単位に分割してください',
      });
    });
  }

  private findLongFunctions(content: string): Array<{ name: string; lines: number; startLine: number }> {
    // 関数の長さを検出する簡単な実装
    const functions: Array<{ name: string; lines: number; startLine: number }> = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const functionMatch = line.match(/function\s+(\w+)|const\s+(\w+)\s*=.*=>/);
      
      if (functionMatch) {
        const name = functionMatch[1] || functionMatch[2];
        let braceCount = 0;
        let functionEnd = i;
        
        for (let j = i; j < lines.length; j++) {
          braceCount += (lines[j].match(/{/g) || []).length;
          braceCount -= (lines[j].match(/}/g) || []).length;
          
          if (braceCount === 0 && j > i) {
            functionEnd = j;
            break;
          }
        }
        
        const functionLines = functionEnd - i + 1;
        if (functionLines > 30) {
          functions.push({
            name,
            lines: functionLines,
            startLine: i + 1,
          });
        }
      }
    }
    
    return functions;
  }

  private detectPerformanceIssues(content: string, filePath: string, issues: QualityIssues['performanceIssues']): void {
    // N+1クエリ問題
    if (content.includes('forEach') && content.includes('await') && content.includes('find')) {
      issues.push({
        type: 'Potential N+1 Query',
        description: 'ループ内でのデータベースクエリ実行が検出されました',
        file: filePath,
        impact: 'データベースへの過剰なクエリ実行',
        solution: 'バッチクエリやJOINを使用してクエリ数を削減してください',
      });
    }
    
    // 同期的なファイル操作
    if (content.includes('readFileSync') || content.includes('writeFileSync')) {
      issues.push({
        type: 'Synchronous File Operation',
        description: '同期的なファイル操作が検出されました',
        file: filePath,
        impact: 'アプリケーションのブロッキング',
        solution: '非同期版（readFile/writeFile）を使用してください',
      });
    }
    
    // 大きなデータの一括処理
    if (content.includes('.map(') && content.includes('await') && !content.includes('Promise.all')) {
      issues.push({
        type: 'Sequential Async Operations',
        description: '配列の非同期処理が順次実行されています',
        file: filePath,
        impact: '処理時間の増大',
        solution: 'Promise.allを使用して並列処理を検討してください',
      });
    }
  }

  private detectSecurityVulnerabilities(content: string, filePath: string, vulns: QualityIssues['securityVulnerabilities']): void {
    // SQL injection risk
    if (content.includes('query(') && content.includes('${') && !content.includes('prepared')) {
      vulns.push({
        type: 'SQL Injection Risk',
        description: '文字列結合によるSQLクエリ構築が検出されました',
        file: filePath,
        risk: 'high',
        mitigation: 'パラメータ化クエリまたはORMを使用してください',
      });
    }
    
    // XSS risk
    if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
      vulns.push({
        type: 'XSS Risk',
        description: '生のHTMLの挿入が検出されました',
        file: filePath,
        risk: 'medium',
        mitigation: 'サニタイゼーション処理を追加してください',
      });
    }
    
    // Hard-coded secrets
    const secretPatterns = [
      /password\s*[:=]\s*['"][^'"]+['"]/i,
      /api_key\s*[:=]\s*['"][^'"]+['"]/i,
      /secret\s*[:=]\s*['"][^'"]+['"]/i,
    ];
    
    secretPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        vulns.push({
          type: 'Hard-coded Secret',
          description: 'コード内にハードコードされた秘密情報が検出されました',
          file: filePath,
          risk: 'critical',
          mitigation: '環境変数や秘密管理システムを使用してください',
        });
      }
    });
  }

  private assessTechnicalDebt(debt: QualityIssues['technicalDebt']): void {
    // TODO/FIXME コメントの集計
    const todoCount = Object.values(this.sourceFiles).reduce((count, content) => {
      return count + (content.match(/TODO|FIXME|HACK/gi) || []).length;
    }, 0);
    
    if (todoCount > 10) {
      debt.push({
        category: 'Deferred Tasks',
        description: `${todoCount}個のTODO/FIXMEコメントが残っています`,
        estimatedEffort: `${Math.ceil(todoCount / 5)}日`,
        businessImpact: '将来的な保守性の低下',
      });
    }
    
    // 古いライブラリの使用
    const packageJson = this.files['package.json'];
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        // 古いReactバージョン
        if (deps.react && deps.react.startsWith('^16')) {
          debt.push({
            category: 'Outdated Framework',
            description: 'React 16系を使用しています（現在の推奨: 18系）',
            estimatedEffort: '1-2週間',
            businessImpact: 'セキュリティリスクとパフォーマンス機会の損失',
          });
        }
        
        // 古いNode.jsバージョン
        if (deps.node && parseInt(deps.node) < 18) {
          debt.push({
            category: 'Outdated Runtime',
            description: '古いNode.jsバージョンを使用しています',
            estimatedEffort: '数日',
            businessImpact: 'セキュリティリスクとパフォーマンス問題',
          });
        }
      } catch (e) {
        // package.jsonのパースエラーを無視
      }
    }
  }

  private performCompetitiveAnalysis(): CompetitiveAnalysis {
    const industryComparison: CompetitiveAnalysis['industryComparison'] = [];
    const modernizationNeeds: CompetitiveAnalysis['modernizationNeeds'] = [];

    // フレームワークの現代性評価
    const packageJson = this.files['package.json'];
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        // フロントエンド技術の評価
        if (deps.react) {
          industryComparison.push({
            category: 'Frontend Framework',
            standardApproach: 'React 18 with Hooks, TypeScript, Modern build tools',
            projectApproach: `React ${deps.react} with ${deps.typescript ? 'TypeScript' : 'JavaScript'}`,
            assessment: this.assessReactModernity(deps),
            recommendations: this.getReactRecommendations(deps),
          });
        }
        
        // バックエンド技術の評価
        if (deps.express) {
          industryComparison.push({
            category: 'Backend Framework',
            standardApproach: 'Express with TypeScript, proper middleware, error handling',
            projectApproach: `Express ${deps.express}`,
            assessment: 'standard',
            recommendations: ['TypeScriptの導入', '適切なエラーハンドリング', 'セキュリティミドルウェアの追加'],
          });
        }
        
        // データベース技術の評価
        this.evaluateDatabaseApproach(industryComparison, deps);
        
        // テスト戦略の評価
        this.evaluateTestingApproach(industryComparison, deps);
        
        // デプロイメント戦略の評価
        this.evaluateDeploymentApproach(industryComparison);
      } catch (e) {
        // パースエラーを無視
      }
    }

    // モダナイゼーションの必要性評価
    this.assessModernizationNeeds(modernizationNeeds);

    return {
      industryComparison,
      modernizationNeeds,
    };
  }

  private assessReactModernity(deps: Record<string, string>): 'behind' | 'standard' | 'advanced' {
    const reactVersion = deps.react;
    if (!reactVersion) return 'behind';
    
    const majorVersion = parseInt(reactVersion.replace(/[\^~]/, ''));
    if (majorVersion >= 18) return 'advanced';
    if (majorVersion >= 17) return 'standard';
    return 'behind';
  }

  private getReactRecommendations(deps: Record<string, string>): string[] {
    const recommendations: string[] = [];
    
    if (!deps.typescript) {
      recommendations.push('TypeScriptの導入で型安全性向上');
    }
    
    if (!deps['@testing-library/react']) {
      recommendations.push('React Testing Libraryでテスト強化');
    }
    
    if (!deps.eslint || !deps['eslint-plugin-react']) {
      recommendations.push('ESLint + React用ルールでコード品質向上');
    }
    
    const reactVersion = parseInt(deps.react?.replace(/[\^~]/, '') || '0');
    if (reactVersion < 18) {
      recommendations.push('React 18へのアップグレードで並行機能活用');
    }
    
    return recommendations;
  }

  private evaluateDatabaseApproach(comparison: CompetitiveAnalysis['industryComparison'], deps: Record<string, string>): void {
    let dbApproach = 'なし';
    let assessment: 'behind' | 'standard' | 'advanced' = 'behind';
    const recommendations: string[] = [];
    
    if (deps.prisma) {
      dbApproach = 'Prisma ORM';
      assessment = 'advanced';
    } else if (deps.sequelize) {
      dbApproach = 'Sequelize ORM';
      assessment = 'standard';
      recommendations.push('Prismaへの移行検討（開発体験向上）');
    } else if (deps.mongoose) {
      dbApproach = 'Mongoose ODM (MongoDB)';
      assessment = 'standard';
    } else if (deps.pg || deps.mysql || deps.sqlite3) {
      dbApproach = '生のSQLドライバー';
      assessment = 'behind';
      recommendations.push('ORMの導入でタイプセーフティと開発効率向上');
    }
    
    comparison.push({
      category: 'Database Access',
      standardApproach: 'Type-safe ORM (Prisma, TypeORM) with migration management',
      projectApproach: dbApproach,
      assessment,
      recommendations,
    });
  }

  private evaluateTestingApproach(comparison: CompetitiveAnalysis['industryComparison'], deps: Record<string, string>): void {
    const hasJest = Boolean(deps.jest || deps.vitest);
    const hasTestingLibrary = Boolean(deps['@testing-library/react'] || deps['@testing-library/jest-dom']);
    const hasE2E = Boolean(deps.cypress || deps.playwright || deps['@playwright/test']);
    
    let assessment: 'behind' | 'standard' | 'advanced' = 'behind';
    const recommendations: string[] = [];
    
    if (hasJest && hasTestingLibrary && hasE2E) {
      assessment = 'advanced';
    } else if (hasJest && hasTestingLibrary) {
      assessment = 'standard';
      recommendations.push('E2Eテストの追加でユーザー体験の保証');
    } else if (hasJest) {
      assessment = 'behind';
      recommendations.push('Testing Libraryでコンポーネントテスト強化');
      recommendations.push('E2Eテストフレームワークの導入');
    } else {
      recommendations.push('Jestでユニットテスト環境構築');
      recommendations.push('Testing Libraryでコンポーネントテスト追加');
      recommendations.push('E2Eテストフレームワークの導入');
    }
    
    comparison.push({
      category: 'Testing Strategy',
      standardApproach: 'Unit tests (Jest/Vitest) + Component tests (Testing Library) + E2E tests (Playwright/Cypress)',
      projectApproach: this.describeTestingApproach(hasJest, hasTestingLibrary, hasE2E),
      assessment,
      recommendations,
    });
  }

  private describeTestingApproach(hasJest: boolean, hasTestingLibrary: boolean, hasE2E: boolean): string {
    const approaches: string[] = [];
    if (hasJest) approaches.push('ユニットテスト');
    if (hasTestingLibrary) approaches.push('コンポーネントテスト');
    if (hasE2E) approaches.push('E2Eテスト');
    return approaches.length > 0 ? approaches.join(' + ') : 'テストなし';
  }

  private evaluateDeploymentApproach(comparison: CompetitiveAnalysis['industryComparison']): void {
    const hasDockerfile = Boolean(this.files['Dockerfile']);
    const hasGitHubActions = Boolean(this.files['.github/workflows']);
    const hasVercelConfig = Boolean(this.files['vercel.json']);
    const hasK8sConfig = Object.keys(this.files).some(path => path.includes('kubernetes') || path.includes('k8s'));
    
    let assessment: 'behind' | 'standard' | 'advanced' = 'behind';
    const recommendations: string[] = [];
    let approach = 'デプロイメント設定なし';
    
    if (hasK8sConfig) {
      approach = 'Kubernetes orchestration';
      assessment = 'advanced';
    } else if (hasDockerfile && hasGitHubActions) {
      approach = 'Docker + CI/CD';
      assessment = 'standard';
      recommendations.push('Kubernetesでスケーラビリティ向上検討');
    } else if (hasVercelConfig || hasGitHubActions) {
      approach = 'Platform as a Service';
      assessment = 'standard';
    } else if (hasDockerfile) {
      approach = 'Docker containerization';
      assessment = 'behind';
      recommendations.push('CI/CDパイプラインの構築');
    } else {
      recommendations.push('Dockerでコンテナ化');
      recommendations.push('CI/CDパイプラインの構築');
      recommendations.push('デプロイメント自動化');
    }
    
    comparison.push({
      category: 'Deployment & DevOps',
      standardApproach: 'Docker + CI/CD + Infrastructure as Code + Monitoring',
      projectApproach: approach,
      assessment,
      recommendations,
    });
  }

  private assessModernizationNeeds(needs: CompetitiveAnalysis['modernizationNeeds']): void {
    // TypeScript移行の必要性
    if (!this.files['tsconfig.json']) {
      needs.push({
        area: 'Type Safety',
        currentState: 'JavaScript のみ',
        recommendedState: 'TypeScript with strict mode',
        effort: 'high',
        priority: 'high',
      });
    }
    
    // モニタリングの必要性
    const hasMonitoring = Object.values(this.sourceFiles).some(content => 
      content.includes('sentry') || content.includes('datadog') || content.includes('newrelic')
    );
    
    if (!hasMonitoring) {
      needs.push({
        area: 'Monitoring & Observability',
        currentState: 'ログ出力のみ',
        recommendedState: 'APM + Error tracking + Metrics',
        effort: 'medium',
        priority: 'medium',
      });
    }
    
    // セキュリティ強化の必要性
    const hasSecurityMiddleware = Object.values(this.sourceFiles).some(content => 
      content.includes('helmet') || content.includes('cors') || content.includes('rate-limit')
    );
    
    if (!hasSecurityMiddleware) {
      needs.push({
        area: 'Security',
        currentState: '基本的なセキュリティ対策',
        recommendedState: 'Security headers + Rate limiting + Input validation',
        effort: 'low',
        priority: 'high',
      });
    }
  }

  private generateInsights(
    codeStructure: CodeStructure,
    businessLogic: BusinessLogic,
    qualityIssues: QualityIssues
  ): { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // 強み分析
    if (codeStructure.modules.some(m => m.coupling < 3)) {
      strengths.push('低結合なモジュール設計で保守性が高い');
    }
    
    if (this.files['tsconfig.json']) {
      strengths.push('TypeScriptによる型安全性を確保');
    }
    
    if (qualityIssues.securityVulnerabilities.length === 0) {
      strengths.push('明らかなセキュリティ脆弱性が検出されず');
    }
    
    // 弱み分析
    if (qualityIssues.codeSmells.filter(cs => cs.severity === 'high').length > 5) {
      weaknesses.push('高重要度のコード品質問題が多数存在');
    }
    
    if (qualityIssues.performanceIssues.length > 3) {
      weaknesses.push('パフォーマンス問題が複数箇所で検出');
    }
    
    if (codeStructure.functions.some(f => f.complexity > 10)) {
      weaknesses.push('複雑度の高い関数が存在し、保守が困難');
    }
    
    // 機会分析
    if (!this.files['Dockerfile']) {
      opportunities.push('コンテナ化による開発・デプロイメント効率向上');
    }
    
    if (qualityIssues.technicalDebt.length > 0) {
      opportunities.push('技術的負債の解消による開発速度向上');
    }
    
    // 脅威分析
    if (qualityIssues.securityVulnerabilities.some(v => v.risk === 'critical')) {
      threats.push('クリティカルなセキュリティ脆弱性による情報漏洩リスク');
    }
    
    if (qualityIssues.technicalDebt.length > 5) {
      threats.push('技術的負債の蓄積による開発速度低下');
    }

    return { strengths, weaknesses, opportunities, threats };
  }

  private generateRecommendations(
    qualityIssues: QualityIssues,
    competitiveAnalysis: CompetitiveAnalysis
  ): { immediate: string[]; shortTerm: string[]; longTerm: string[] } {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // 即座に対応すべき項目
    qualityIssues.securityVulnerabilities
      .filter(v => v.risk === 'critical')
      .forEach(v => immediate.push(`緊急: ${v.description} - ${v.mitigation}`));
    
    qualityIssues.performanceIssues
      .slice(0, 3)
      .forEach(p => immediate.push(`パフォーマンス改善: ${p.solution}`));

    // 短期的な改善項目
    qualityIssues.codeSmells
      .filter(cs => cs.severity === 'high')
      .slice(0, 5)
      .forEach(cs => shortTerm.push(`コード品質: ${cs.suggestion}`));
    
    competitiveAnalysis.modernizationNeeds
      .filter(n => n.priority === 'high' && n.effort !== 'high')
      .forEach(n => shortTerm.push(`モダナイゼーション: ${n.currentState} → ${n.recommendedState}`));

    // 長期的な戦略項目
    competitiveAnalysis.modernizationNeeds
      .filter(n => n.effort === 'high')
      .forEach(n => longTerm.push(`戦略的改善: ${n.area}の${n.recommendedState}への移行`));
    
    qualityIssues.technicalDebt
      .filter(td => td.estimatedEffort.includes('週'))
      .forEach(td => longTerm.push(`技術的負債解消: ${td.description}`));

    return { immediate, shortTerm, longTerm };
  }
}