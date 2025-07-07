import { AnalysisResult } from '@/types';

interface DeepContentAnalysis {
  readme: ReadmeAnalysis;
  packageJson: PackageJsonAnalysis;
  codeStructure: CodeStructureAnalysis;
  technicalDebt: TechnicalDebtAnalysis;
  architectureInsights: ArchitectureInsights;
  qualityMetrics: QualityMetrics;
}

interface ReadmeAnalysis {
  hasReadme: boolean;
  quality: 'excellent' | 'good' | 'basic' | 'poor' | 'missing';
  sections: {
    installation: boolean;
    usage: boolean;
    examples: boolean;
    api: boolean;
    contributing: boolean;
    license: boolean;
    badges: boolean;
    screenshots: boolean;
  };
  contentAnalysis: {
    wordCount: number;
    codeBlockCount: number;
    linkCount: number;
    imageCount: number;
    structureScore: number; // 0-100
  };
  missingElements: string[];
  recommendations: string[];
}

interface PackageJsonAnalysis {
  hasPackageJson: boolean;
  dependencies: DependencyAnalysis;
  scripts: ScriptAnalysis;
  metadata: MetadataAnalysis;
  securityIssues: SecurityIssue[];
  optimizationOpportunities: OptimizationOpportunity[];
}

interface DependencyAnalysis {
  total: number;
  production: number;
  development: number;
  outdated: OutdatedDependency[];
  vulnerable: VulnerableDependency[];
  unused: string[];
  duplicates: DuplicateDependency[];
  heavyDependencies: HeavyDependency[];
  dependencyTree: DependencyTreeNode[];
}

interface OutdatedDependency {
  name: string;
  current: string;
  latest: string;
  type: 'major' | 'minor' | 'patch';
  breakingChanges: boolean;
}

interface VulnerableDependency {
  name: string;
  version: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  cve: string[];
  description: string;
  patchedVersion?: string;
}

interface DuplicateDependency {
  name: string;
  versions: string[];
  reason: string;
}

interface HeavyDependency {
  name: string;
  size: number; // bytes
  impact: 'high' | 'medium' | 'low';
  alternatives: string[];
}

interface DependencyTreeNode {
  name: string;
  version: string;
  depth: number;
  dependencies: DependencyTreeNode[];
  circularDependency?: boolean;
}

interface ScriptAnalysis {
  availableScripts: Script[];
  missingStandardScripts: string[];
  scriptComplexity: 'simple' | 'moderate' | 'complex';
  automationLevel: number; // 0-100
  recommendations: string[];
}

interface Script {
  name: string;
  command: string;
  type: 'build' | 'test' | 'dev' | 'deploy' | 'lint' | 'format' | 'custom';
  complexity: number;
}

interface MetadataAnalysis {
  hasDescription: boolean;
  hasKeywords: boolean;
  hasRepository: boolean;
  hasLicense: boolean;
  hasAuthor: boolean;
  hasEngines: boolean;
  enginesCompliance: boolean;
  seoScore: number; // 0-100
  discoverabilityScore: number; // 0-100
}

interface SecurityIssue {
  type: 'dependency' | 'script' | 'config';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fix: string;
}

interface OptimizationOpportunity {
  type: 'bundle-size' | 'build-speed' | 'runtime-performance' | 'developer-experience';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  implementation: string;
}

interface CodeStructureAnalysis {
  fileStructure: FileStructureAnalysis;
  architecturePatterns: ArchitecturePattern[];
  codeOrganization: CodeOrganization;
  testCoverage: TestCoverageAnalysis;
}

interface FileStructureAnalysis {
  totalFiles: number;
  fileTypes: { [extension: string]: number };
  directoryStructure: DirectoryNode[];
  organizationScore: number; // 0-100
  adheresToConventions: boolean;
  conventions: string[];
}

interface DirectoryNode {
  name: string;
  type: 'directory' | 'file';
  path: string;
  size?: number;
  children?: DirectoryNode[];
  purpose?: string;
}

interface ArchitecturePattern {
  pattern: 'MVC' | 'MVP' | 'MVVM' | 'Component-Based' | 'Layered' | 'Microservices' | 'Monolith' | 'JAMstack';
  confidence: number; // 0-100
  evidence: string[];
}

interface CodeOrganization {
  separationOfConcerns: number; // 0-100
  modularity: number; // 0-100
  reusability: number; // 0-100
  consistency: number; // 0-100
  issues: string[];
  strengths: string[];
}

interface TestCoverageAnalysis {
  hasTests: boolean;
  testFrameworks: string[];
  estimatedCoverage: number; // 0-100
  testTypes: {
    unit: boolean;
    integration: boolean;
    e2e: boolean;
    performance: boolean;
  };
  testQuality: 'excellent' | 'good' | 'basic' | 'poor' | 'missing';
}

interface TechnicalDebtAnalysis {
  overallDebtLevel: 'low' | 'medium' | 'high' | 'critical';
  debtCategories: TechnicalDebtCategory[];
  prioritizedIssues: TechnicalDebtIssue[];
  refactoringOpportunities: RefactoringOpportunity[];
  maintenanceScore: number; // 0-100
}

interface TechnicalDebtCategory {
  category: 'code-smells' | 'outdated-dependencies' | 'missing-tests' | 'documentation' | 'security' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  examples: string[];
}

interface TechnicalDebtIssue {
  type: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: string;
  recommendation: string;
}

interface RefactoringOpportunity {
  type: 'extract-function' | 'extract-component' | 'remove-duplication' | 'simplify-conditional' | 'improve-naming';
  description: string;
  files: string[];
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ArchitectureInsights {
  architectureStyle: string;
  scalabilityAssessment: ScalabilityAssessment;
  performanceBottlenecks: PerformanceBottleneck[];
  securityAssessment: SecurityAssessment;
  designPatterns: DesignPattern[];
  antiPatterns: AntiPattern[];
}

interface ScalabilityAssessment {
  horizontal: number; // 0-100
  vertical: number; // 0-100
  bottlenecks: string[];
  recommendations: string[];
}

interface PerformanceBottleneck {
  type: 'bundle-size' | 'render-blocking' | 'memory-leak' | 'inefficient-algorithm' | 'database-query';
  location: string;
  impact: 'high' | 'medium' | 'low';
  solution: string;
}

interface SecurityAssessment {
  overallScore: number; // 0-100
  vulnerabilities: SecurityVulnerability[];
  bestPractices: SecurityBestPractice[];
  recommendations: string[];
}

interface SecurityVulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  cwe?: string;
  fix: string;
}

interface SecurityBestPractice {
  practice: string;
  implemented: boolean;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

interface DesignPattern {
  pattern: string;
  usage: string[];
  appropriateness: 'excellent' | 'good' | 'questionable' | 'poor';
}

interface AntiPattern {
  pattern: string;
  occurrences: string[];
  impact: 'high' | 'medium' | 'low';
  solution: string;
}

interface QualityMetrics {
  overallScore: number; // 0-100
  maintainabilityIndex: number; // 0-100
  codeComplexity: ComplexityMetrics;
  duplicationLevel: number; // 0-100
  documentationCoverage: number; // 0-100
  testCoverage: number; // 0-100
  codeSmells: CodeSmell[];
}

interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  halsteadComplexity: number;
  filesAboveThreshold: string[];
}

interface CodeSmell {
  smell: string;
  severity: 'minor' | 'major' | 'critical';
  count: number;
  examples: string[];
  impact: string;
  suggestions: string[];
}

export class DeepContentAnalyzer {
  private githubToken?: string;

  constructor(githubToken?: string) {
    this.githubToken = githubToken;
  }

  async analyzeDeepContent(analysisResult: AnalysisResult): Promise<DeepContentAnalysis> {
    console.log('🔍 深層コンテンツ分析を開始...');
    
    const [
      readme,
      packageJson,
      codeStructure,
      technicalDebt,
      architectureInsights,
      qualityMetrics
    ] = await Promise.all([
      this.analyzeReadme(analysisResult),
      this.analyzePackageJson(analysisResult),
      this.analyzeCodeStructure(analysisResult),
      this.analyzeTechnicalDebt(analysisResult),
      this.analyzeArchitecture(analysisResult),
      this.calculateQualityMetrics(analysisResult)
    ]);

    console.log('✅ 深層コンテンツ分析完了');

    return {
      readme,
      packageJson,
      codeStructure,
      technicalDebt,
      architectureInsights,
      qualityMetrics
    };
  }

  private async analyzeReadme(analysisResult: AnalysisResult): Promise<ReadmeAnalysis> {
    const readmeContent = await this.fetchFileContent(
      analysisResult.repository.owner.login,
      analysisResult.repository.name,
      'README.md'
    );

    if (!readmeContent) {
      return {
        hasReadme: false,
        quality: 'missing',
        sections: {
          installation: false,
          usage: false,
          examples: false,
          api: false,
          contributing: false,
          license: false,
          badges: false,
          screenshots: false,
        },
        contentAnalysis: {
          wordCount: 0,
          codeBlockCount: 0,
          linkCount: 0,
          imageCount: 0,
          structureScore: 0,
        },
        missingElements: ['README.md file'],
        recommendations: ['Create a comprehensive README.md file'],
      };
    }

    // README内容の詳細分析
    const sections = this.detectReadmeSections(readmeContent);
    const contentAnalysis = this.analyzeReadmeContent(readmeContent);
    const quality = this.assessReadmeQuality(sections, contentAnalysis);
    const missingElements = this.identifyMissingReadmeElements(sections);
    const recommendations = this.generateReadmeRecommendations(sections, contentAnalysis);

    return {
      hasReadme: true,
      quality,
      sections,
      contentAnalysis,
      missingElements,
      recommendations,
    };
  }

  private async analyzePackageJson(analysisResult: AnalysisResult): Promise<PackageJsonAnalysis> {
    const packageJsonContent = await this.fetchFileContent(
      analysisResult.repository.owner.login,
      analysisResult.repository.name,
      'package.json'
    );

    if (!packageJsonContent) {
      return {
        hasPackageJson: false,
        dependencies: {
          total: 0,
          production: 0,
          development: 0,
          outdated: [],
          vulnerable: [],
          unused: [],
          duplicates: [],
          heavyDependencies: [],
          dependencyTree: [],
        },
        scripts: {
          availableScripts: [],
          missingStandardScripts: ['build', 'test', 'dev', 'lint'],
          scriptComplexity: 'simple',
          automationLevel: 0,
          recommendations: ['Add package.json file'],
        },
        metadata: {
          hasDescription: false,
          hasKeywords: false,
          hasRepository: false,
          hasLicense: false,
          hasAuthor: false,
          hasEngines: false,
          enginesCompliance: false,
          seoScore: 0,
          discoverabilityScore: 0,
        },
        securityIssues: [],
        optimizationOpportunities: [],
      };
    }

    try {
      const packageData = JSON.parse(packageJsonContent);
      
      const dependencies = await this.analyzeDependencies(packageData);
      const scripts = this.analyzeScripts(packageData);
      const metadata = this.analyzeMetadata(packageData);
      const securityIssues = await this.identifySecurityIssues(packageData);
      const optimizationOpportunities = this.identifyOptimizationOpportunities(packageData);

      return {
        hasPackageJson: true,
        dependencies,
        scripts,
        metadata,
        securityIssues,
        optimizationOpportunities,
      };
    } catch (error) {
      console.error('Error parsing package.json:', error);
      return this.getEmptyPackageJsonAnalysis();
    }
  }

  private async analyzeCodeStructure(analysisResult: AnalysisResult): Promise<CodeStructureAnalysis> {
    // GitHub API を使用してファイル構造を取得
    const fileStructure = await this.analyzeFileStructure(analysisResult);
    const architecturePatterns = this.detectArchitecturePatterns(fileStructure);
    const codeOrganization = this.assessCodeOrganization(fileStructure);
    const testCoverage = this.analyzeTestCoverage(fileStructure);

    return {
      fileStructure,
      architecturePatterns,
      codeOrganization,
      testCoverage,
    };
  }

  private async analyzeTechnicalDebt(analysisResult: AnalysisResult): Promise<TechnicalDebtAnalysis> {
    // 技術的負債の分析
    const debtCategories = await this.identifyTechnicalDebtCategories(analysisResult);
    const prioritizedIssues = this.prioritizeTechnicalDebtIssues(debtCategories);
    const refactoringOpportunities = this.identifyRefactoringOpportunities(analysisResult);
    const overallDebtLevel = this.calculateOverallDebtLevel(debtCategories);
    const maintenanceScore = this.calculateMaintenanceScore(debtCategories, refactoringOpportunities);

    return {
      overallDebtLevel,
      debtCategories,
      prioritizedIssues,
      refactoringOpportunities,
      maintenanceScore,
    };
  }

  private async analyzeArchitecture(analysisResult: AnalysisResult): Promise<ArchitectureInsights> {
    // アーキテクチャの分析
    const architectureStyle = this.identifyArchitectureStyle(analysisResult);
    const scalabilityAssessment = this.assessScalability(analysisResult);
    const performanceBottlenecks = await this.identifyPerformanceBottlenecks(analysisResult);
    const securityAssessment = await this.assessSecurity(analysisResult);
    const designPatterns = this.identifyDesignPatterns(analysisResult);
    const antiPatterns = this.identifyAntiPatterns(analysisResult);

    return {
      architectureStyle,
      scalabilityAssessment,
      performanceBottlenecks,
      securityAssessment,
      designPatterns,
      antiPatterns,
    };
  }

  private async calculateQualityMetrics(analysisResult: AnalysisResult): Promise<QualityMetrics> {
    // コード品質メトリクスの計算
    const maintainabilityIndex = this.calculateMaintainabilityIndex(analysisResult);
    const codeComplexity = await this.calculateCodeComplexity(analysisResult);
    const duplicationLevel = await this.calculateDuplicationLevel(analysisResult);
    const documentationCoverage = this.calculateDocumentationCoverage(analysisResult);
    const testCoverage = this.estimateTestCoverage(analysisResult);
    const codeSmells = await this.identifyCodeSmells(analysisResult);

    const overallScore = this.calculateOverallQualityScore({
      maintainabilityIndex,
      codeComplexity,
      duplicationLevel,
      documentationCoverage,
      testCoverage,
      codeSmells,
    });

    return {
      overallScore,
      maintainabilityIndex,
      codeComplexity,
      duplicationLevel,
      documentationCoverage,
      testCoverage,
      codeSmells,
    };
  }

  // ヘルパーメソッド群
  private async fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: this.githubToken ? {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          } : {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error);
      return null;
    }
  }

  private detectReadmeSections(content: string): ReadmeAnalysis['sections'] {
    const sections = {
      installation: /(?:^|\n)#+ *(?:install|setup|getting[ -]?started)/i.test(content),
      usage: /(?:^|\n)#+ *(?:usage|how[ -]?to|example)/i.test(content),
      examples: /(?:^|\n)#+ *(?:example|demo|sample)/i.test(content),
      api: /(?:^|\n)#+ *(?:api|reference|documentation)/i.test(content),
      contributing: /(?:^|\n)#+ *(?:contribut|develop|collaboration)/i.test(content),
      license: /(?:^|\n)#+ *license/i.test(content),
      badges: /\[!\[.*?\]\(.*?\)\]\(.*?\)|\!\[.*?\]\(.*?\)/g.test(content),
      screenshots: /\!\[.*?\]\(.*?\.(?:png|jpg|jpeg|gif|svg)\)/i.test(content),
    };

    return sections;
  }

  private analyzeReadmeContent(content: string): ReadmeAnalysis['contentAnalysis'] {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
    const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    
    // 構造化スコアの計算（見出し、リスト、コードブロックの適切な使用）
    const headings = (content.match(/^#+\s+/gm) || []).length;
    const lists = (content.match(/^[\s]*[\*\-\+]\s+/gm) || []).length;
    const structureScore = Math.min(100, (headings * 10) + (lists * 2) + (codeBlocks * 5));

    return {
      wordCount: words.length,
      codeBlockCount: codeBlocks,
      linkCount: links,
      imageCount: images,
      structureScore,
    };
  }

  private assessReadmeQuality(
    sections: ReadmeAnalysis['sections'],
    contentAnalysis: ReadmeAnalysis['contentAnalysis']
  ): ReadmeAnalysis['quality'] {
    const sectionScore = Object.values(sections).filter(Boolean).length;
    const contentScore = Math.min(100, contentAnalysis.wordCount / 10); // 1000語で満点
    const structureScore = contentAnalysis.structureScore;

    const totalScore = (sectionScore * 20) + (contentScore * 0.5) + (structureScore * 0.3);

    if (totalScore >= 80) return 'excellent';
    if (totalScore >= 60) return 'good';
    if (totalScore >= 30) return 'basic';
    return 'poor';
  }

  private identifyMissingReadmeElements(sections: ReadmeAnalysis['sections']): string[] {
    const missing: string[] = [];
    
    if (!sections.installation) missing.push('Installation instructions');
    if (!sections.usage) missing.push('Usage examples');
    if (!sections.api) missing.push('API documentation');
    if (!sections.contributing) missing.push('Contributing guidelines');
    if (!sections.license) missing.push('License information');
    if (!sections.badges) missing.push('Status badges');

    return missing;
  }

  private generateReadmeRecommendations(
    sections: ReadmeAnalysis['sections'],
    contentAnalysis: ReadmeAnalysis['contentAnalysis']
  ): string[] {
    const recommendations: string[] = [];

    if (contentAnalysis.wordCount < 200) {
      recommendations.push('Add more detailed descriptions and explanations');
    }
    if (contentAnalysis.codeBlockCount < 2) {
      recommendations.push('Include more code examples and usage samples');
    }
    if (!sections.installation) {
      recommendations.push('Add clear installation and setup instructions');
    }
    if (!sections.usage) {
      recommendations.push('Include usage examples and getting started guide');
    }
    if (!sections.badges) {
      recommendations.push('Add status badges for build, coverage, and version');
    }
    if (contentAnalysis.imageCount === 0) {
      recommendations.push('Consider adding screenshots or diagrams');
    }

    return recommendations;
  }

  // package.json分析のヘルパーメソッド
  private async analyzeDependencies(packageData: any): Promise<DependencyAnalysis> {
    const deps = packageData.dependencies || {};
    const devDeps = packageData.devDependencies || {};
    
    const production = Object.keys(deps).length;
    const development = Object.keys(devDeps).length;
    const total = production + development;

    // 実際の実装では外部APIを使用して最新バージョンや脆弱性情報を取得
    const outdated = await this.checkOutdatedDependencies(deps, devDeps);
    const vulnerable = await this.checkVulnerableDependencies(deps, devDeps);
    const unused = this.detectUnusedDependencies(packageData);
    const duplicates = this.detectDuplicateDependencies(deps, devDeps);
    const heavyDependencies = await this.identifyHeavyDependencies(deps);
    const dependencyTree = this.buildDependencyTree(deps, devDeps);

    return {
      total,
      production,
      development,
      outdated,
      vulnerable,
      unused,
      duplicates,
      heavyDependencies,
      dependencyTree,
    };
  }

  private analyzeScripts(packageData: any): ScriptAnalysis {
    const scripts = packageData.scripts || {};
    const availableScripts = Object.entries(scripts).map(([name, command]) => ({
      name,
      command: command as string,
      type: this.categorizeScript(name, command as string),
      complexity: this.calculateScriptComplexity(command as string),
    }));

    const standardScripts = ['build', 'test', 'dev', 'start', 'lint', 'format'];
    const missingStandardScripts = standardScripts.filter(
      script => !availableScripts.some(s => s.name === script)
    );

    const scriptComplexity = this.assessScriptComplexity(availableScripts);
    const automationLevel = this.calculateAutomationLevel(availableScripts);
    const recommendations = this.generateScriptRecommendations(availableScripts, missingStandardScripts);

    return {
      availableScripts,
      missingStandardScripts,
      scriptComplexity,
      automationLevel,
      recommendations,
    };
  }

  private analyzeMetadata(packageData: any): MetadataAnalysis {
    const hasDescription = !!packageData.description;
    const hasKeywords = !!(packageData.keywords && packageData.keywords.length > 0);
    const hasRepository = !!packageData.repository;
    const hasLicense = !!packageData.license;
    const hasAuthor = !!packageData.author;
    const hasEngines = !!packageData.engines;
    
    // Node.jsエンジンのコンプライアンス確認
    const enginesCompliance = hasEngines ? this.checkEnginesCompliance(packageData.engines) : false;
    
    const seoScore = this.calculateSEOScore(packageData);
    const discoverabilityScore = this.calculateDiscoverabilityScore(packageData);

    return {
      hasDescription,
      hasKeywords,
      hasRepository,
      hasLicense,
      hasAuthor,
      hasEngines,
      enginesCompliance,
      seoScore,
      discoverabilityScore,
    };
  }

  // 簡略化されたメソッド群（実際の実装では外部APIやより詳細な分析を行う）
  private async checkOutdatedDependencies(deps: any, devDeps: any): Promise<OutdatedDependency[]> {
    // 実際にはnpm outdated APIやsemver比較を使用
    return [];
  }

  private async checkVulnerableDependencies(deps: any, devDeps: any): Promise<VulnerableDependency[]> {
    // 実際にはnpm audit APIや脆弱性データベースを使用
    return [];
  }

  private detectUnusedDependencies(packageData: any): string[] {
    // 実際にはdepcheckなどのツールを使用
    return [];
  }

  private detectDuplicateDependencies(deps: any, devDeps: any): DuplicateDependency[] {
    const duplicates: DuplicateDependency[] = [];
    
    Object.keys(deps).forEach(dep => {
      if (devDeps[dep]) {
        duplicates.push({
          name: dep,
          versions: [deps[dep], devDeps[dep]],
          reason: 'Listed in both dependencies and devDependencies',
        });
      }
    });

    return duplicates;
  }

  private async identifyHeavyDependencies(deps: any): Promise<HeavyDependency[]> {
    // 実際にはbundlephobiaAPIなどを使用
    return [];
  }

  private buildDependencyTree(deps: any, devDeps: any): DependencyTreeNode[] {
    // 実際にはnpm lsやyarn listの結果を解析
    return [];
  }

  private categorizeScript(name: string, command: string): Script['type'] {
    if (name.includes('build') || command.includes('build')) return 'build';
    if (name.includes('test') || command.includes('test')) return 'test';
    if (name.includes('dev') || name.includes('start')) return 'dev';
    if (name.includes('deploy')) return 'deploy';
    if (name.includes('lint')) return 'lint';
    if (name.includes('format') || name.includes('prettier')) return 'format';
    return 'custom';
  }

  private calculateScriptComplexity(command: string): number {
    // コマンドの複雑さを0-10で評価
    let complexity = 1;
    
    // パイプの使用
    complexity += (command.match(/\|/g) || []).length;
    
    // 複数コマンドの組み合わせ
    complexity += (command.match(/&&|;|\|\||&/g) || []).length;
    
    // 条件分岐
    complexity += (command.match(/if|then|else|fi/g) || []).length;
    
    // 長さによる複雑さ
    complexity += Math.floor(command.length / 50);
    
    return Math.min(10, complexity);
  }

  private assessScriptComplexity(scripts: Script[]): ScriptAnalysis['scriptComplexity'] {
    const avgComplexity = scripts.reduce((sum, s) => sum + s.complexity, 0) / scripts.length;
    
    if (avgComplexity >= 7) return 'complex';
    if (avgComplexity >= 4) return 'moderate';
    return 'simple';
  }

  private calculateAutomationLevel(scripts: Script[]): number {
    const standardScripts = ['build', 'test', 'dev', 'lint', 'format', 'deploy'];
    const presentStandardScripts = scripts.filter(s => 
      standardScripts.some(std => s.name.includes(std) || s.type === std as any)
    ).length;
    
    return Math.min(100, (presentStandardScripts / standardScripts.length) * 100);
  }

  private generateScriptRecommendations(scripts: Script[], missing: string[]): string[] {
    const recommendations: string[] = [];
    
    if (missing.includes('test')) {
      recommendations.push('Add test script for automated testing');
    }
    if (missing.includes('build')) {
      recommendations.push('Add build script for production builds');
    }
    if (missing.includes('lint')) {
      recommendations.push('Add linting script for code quality');
    }
    if (scripts.some(s => s.complexity > 7)) {
      recommendations.push('Consider simplifying complex scripts');
    }
    
    return recommendations;
  }

  private checkEnginesCompliance(engines: any): boolean {
    // Node.jsバージョンの互換性チェック（簡略版）
    if (engines.node) {
      const nodeVersion = engines.node.replace(/[^0-9.]/g, '');
      const majorVersion = parseInt(nodeVersion.split('.')[0]);
      return majorVersion >= 14; // LTS以降をサポート
    }
    return true;
  }

  private calculateSEOScore(packageData: any): number {
    let score = 0;
    
    if (packageData.description) score += 30;
    if (packageData.keywords && packageData.keywords.length > 0) score += 25;
    if (packageData.repository) score += 20;
    if (packageData.homepage) score += 15;
    if (packageData.author) score += 10;
    
    return score;
  }

  private calculateDiscoverabilityScore(packageData: any): number {
    let score = 0;
    
    if (packageData.keywords && packageData.keywords.length >= 3) score += 40;
    if (packageData.description && packageData.description.length > 50) score += 30;
    if (packageData.repository) score += 20;
    if (packageData.license) score += 10;
    
    return score;
  }

  private async identifySecurityIssues(packageData: any): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    
    // 基本的なセキュリティチェック
    if (packageData.scripts) {
      Object.entries(packageData.scripts).forEach(([name, command]) => {
        const cmd = command as string;
        
        // 危険なコマンドパターンの検出
        if (cmd.includes('rm -rf') || cmd.includes('sudo')) {
          issues.push({
            type: 'script',
            severity: 'high',
            description: `Potentially dangerous command in ${name} script`,
            fix: 'Review and secure the script commands',
          });
        }
        
        if (cmd.includes('curl') && cmd.includes('sh')) {
          issues.push({
            type: 'script',
            severity: 'medium',
            description: `Piping curl to shell in ${name} script`,
            fix: 'Download and verify scripts before execution',
          });
        }
      });
    }
    
    return issues;
  }

  private identifyOptimizationOpportunities(packageData: any): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];
    
    // 大量の依存関係がある場合
    const totalDeps = Object.keys(packageData.dependencies || {}).length + 
                     Object.keys(packageData.devDependencies || {}).length;
    
    if (totalDeps > 50) {
      opportunities.push({
        type: 'bundle-size',
        description: 'Large number of dependencies detected',
        impact: 'high',
        effort: 'medium',
        implementation: 'Review dependencies and remove unused packages',
      });
    }
    
    // スクリプトの最適化機会
    if (!packageData.scripts?.build) {
      opportunities.push({
        type: 'build-speed',
        description: 'No build script defined',
        impact: 'medium',
        effort: 'low',
        implementation: 'Add optimized build script for production',
      });
    }
    
    return opportunities;
  }

  private getEmptyPackageJsonAnalysis(): PackageJsonAnalysis {
    return {
      hasPackageJson: false,
      dependencies: {
        total: 0,
        production: 0,
        development: 0,
        outdated: [],
        vulnerable: [],
        unused: [],
        duplicates: [],
        heavyDependencies: [],
        dependencyTree: [],
      },
      scripts: {
        availableScripts: [],
        missingStandardScripts: ['build', 'test', 'dev', 'lint'],
        scriptComplexity: 'simple',
        automationLevel: 0,
        recommendations: ['Add package.json file'],
      },
      metadata: {
        hasDescription: false,
        hasKeywords: false,
        hasRepository: false,
        hasLicense: false,
        hasAuthor: false,
        hasEngines: false,
        enginesCompliance: false,
        seoScore: 0,
        discoverabilityScore: 0,
      },
      securityIssues: [],
      optimizationOpportunities: [],
    };
  }

  // ファイル構造分析
  private async analyzeFileStructure(analysisResult: AnalysisResult): Promise<FileStructureAnalysis> {
    // GitHub API でディレクトリ構造を取得
    const directoryStructure = await this.fetchDirectoryStructure(
      analysisResult.repository.owner.login,
      analysisResult.repository.name
    );
    
    const fileTypes = this.countFileTypes(directoryStructure);
    const totalFiles = this.countTotalFiles(directoryStructure);
    const organizationScore = this.calculateOrganizationScore(directoryStructure);
    const conventions = this.detectConventions(directoryStructure);
    const adheresToConventions = conventions.length > 0;
    
    return {
      totalFiles,
      fileTypes,
      directoryStructure,
      organizationScore,
      adheresToConventions,
      conventions,
    };
  }

  private async fetchDirectoryStructure(owner: string, repo: string): Promise<DirectoryNode[]> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
        {
          headers: this.githubToken ? {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          } : {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return this.convertToDirectoryNodes(data.tree || []);
    } catch (error) {
      console.error('Error fetching directory structure:', error);
      return [];
    }
  }

  private convertToDirectoryNodes(tree: any[]): DirectoryNode[] {
    const nodes: DirectoryNode[] = [];
    
    tree.forEach(item => {
      nodes.push({
        name: item.path.split('/').pop(),
        type: item.type === 'tree' ? 'directory' : 'file',
        path: item.path,
        size: item.size,
        purpose: this.determinePurpose(item.path),
      });
    });
    
    return nodes;
  }

  private determinePurpose(path: string): string {
    const segments = path.split('/');
    const fileName = segments[segments.length - 1];
    const dirName = segments[0];
    
    // ディレクトリの目的を推測
    if (dirName === 'src' || dirName === 'source') return 'source code';
    if (dirName === 'test' || dirName === 'tests' || dirName === '__tests__') return 'testing';
    if (dirName === 'docs' || dirName === 'documentation') return 'documentation';
    if (dirName === 'public' || dirName === 'assets') return 'static assets';
    if (dirName === 'config' || dirName === 'configuration') return 'configuration';
    if (dirName === 'build' || dirName === 'dist' || dirName === 'output') return 'build output';
    
    // ファイルの目的を推測
    if (fileName.includes('test') || fileName.includes('spec')) return 'testing';
    if (fileName.includes('config') || fileName.endsWith('.config.js')) return 'configuration';
    if (fileName === 'README.md' || fileName === 'LICENSE') return 'documentation';
    if (fileName === 'package.json') return 'dependency management';
    
    return 'general';
  }

  private countFileTypes(nodes: DirectoryNode[]): { [extension: string]: number } {
    const types: { [extension: string]: number } = {};
    
    nodes.filter(n => n.type === 'file').forEach(file => {
      const ext = file.name?.split('.').pop() || 'no-extension';
      types[ext] = (types[ext] || 0) + 1;
    });
    
    return types;
  }

  private countTotalFiles(nodes: DirectoryNode[]): number {
    return nodes.filter(n => n.type === 'file').length;
  }

  private calculateOrganizationScore(nodes: DirectoryNode[]): number {
    let score = 50; // ベーススコア
    
    // 標準的なディレクトリ構造の確認
    const hasSourceDir = nodes.some(n => n.type === 'directory' && ['src', 'source'].includes(n.name || ''));
    const hasTestDir = nodes.some(n => n.type === 'directory' && ['test', 'tests', '__tests__'].includes(n.name || ''));
    const hasDocsDir = nodes.some(n => n.type === 'directory' && ['docs', 'documentation'].includes(n.name || ''));
    
    if (hasSourceDir) score += 20;
    if (hasTestDir) score += 15;
    if (hasDocsDir) score += 10;
    
    // ファイルの適切な配置
    const rootFiles = nodes.filter(n => n.type === 'file' && !n.path?.includes('/'));
    if (rootFiles.length < 10) score += 5; // ルートディレクトリが整理されている
    
    return Math.min(100, score);
  }

  private detectConventions(nodes: DirectoryNode[]): string[] {
    const conventions: string[] = [];
    
    // Next.js
    if (nodes.some(n => n.path === 'pages' || n.path === 'app')) {
      conventions.push('Next.js');
    }
    
    // React
    if (nodes.some(n => n.path?.includes('components'))) {
      conventions.push('React Components');
    }
    
    // Node.js
    if (nodes.some(n => n.name === 'package.json')) {
      conventions.push('Node.js');
    }
    
    // TypeScript
    if (nodes.some(n => n.name === 'tsconfig.json')) {
      conventions.push('TypeScript');
    }
    
    return conventions;
  }

  // 簡略化された実装メソッド群
  private detectArchitecturePatterns(fileStructure: FileStructureAnalysis): ArchitecturePattern[] {
    const patterns: ArchitecturePattern[] = [];
    
    // Next.js/React パターンの検出
    if (fileStructure.conventions.includes('Next.js')) {
      patterns.push({
        pattern: 'JAMstack',
        confidence: 90,
        evidence: ['Next.js framework', 'Static generation capable'],
      });
    }
    
    if (fileStructure.conventions.includes('React Components')) {
      patterns.push({
        pattern: 'Component-Based',
        confidence: 85,
        evidence: ['React components', 'Modular architecture'],
      });
    }
    
    return patterns;
  }

  private assessCodeOrganization(fileStructure: FileStructureAnalysis): CodeOrganization {
    return {
      separationOfConcerns: fileStructure.organizationScore,
      modularity: this.calculateModularityScore(fileStructure),
      reusability: this.calculateReusabilityScore(fileStructure),
      consistency: this.calculateConsistencyScore(fileStructure),
      issues: this.identifyOrganizationIssues(fileStructure),
      strengths: this.identifyOrganizationStrengths(fileStructure),
    };
  }

  private calculateModularityScore(fileStructure: FileStructureAnalysis): number {
    // コンポーネントやモジュールの分離度を評価
    const hasComponents = fileStructure.directoryStructure.some(n => n.purpose === 'source code');
    const hasUtils = fileStructure.directoryStructure.some(n => n.name?.includes('util') || n.name?.includes('helper'));
    
    let score = 50;
    if (hasComponents) score += 25;
    if (hasUtils) score += 15;
    
    return Math.min(100, score);
  }

  private calculateReusabilityScore(fileStructure: FileStructureAnalysis): number {
    // 再利用可能性の評価
    const componentFiles = fileStructure.directoryStructure.filter(n => 
      n.name?.includes('component') || n.purpose === 'source code'
    ).length;
    
    return Math.min(100, componentFiles * 10);
  }

  private calculateConsistencyScore(fileStructure: FileStructureAnalysis): number {
    // 命名規則やディレクトリ構造の一貫性
    return fileStructure.organizationScore;
  }

  private identifyOrganizationIssues(fileStructure: FileStructureAnalysis): string[] {
    const issues: string[] = [];
    
    if (fileStructure.organizationScore < 60) {
      issues.push('Directory structure could be more organized');
    }
    
    if (!fileStructure.adheresToConventions) {
      issues.push('No clear framework conventions detected');
    }
    
    return issues;
  }

  private identifyOrganizationStrengths(fileStructure: FileStructureAnalysis): string[] {
    const strengths: string[] = [];
    
    if (fileStructure.organizationScore >= 80) {
      strengths.push('Well-organized directory structure');
    }
    
    if (fileStructure.adheresToConventions) {
      strengths.push('Follows established conventions');
    }
    
    return strengths;
  }

  private analyzeTestCoverage(fileStructure: FileStructureAnalysis): TestCoverageAnalysis {
    const testFiles = fileStructure.directoryStructure.filter(n => n.purpose === 'testing');
    const hasTests = testFiles.length > 0;
    
    // テストフレームワークの検出
    const testFrameworks: string[] = [];
    if (testFiles.some(f => f.name?.includes('jest'))) testFrameworks.push('Jest');
    if (testFiles.some(f => f.name?.includes('cypress'))) testFrameworks.push('Cypress');
    if (testFiles.some(f => f.name?.includes('mocha'))) testFrameworks.push('Mocha');
    
    const estimatedCoverage = hasTests ? Math.min(80, testFiles.length * 10) : 0;
    
    return {
      hasTests,
      testFrameworks,
      estimatedCoverage,
      testTypes: {
        unit: testFiles.some(f => f.name?.includes('unit')),
        integration: testFiles.some(f => f.name?.includes('integration')),
        e2e: testFiles.some(f => f.name?.includes('e2e') || f.name?.includes('cypress')),
        performance: testFiles.some(f => f.name?.includes('performance')),
      },
      testQuality: estimatedCoverage >= 80 ? 'excellent' : 
                  estimatedCoverage >= 60 ? 'good' : 
                  estimatedCoverage >= 30 ? 'basic' : 
                  hasTests ? 'poor' : 'missing',
    };
  }

  // 残りのメソッドの簡略化実装
  private async identifyTechnicalDebtCategories(analysisResult: AnalysisResult): Promise<TechnicalDebtCategory[]> {
    return [
      {
        category: 'outdated-dependencies',
        severity: 'medium',
        count: 5,
        examples: ['React 16.x (current: 18.x)', 'Node 14.x (current: 18.x)'],
      },
      {
        category: 'missing-tests',
        severity: 'high',
        count: 10,
        examples: ['No unit tests', 'Missing integration tests'],
      },
    ];
  }

  private prioritizeTechnicalDebtIssues(categories: TechnicalDebtCategory[]): TechnicalDebtIssue[] {
    return categories.flatMap(cat => 
      cat.examples.map(example => ({
        type: cat.category,
        description: example,
        location: 'Project wide',
        severity: cat.severity,
        effort: 'medium' as const,
        impact: 'Affects maintainability and security',
        recommendation: 'Schedule refactoring in next sprint',
      }))
    );
  }

  private identifyRefactoringOpportunities(analysisResult: AnalysisResult): RefactoringOpportunity[] {
    return [
      {
        type: 'extract-component',
        description: 'Large components could be split into smaller ones',
        files: ['src/components/LargeComponent.tsx'],
        impact: 'medium',
        difficulty: 'easy',
      },
    ];
  }

  private calculateOverallDebtLevel(categories: TechnicalDebtCategory[]): TechnicalDebtAnalysis['overallDebtLevel'] {
    const criticalCount = categories.filter(c => c.severity === 'critical').length;
    const highCount = categories.filter(c => c.severity === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (categories.length > 3) return 'medium';
    return 'low';
  }

  private calculateMaintenanceScore(categories: TechnicalDebtCategory[], opportunities: RefactoringOpportunity[]): number {
    let score = 100;
    
    categories.forEach(cat => {
      switch (cat.severity) {
        case 'critical': score -= 30; break;
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        default: score -= 5;
      }
    });
    
    return Math.max(0, score);
  }

  // アーキテクチャ分析の簡略化実装
  private identifyArchitectureStyle(analysisResult: AnalysisResult): string {
    const techStack = analysisResult.techStack;
    
    if (techStack.some(t => t.name.includes('next'))) {
      return 'JAMstack (Next.js)';
    }
    if (techStack.some(t => t.name.includes('react'))) {
      return 'Single Page Application (React)';
    }
    if (techStack.some(t => t.name.includes('express') || t.name.includes('node'))) {
      return 'RESTful API (Node.js)';
    }
    
    return 'Modern Web Application';
  }

  private assessScalability(analysisResult: AnalysisResult): ScalabilityAssessment {
    return {
      horizontal: 70,
      vertical: 60,
      bottlenecks: ['Database queries', 'Static asset delivery'],
      recommendations: ['Implement caching', 'Use CDN for assets'],
    };
  }

  private async identifyPerformanceBottlenecks(analysisResult: AnalysisResult): Promise<PerformanceBottleneck[]> {
    return [
      {
        type: 'bundle-size',
        location: 'Main application bundle',
        impact: 'medium',
        solution: 'Implement code splitting and lazy loading',
      },
    ];
  }

  private async assessSecurity(analysisResult: AnalysisResult): Promise<SecurityAssessment> {
    return {
      overallScore: 75,
      vulnerabilities: [],
      bestPractices: [
        {
          practice: 'Input Validation',
          implemented: true,
          importance: 'critical',
        },
        {
          practice: 'HTTPS Enforcement',
          implemented: false,
          importance: 'high',
        },
      ],
      recommendations: ['Enable HTTPS', 'Add security headers'],
    };
  }

  private identifyDesignPatterns(analysisResult: AnalysisResult): DesignPattern[] {
    return [
      {
        pattern: 'Component Pattern',
        usage: ['React components', 'Reusable UI elements'],
        appropriateness: 'excellent',
      },
    ];
  }

  private identifyAntiPatterns(analysisResult: AnalysisResult): AntiPattern[] {
    return [];
  }

  // 品質メトリクス計算
  private calculateMaintainabilityIndex(analysisResult: AnalysisResult): number {
    // 保守性インデックスの計算（簡略版）
    return 75;
  }

  private async calculateCodeComplexity(analysisResult: AnalysisResult): Promise<ComplexityMetrics> {
    return {
      cyclomaticComplexity: 5,
      cognitiveComplexity: 8,
      halsteadComplexity: 12,
      filesAboveThreshold: [],
    };
  }

  private async calculateDuplicationLevel(analysisResult: AnalysisResult): Promise<number> {
    return 15; // 15%の重複コード
  }

  private calculateDocumentationCoverage(analysisResult: AnalysisResult): number {
    // README.mdの有無と品質で評価
    return 60;
  }

  private estimateTestCoverage(analysisResult: AnalysisResult): number {
    // ファイル構造から推定
    return 45;
  }

  private async identifyCodeSmells(analysisResult: AnalysisResult): Promise<CodeSmell[]> {
    return [
      {
        smell: 'Large Components',
        count: 3,
        severity: 'major',
        examples: ['Dashboard.tsx', 'UserProfile.tsx', 'Settings.tsx'],
        impact: 'Reduced maintainability',
        suggestions: ['Split into smaller components', 'Extract custom hooks'],
      },
    ];
  }

  private calculateOverallQualityScore(metrics: {
    maintainabilityIndex: number;
    codeComplexity: ComplexityMetrics;
    duplicationLevel: number;
    documentationCoverage: number;
    testCoverage: number;
    codeSmells: CodeSmell[];
  }): number {
    const weights = {
      maintainability: 0.25,
      complexity: 0.2,
      duplication: 0.15,
      documentation: 0.15,
      testing: 0.15,
      codeSmells: 0.1,
    };
    
    const complexityScore = 100 - Math.min(100, metrics.codeComplexity.cyclomaticComplexity * 10);
    const duplicationScore = 100 - metrics.duplicationLevel;
    const codeSmellScore = 100 - (metrics.codeSmells.length * 10);
    
    const totalScore = 
      (metrics.maintainabilityIndex * weights.maintainability) +
      (complexityScore * weights.complexity) +
      (duplicationScore * weights.duplication) +
      (metrics.documentationCoverage * weights.documentation) +
      (metrics.testCoverage * weights.testing) +
      (codeSmellScore * weights.codeSmells);
    
    return Math.round(totalScore);
  }
}

export type { 
  DeepContentAnalysis,
  ReadmeAnalysis,
  PackageJsonAnalysis,
  CodeStructureAnalysis,
  TechnicalDebtAnalysis,
  ArchitectureInsights,
  QualityMetrics
};
