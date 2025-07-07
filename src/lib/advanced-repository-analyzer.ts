import { githubContentFetcher } from './github-content-fetcher';
import { enhancedReadmeAnalyzer } from './enhanced-readme-analyzer';
import { AnalysisResult, RepositorySummary } from '@/types';

export interface AdvancedAnalysisResult {
  // AI最適化されたコンテキスト説明
  aiOrientedExplanation: string;
  
  // 包括的リポジトリ分析
  comprehensiveAnalysis: {
    repositoryContext: RepositoryContext;
    technicalComplexity: TechnicalComplexityAnalysis;
    codeQuality: AdvancedCodeQuality;
    projectStructure: ProjectStructureAnalysis;
    readmeIntelligence: ReadmeIntelligenceResult;
  };
  
  // 統合された高品質要約
  intelligentSummary: IntelligentSummary;
}

interface RepositoryContext {
  primaryPurpose: string;
  targetAudience: string[];
  problemDomain: string;
  solutionApproach: string;
  uniqueValueProposition: string;
}

interface TechnicalComplexityAnalysis {
  algorithmicComplexity: number; // 1-10
  codeComplexity: number; // 1-10
  architecturalComplexity: number; // 1-10
  domainComplexity: number; // 1-10
  overallScore: number; // 1-10
  complexityFactors: string[];
  simplificationOpportunities: string[];
}

interface AdvancedCodeQuality {
  maintainabilityIndex: number; // 0-100
  technicalDebt: 'low' | 'medium' | 'high' | 'very-high';
  codeOrganization: 'excellent' | 'good' | 'fair' | 'poor';
  testingMaturity: 'comprehensive' | 'adequate' | 'basic' | 'minimal' | 'none';
  documentationQuality: 'excellent' | 'good' | 'fair' | 'poor';
  communityHealth: 'thriving' | 'active' | 'moderate' | 'quiet' | 'inactive';
}

interface ProjectStructureAnalysis {
  architecturalPatterns: string[];
  designPrinciples: string[];
  layeringSeparation: string[];
  modularization: 'excellent' | 'good' | 'fair' | 'monolithic';
  dependencyManagement: 'excellent' | 'good' | 'fair' | 'chaotic';
}

interface ReadmeIntelligenceResult {
  contextualRelevance: number; // 0-100
  informationCompleteness: number; // 0-100
  usabilityScore: number; // 0-100
  extractedInsights: {
    realWorldApplications: string[];
    practicalBenefits: string[];
    competitiveAdvantages: string[];
    implementationGuidance: string[];
  };
}

interface IntelligentSummary {
  executiveSummary: string; // 2-3文での本質的説明
  businessValue: string; // ビジネス価値の説明
  technicalHighlights: string[]; // 技術的ハイライト
  practicalApplications: string[]; // 実用的応用例
  developmentMaturity: string; // 開発成熟度の説明
  recommendedUsage: string[]; // 推奨使用場面
  learningValue: string; // 学習価値の評価
}

export class AdvancedRepositoryAnalyzer {
  
  /**
   * 包括的リポジトリ分析とインテリジェント要約生成
   */
  async generateAdvancedAnalysis(analysisResult: AnalysisResult): Promise<AdvancedAnalysisResult> {
    console.log('🔍 Advanced repository analysis started');
    
    // 1. README intelligence extraction
    const readmeIntelligence = await this.extractReadmeIntelligence(analysisResult);
    
    // 2. Repository context analysis
    const repositoryContext = this.analyzeRepositoryContext(analysisResult, readmeIntelligence);
    
    // 3. Multi-dimensional complexity analysis
    const technicalComplexity = this.analyzeTechnicalComplexity(analysisResult);
    
    // 4. Advanced code quality assessment
    const codeQuality = this.assessAdvancedCodeQuality(analysisResult);
    
    // 5. Project structure analysis
    const projectStructure = this.analyzeProjectStructure(analysisResult);
    
    // 6. AI-oriented explanation generation
    const aiOrientedExplanation = this.generateAIOrientedExplanation(
      repositoryContext, technicalComplexity, readmeIntelligence
    );
    
    // 7. Intelligent summary synthesis
    const intelligentSummary = this.synthesizeIntelligentSummary(
      repositoryContext, technicalComplexity, codeQuality, readmeIntelligence
    );

    console.log('✅ Advanced repository analysis completed');

    return {
      aiOrientedExplanation,
      comprehensiveAnalysis: {
        repositoryContext,
        technicalComplexity,
        codeQuality,
        projectStructure,
        readmeIntelligence
      },
      intelligentSummary
    };
  }

  /**
   * README intelligence extraction using advanced analysis
   */
  private async extractReadmeIntelligence(analysisResult: AnalysisResult): Promise<ReadmeIntelligenceResult> {
    try {
      // GitHub APIからREADME取得
      const repoUrl = analysisResult.repository.html_url;
      const urlParts = repoUrl.replace('https://github.com/', '').split('/');
      
      if (urlParts.length >= 2) {
        const [owner, repo] = urlParts;
        const content = await githubContentFetcher.fetchRepositoryContent(owner, repo);
        
        if (content.readme) {
          const readmeAnalysis = enhancedReadmeAnalyzer.analyzeReadme(content.readme.content);
          
          return {
            contextualRelevance: this.calculateContextualRelevance(readmeAnalysis),
            informationCompleteness: this.calculateInformationCompleteness(readmeAnalysis),
            usabilityScore: this.calculateUsabilityScore(readmeAnalysis),
            extractedInsights: {
              realWorldApplications: this.extractRealWorldApplications(readmeAnalysis),
              practicalBenefits: this.extractPracticalBenefits(readmeAnalysis),
              competitiveAdvantages: this.extractCompetitiveAdvantages(readmeAnalysis),
              implementationGuidance: this.extractImplementationGuidance(readmeAnalysis)
            }
          };
        }
      }
    } catch (error) {
      console.warn('Failed to extract README intelligence:', error);
    }

    // フォールバック: 基本的な分析
    return {
      contextualRelevance: 30,
      informationCompleteness: 25,
      usabilityScore: 20,
      extractedInsights: {
        realWorldApplications: ['ソフトウェア開発プロジェクト'],
        practicalBenefits: ['開発効率の向上'],
        competitiveAdvantages: ['技術的専門性'],
        implementationGuidance: ['技術文書を参照']
      }
    };
  }

  /**
   * Repository context analysis - プロジェクトの本質的コンテキストを理解
   */
  private analyzeRepositoryContext(analysisResult: AnalysisResult, readmeIntelligence: ReadmeIntelligenceResult): RepositoryContext {
    const { repository, techStack, structure } = analysisResult;
    const insights = readmeIntelligence.extractedInsights;
    
    // Primary purpose inference
    const primaryPurpose = this.inferPrimaryPurpose(repository, techStack, insights);
    
    // Target audience analysis
    const targetAudience = this.identifyTargetAudience(techStack, structure, insights);
    
    // Problem domain identification
    const problemDomain = this.identifyProblemDomain(repository, techStack, insights);
    
    // Solution approach analysis
    const solutionApproach = this.analyzeSolutionApproach(techStack, structure, insights);
    
    // Unique value proposition
    const uniqueValueProposition = this.extractUniqueValueProposition(insights, repository);

    return {
      primaryPurpose,
      targetAudience,
      problemDomain,
      solutionApproach,
      uniqueValueProposition
    };
  }

  /**
   * Multi-dimensional technical complexity analysis
   */
  private analyzeTechnicalComplexity(analysisResult: AnalysisResult): TechnicalComplexityAnalysis {
    const { techStack, dependencies, structure } = analysisResult;
    
    // Algorithmic complexity
    const algorithmicComplexity = this.assessAlgorithmicComplexity(techStack, structure);
    
    // Code complexity
    const codeComplexity = this.assessCodeComplexity(dependencies || [], structure);
    
    // Architectural complexity
    const architecturalComplexity = this.assessArchitecturalComplexity(techStack, structure);
    
    // Domain complexity
    const domainComplexity = this.assessDomainComplexity(analysisResult.repository, techStack);
    
    const overallScore = Math.round((algorithmicComplexity + codeComplexity + architecturalComplexity + domainComplexity) / 4);
    
    return {
      algorithmicComplexity,
      codeComplexity,
      architecturalComplexity,
      domainComplexity,
      overallScore,
      complexityFactors: this.identifyComplexityFactors(techStack, structure),
      simplificationOpportunities: this.identifySimplificationOpportunities(structure, techStack)
    };
  }

  /**
   * Advanced code quality assessment
   */
  private assessAdvancedCodeQuality(analysisResult: AnalysisResult): AdvancedCodeQuality {
    const { structure, techStack, dependencies, repository } = analysisResult;
    
    // Maintainability index calculation
    let maintainabilityIndex = 50; // Base score
    if (structure.hasTests) maintainabilityIndex += 20;
    if (structure.hasTypeScript) maintainabilityIndex += 15;
    if (structure.hasLinting) maintainabilityIndex += 10;
    if (structure.hasDocumentation) maintainabilityIndex += 5;
    
    // Technical debt assessment
    const technicalDebt = this.assessTechnicalDebt(structure, dependencies || []);
    
    // Code organization assessment
    const codeOrganization = this.assessCodeOrganization(structure, techStack);
    
    // Testing maturity
    const testingMaturity = this.assessTestingMaturity(structure, techStack);
    
    // Documentation quality
    const documentationQuality = this.assessDocumentationQuality(structure);
    
    // Community health
    const communityHealth = this.assessCommunityHealth(repository);

    return {
      maintainabilityIndex: Math.min(100, maintainabilityIndex),
      technicalDebt,
      codeOrganization,
      testingMaturity,
      documentationQuality,
      communityHealth
    };
  }

  /**
   * Project structure analysis
   */
  private analyzeProjectStructure(analysisResult: AnalysisResult): ProjectStructureAnalysis {
    const { techStack, structure } = analysisResult;
    
    return {
      architecturalPatterns: this.identifyArchitecturalPatterns(techStack, structure),
      designPrinciples: this.identifyDesignPrinciples(structure, techStack),
      layeringSeparation: this.analyzeLayering(structure),
      modularization: this.assessModularization(structure, techStack),
      dependencyManagement: this.assessDependencyManagement(structure)
    };
  }

  /**
   * AI-oriented explanation generation
   */
  private generateAIOrientedExplanation(
    context: RepositoryContext,
    complexity: TechnicalComplexityAnalysis,
    readme: ReadmeIntelligenceResult
  ): string {
    return `## AI Context Analysis

**Repository Purpose**: ${context.primaryPurpose}

**Problem Domain**: ${context.problemDomain}

**Solution Approach**: ${context.solutionApproach}

**Technical Complexity**: Level ${complexity.overallScore}/10
- Algorithmic: ${complexity.algorithmicComplexity}/10
- Code: ${complexity.codeComplexity}/10  
- Architectural: ${complexity.architecturalComplexity}/10
- Domain: ${complexity.domainComplexity}/10

**Target Users**: ${context.targetAudience.join(', ')}

**Key Value**: ${context.uniqueValueProposition}

**README Quality**: ${readme.usabilityScore}% usability, ${readme.informationCompleteness}% completeness

This repository represents a ${complexity.overallScore >= 7 ? 'highly sophisticated' : complexity.overallScore >= 5 ? 'moderately complex' : 'straightforward'} ${context.problemDomain} solution designed for ${context.targetAudience[0] || 'developers'}.`;
  }

  /**
   * Intelligent summary synthesis
   */
  private synthesizeIntelligentSummary(
    context: RepositoryContext,
    complexity: TechnicalComplexityAnalysis,
    quality: AdvancedCodeQuality,
    readme: ReadmeIntelligenceResult
  ): IntelligentSummary {
    
    const executiveSummary = this.generateExecutiveSummary(context, complexity);
    const businessValue = this.generateBusinessValue(context, readme.extractedInsights);
    const technicalHighlights = this.generateTechnicalHighlights(complexity, quality);
    const practicalApplications = readme.extractedInsights.realWorldApplications.slice(0, 4);
    const developmentMaturity = this.assessDevelopmentMaturity(quality, complexity);
    const recommendedUsage = this.generateRecommendedUsage(context, complexity);
    const learningValue = this.assessLearningValue(complexity, quality);

    return {
      executiveSummary,
      businessValue,
      technicalHighlights,
      practicalApplications,
      developmentMaturity,
      recommendedUsage,
      learningValue
    };
  }

  // === Helper Methods === //

  private inferPrimaryPurpose(repository: any, techStack: any[], insights: any): string {
    const { name, description } = repository;
    
    // Real-world applications から推論
    if (insights.realWorldApplications.length > 0) {
      return `${insights.realWorldApplications[0]}を通じて、${description || '特定の技術的課題'}を解決する`;
    }
    
    // テックスタックから推論
    const frameworks = techStack.map(t => t.name.toLowerCase());
    if (frameworks.includes('react') || frameworks.includes('vue') || frameworks.includes('angular')) {
      return 'ユーザーインターフェースの構築と最適化を通じたユーザーエクスペリエンスの向上';
    }
    if (frameworks.includes('express') || frameworks.includes('fastapi') || frameworks.includes('spring')) {
      return 'システム間連携とデータ処理の効率化を実現するバックエンドサービスの提供';
    }
    
    return description || `${name}プロジェクトを通じた技術的価値の創出`;
  }

  private identifyTargetAudience(techStack: any[], structure: any, insights: any): string[] {
    const audiences = new Set<string>();
    
    // 技術スタックから推論
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    if (frameworks.some(f => ['react', 'vue', 'angular'].includes(f))) {
      audiences.add('フロントエンド開発者');
    }
    if (frameworks.some(f => ['node', 'express', 'fastapi'].includes(f))) {
      audiences.add('バックエンド開発者');
    }
    if (frameworks.some(f => ['python', 'jupyter', 'tensorflow'].includes(f))) {
      audiences.add('データサイエンティスト');
    }
    if (frameworks.some(f => ['docker', 'kubernetes'].includes(f))) {
      audiences.add('DevOpsエンジニア');
    }
    
    // 基本的なターゲット
    if (audiences.size === 0) {
      audiences.add('ソフトウェア開発者');
    }
    
    return Array.from(audiences);
  }

  private identifyProblemDomain(repository: any, techStack: any[], insights: any): string {
    const { name, description } = repository;
    const nameAndDesc = `${name} ${description}`.toLowerCase();
    
    // ドメイン分析
    if (nameAndDesc.includes('web') || nameAndDesc.includes('frontend')) return 'Web開発・UI/UX';
    if (nameAndDesc.includes('api') || nameAndDesc.includes('backend')) return 'API・バックエンド開発';
    if (nameAndDesc.includes('data') || nameAndDesc.includes('ml') || nameAndDesc.includes('ai')) return 'データサイエンス・機械学習';
    if (nameAndDesc.includes('mobile') || nameAndDesc.includes('ios') || nameAndDesc.includes('android')) return 'モバイル開発';
    if (nameAndDesc.includes('game')) return 'ゲーム開発';
    if (nameAndDesc.includes('blockchain') || nameAndDesc.includes('crypto')) return 'ブロックチェーン・暗号技術';
    if (nameAndDesc.includes('security')) return 'セキュリティ・認証';
    if (nameAndDesc.includes('devops') || nameAndDesc.includes('ci') || nameAndDesc.includes('deploy')) return 'DevOps・インフラ';
    
    return 'ソフトウェア開発・エンジニアリング';
  }

  private analyzeSolutionApproach(techStack: any[], structure: any, insights: any): string {
    const approaches: string[] = [];
    
    // アーキテクチャアプローチ
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    if (frameworks.includes('microservice') || frameworks.includes('docker')) {
      approaches.push('マイクロサービスアーキテクチャ');
    }
    if (frameworks.includes('react') || frameworks.includes('vue')) {
      approaches.push('コンポーネントベース設計');
    }
    if (structure.hasTests) {
      approaches.push('テスト駆動開発');
    }
    if (structure.hasTypeScript) {
      approaches.push('型安全性重視');
    }
    
    return approaches.length > 0 ? approaches.join('、') + 'による実装' : '段階的開発アプローチ';
  }

  private extractUniqueValueProposition(insights: any, repository: any): string {
    if (insights.competitiveAdvantages.length > 0) {
      return insights.competitiveAdvantages[0];
    }
    if (insights.practicalBenefits.length > 0) {
      return insights.practicalBenefits[0];
    }
    
    // スター数から価値を推論
    if (repository.stargazers_count > 1000) {
      return 'コミュニティに実証された高い技術的価値と実用性';
    }
    if (repository.stargazers_count > 100) {
      return '実用性が認められた技術的ソリューション';
    }
    
    return '特定の技術的課題に対する専門的ソリューション';
  }

  // Complexity assessment methods
  private assessAlgorithmicComplexity(techStack: any[], structure: any): number {
    let score = 3; // Base score
    
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    // 高複雑度技術
    if (frameworks.some(f => ['tensorflow', 'pytorch', 'opencv'].includes(f))) score += 3;
    if (frameworks.some(f => ['blockchain', 'cryptography'].includes(f))) score += 3;
    if (frameworks.some(f => ['compiler', 'parser'].includes(f))) score += 2;
    
    // 中複雑度技術
    if (frameworks.some(f => ['kubernetes', 'docker'].includes(f))) score += 2;
    if (frameworks.some(f => ['graphql', 'websocket'].includes(f))) score += 1;
    
    return Math.min(10, score);
  }

  private assessCodeComplexity(dependencies: any[], structure: any): number {
    let score = 2; // Base score
    
    // 依存関係数による複雑度
    if (dependencies.length > 100) score += 3;
    else if (dependencies.length > 50) score += 2;
    else if (dependencies.length > 20) score += 1;
    
    // 構造による複雑度
    if (structure.hasTests) score += 1;
    if (structure.hasTypeScript) score += 1;
    if (structure.hasLinting) score += 1;
    
    return Math.min(10, score);
  }

  private assessArchitecturalComplexity(techStack: any[], structure: any): number {
    let score = 2; // Base score
    
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    // アーキテクチャ複雑度
    if (frameworks.includes('microservice')) score += 3;
    if (frameworks.includes('kubernetes')) score += 2;
    if (frameworks.includes('redis')) score += 1;
    if (frameworks.includes('nginx')) score += 1;
    
    return Math.min(10, score);
  }

  private assessDomainComplexity(repository: any, techStack: any[]): number {
    const { name, description } = repository;
    const domain = `${name} ${description}`.toLowerCase();
    
    // 高複雑度ドメイン
    if (domain.includes('ai') || domain.includes('ml') || domain.includes('deep')) return 8;
    if (domain.includes('blockchain') || domain.includes('crypto')) return 8;
    if (domain.includes('compiler') || domain.includes('os')) return 9;
    
    // 中複雑度ドメイン
    if (domain.includes('distributed') || domain.includes('cloud')) return 6;
    if (domain.includes('database') || domain.includes('search')) return 5;
    
    // 低複雑度ドメイン
    if (domain.includes('web') || domain.includes('app')) return 3;
    if (domain.includes('utility') || domain.includes('tool')) return 2;
    
    return 4; // Default
  }

  private identifyComplexityFactors(techStack: any[], structure: any): string[] {
    const factors: string[] = [];
    
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    if (frameworks.includes('kubernetes')) factors.push('コンテナオーケストレーション');
    if (frameworks.includes('microservice')) factors.push('分散システム設計');
    if (frameworks.includes('graphql')) factors.push('複雑なデータクエリ');
    if (structure.hasTests) factors.push('包括的テスト戦略');
    if (structure.hasTypeScript) factors.push('型システム設計');
    
    return factors;
  }

  private identifySimplificationOpportunities(structure: any, techStack: any[]): string[] {
    const opportunities: string[] = [];
    
    if (!structure.hasTests) opportunities.push('自動テスト導入');
    if (!structure.hasLinting) opportunities.push('コード品質ツール導入');
    if (!structure.hasDocumentation) opportunities.push('API文書化');
    
    return opportunities;
  }

  // Quality assessment methods
  private assessTechnicalDebt(structure: any, dependencies: any[]): 'low' | 'medium' | 'high' | 'very-high' {
    let debtScore = 0;
    
    if (!structure.hasTests) debtScore += 2;
    if (!structure.hasLinting) debtScore += 1;
    if (!structure.hasTypeScript) debtScore += 1;
    if (dependencies.length > 100) debtScore += 1;
    
    if (debtScore >= 4) return 'very-high';
    if (debtScore >= 3) return 'high';
    if (debtScore >= 2) return 'medium';
    return 'low';
  }

  private assessCodeOrganization(structure: any, techStack: any[]): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 0;
    
    if (structure.hasTypeScript) score += 2;
    if (structure.hasLinting) score += 1;
    if (techStack.length > 5) score += 1;
    
    if (score >= 4) return 'excellent';
    if (score >= 3) return 'good';
    if (score >= 2) return 'fair';
    return 'poor';
  }

  private assessTestingMaturity(structure: any, techStack: any[]): 'comprehensive' | 'adequate' | 'basic' | 'minimal' | 'none' {
    if (!structure.hasTests) return 'none';
    
    const frameworks = techStack.map(t => t.name.toLowerCase());
    if (frameworks.includes('jest') && frameworks.includes('cypress')) return 'comprehensive';
    if (frameworks.includes('jest') || frameworks.includes('mocha')) return 'adequate';
    
    return 'basic';
  }

  private assessDocumentationQuality(structure: any): 'excellent' | 'good' | 'fair' | 'poor' {
    if (structure.hasDocumentation) return 'good';
    return 'fair';
  }

  private assessCommunityHealth(repository: any): 'thriving' | 'active' | 'moderate' | 'quiet' | 'inactive' {
    const stars = repository.stargazers_count || 0;
    const forks = repository.forks_count || 0;
    
    if (stars > 5000 && forks > 1000) return 'thriving';
    if (stars > 1000 && forks > 200) return 'active';
    if (stars > 100 && forks > 20) return 'moderate';
    if (stars > 10) return 'quiet';
    return 'inactive';
  }

  // Advanced helper methods
  private identifyArchitecturalPatterns(techStack: any[], structure: any): string[] {
    const patterns: string[] = [];
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    if (frameworks.includes('react') || frameworks.includes('vue')) {
      patterns.push('コンポーネントベースアーキテクチャ');
    }
    if (frameworks.includes('redux') || frameworks.includes('vuex')) {
      patterns.push('中央集権的状態管理');
    }
    if (frameworks.includes('microservice')) {
      patterns.push('マイクロサービスアーキテクチャ');
    }
    if (frameworks.includes('graphql')) {
      patterns.push('クエリベースAPI');
    }
    
    return patterns;
  }

  private identifyDesignPrinciples(structure: any, techStack: any[]): string[] {
    const principles: string[] = [];
    
    if (structure.hasTypeScript) principles.push('型安全性');
    if (structure.hasTests) principles.push('テスタビリティ');
    if (structure.hasLinting) principles.push('コード品質管理');
    
    return principles;
  }

  private analyzeLayering(structure: any): string[] {
    const layers: string[] = [];
    
    if (structure.hasTests) layers.push('テストレイヤー');
    layers.push('アプリケーションレイヤー');
    if (structure.packageManager) layers.push('依存関係レイヤー');
    
    return layers;
  }

  private assessModularization(structure: any, techStack: any[]): 'excellent' | 'good' | 'fair' | 'monolithic' {
    if (techStack.length > 10) return 'excellent';
    if (techStack.length > 5) return 'good';
    if (techStack.length > 2) return 'fair';
    return 'monolithic';
  }

  private assessDependencyManagement(structure: any): 'excellent' | 'good' | 'fair' | 'chaotic' {
    if (structure.packageManager) return 'good';
    return 'fair';
  }

  // README intelligence calculation methods
  private calculateContextualRelevance(readmeAnalysis: any): number {
    let score = 20; // Base score
    
    if (readmeAnalysis.features.length > 0) score += 20;
    if (readmeAnalysis.usage.basicUsage) score += 20;
    if (readmeAnalysis.examples.length > 0) score += 20;
    if (readmeAnalysis.installation.npm || readmeAnalysis.installation.pip) score += 20;
    
    return Math.min(100, score);
  }

  private calculateInformationCompleteness(readmeAnalysis: any): number {
    let score = 10; // Base score
    
    if (readmeAnalysis.title) score += 15;
    if (readmeAnalysis.description) score += 15;
    if (readmeAnalysis.features.length > 0) score += 15;
    if (readmeAnalysis.installation.npm || readmeAnalysis.installation.pip) score += 15;
    if (readmeAnalysis.usage.basicUsage) score += 15;
    if (readmeAnalysis.examples.length > 0) score += 15;
    
    return Math.min(100, score);
  }

  private calculateUsabilityScore(readmeAnalysis: any): number {
    let score = 10; // Base score
    
    if (readmeAnalysis.examples.length > 0) score += 30;
    if (readmeAnalysis.installation.npm || readmeAnalysis.installation.pip) score += 25;
    if (readmeAnalysis.usage.basicUsage) score += 25;
    if (readmeAnalysis.features.length > 0) score += 10;
    
    return Math.min(100, score);
  }

  private extractRealWorldApplications(readmeAnalysis: any): string[] {
    const applications = [...readmeAnalysis.useCases];
    
    // デフォルトアプリケーション
    if (applications.length === 0) {
      applications.push('ソフトウェア開発プロジェクト', '技術プロトタイピング');
    }
    
    return applications.slice(0, 5);
  }

  private extractPracticalBenefits(readmeAnalysis: any): string[] {
    const benefits = [...readmeAnalysis.keyBenefits];
    
    if (benefits.length === 0) {
      benefits.push('開発効率の向上', '技術的専門性の獲得');
    }
    
    return benefits.slice(0, 5);
  }

  private extractCompetitiveAdvantages(readmeAnalysis: any): string[] {
    // 技術的な特徴から競合優位性を推論
    const advantages: string[] = [];
    
    if (readmeAnalysis.technicalDetails.length > 0) {
      advantages.push('高度な技術実装');
    }
    if (readmeAnalysis.features.length > 5) {
      advantages.push('豊富な機能セット');
    }
    
    return advantages.slice(0, 3);
  }

  private extractImplementationGuidance(readmeAnalysis: any): string[] {
    const guidance: string[] = [];
    
    if (readmeAnalysis.installation.npm) guidance.push('npm install による簡単セットアップ');
    if (readmeAnalysis.usage.basicUsage) guidance.push('基本的な使用方法の提供');
    if (readmeAnalysis.examples.length > 0) guidance.push('実装例とサンプルコード');
    
    if (guidance.length === 0) {
      guidance.push('技術文書による実装ガイド');
    }
    
    return guidance;
  }

  // Summary generation methods
  private generateExecutiveSummary(context: RepositoryContext, complexity: TechnicalComplexityAnalysis): string {
    const complexityDesc = complexity.overallScore >= 7 ? '高度で洗練された' : 
                          complexity.overallScore >= 5 ? '中程度の複雑性を持つ' : 'シンプルで理解しやすい';
    
    return `${context.problemDomain}における${complexityDesc}ソリューションで、${context.solutionApproach}を通じて実装されている。${context.uniqueValueProposition}を提供し、${context.targetAudience.join('、')}向けに設計されている。`;
  }

  private generateBusinessValue(context: RepositoryContext, insights: any): string {
    const benefits = insights.practicalBenefits;
    if (benefits.length > 0) {
      return `${benefits[0]}を実現し、${context.problemDomain}における生産性向上と品質改善に貢献する。`;
    }
    
    return `${context.problemDomain}における課題解決を通じて、開発効率と技術的価値を向上させる。`;
  }

  private generateTechnicalHighlights(complexity: TechnicalComplexityAnalysis, quality: AdvancedCodeQuality): string[] {
    const highlights: string[] = [];
    
    if (complexity.overallScore >= 7) {
      highlights.push('高度な技術的実装');
    }
    if (quality.maintainabilityIndex >= 80) {
      highlights.push('優秀な保守性');
    }
    if (quality.testingMaturity !== 'none') {
      highlights.push('テスト駆動開発');
    }
    if (complexity.complexityFactors.length > 0) {
      highlights.push(...complexity.complexityFactors.slice(0, 2));
    }
    
    return highlights.slice(0, 4);
  }

  private assessDevelopmentMaturity(quality: AdvancedCodeQuality, complexity: TechnicalComplexityAnalysis): string {
    if (quality.maintainabilityIndex >= 80 && complexity.overallScore >= 6) {
      return '成熟した開発プロセスと高い技術的完成度を備えたプロダクション品質のプロジェクト';
    }
    if (quality.maintainabilityIndex >= 60) {
      return '安定した開発基盤を持つ実用段階のプロジェクト';
    }
    
    return '開発段階にある実験的・学習目的のプロジェクト';
  }

  private generateRecommendedUsage(context: RepositoryContext, complexity: TechnicalComplexityAnalysis): string[] {
    const usage: string[] = [];
    
    if (complexity.overallScore >= 7) {
      usage.push('高度な技術習得を目指す上級開発者');
      usage.push('複雑な要件を持つプロダクション環境');
    } else if (complexity.overallScore >= 5) {
      usage.push('中級〜上級開発者の実装参考');
      usage.push('類似システムの設計参考');
    } else {
      usage.push('初心者〜中級者の学習材料');
      usage.push('プロトタイピングや実験的実装');
    }
    
    usage.push(`${context.problemDomain}の課題解決が必要な場面`);
    
    return usage;
  }

  private assessLearningValue(complexity: TechnicalComplexityAnalysis, quality: AdvancedCodeQuality): string {
    if (complexity.overallScore >= 7 && quality.maintainabilityIndex >= 70) {
      return '高い学習価値：アーキテクチャパターン、設計原則、実装技法の優秀な実例として活用できる';
    }
    if (complexity.overallScore >= 5) {
      return '中程度の学習価値：特定技術や実装手法の理解に役立つ実用的な参考例';
    }
    
    return '基本的な学習価値：入門〜中級レベルの技術習得に適した実装例';
  }
}

// シングルトンインスタンス
export const advancedRepositoryAnalyzer = new AdvancedRepositoryAnalyzer();