import { OpenAI } from 'openai';
import { githubContentFetcher } from './github-content-fetcher';
import { advancedRepositoryAnalyzer } from './advanced-repository-analyzer';
import { practicalRepositorySummarizer } from './practical-repository-summarizer';
import { 
  RepositorySummary, 
  AnalysisResult, 
  ProjectCategory, 
  TechnicalComplexity,
  MaturityLevel,
  DevelopmentStatus,
  CodeQuality,
  ScalabilityAssessment,
  Recommendation
} from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class RepositorySummaryEngine {
  
  /**
   * リポジトリの包括的要約を生成（実用的分析エンジン使用）
   */
  async generateRepositorySummary(analysisResult: AnalysisResult): Promise<RepositorySummary> {
    console.log('🚀 Starting practical repository summary generation...');
    
    try {
      // 実用的分析エンジンを優先使用
      const practicalAnalysis = await practicalRepositorySummarizer.generatePracticalSummary(analysisResult);
      
      // PracticalRepositorySummaryをRepositorySummary形式に変換
      const repositorySummary = this.convertPracticalAnalysisToSummary(practicalAnalysis, analysisResult);
      
      console.log('✅ Practical repository summary generated successfully');
      return repositorySummary;
      
    } catch (error) {
      console.warn('Practical analysis failed, falling back to advanced analysis:', error);
      
      try {
        // フォールバック1: 高度な分析エンジン
        const advancedAnalysis = await advancedRepositoryAnalyzer.generateAdvancedAnalysis(analysisResult);
        const repositorySummary = this.convertAdvancedAnalysisToSummary(advancedAnalysis, analysisResult);
        console.log('✅ Advanced repository summary generated successfully (fallback)');
        return repositorySummary;
        
      } catch (fallbackError) {
        console.warn('Advanced analysis also failed, falling back to basic analysis:', fallbackError);
        
        // フォールバック2: 従来の方式
        const readmeContent = await this.extractReadmeContent(analysisResult);
        return this.generateEnhancedRuleBasedSummary(analysisResult, readmeContent);
      }
    }
  }

  /**
   * AdvancedAnalysisResultをRepositorySummary形式に変換
   */
  private convertAdvancedAnalysisToSummary(advancedAnalysis: any, analysisResult: AnalysisResult): RepositorySummary {
    const { comprehensiveAnalysis, intelligentSummary, aiOrientedExplanation } = advancedAnalysis;
    const { repository } = analysisResult;

    return {
      description: intelligentSummary.executiveSummary || 'リポジトリの詳細分析',
      oneLineSummary: intelligentSummary.businessValue?.substring(0, 100) || '技術的ソリューション',
      purpose: comprehensiveAnalysis.repositoryContext.primaryPurpose || 'ソフトウェア開発',
      category: this.mapToProjectCategory(comprehensiveAnalysis.repositoryContext.problemDomain),
      targetUsers: comprehensiveAnalysis.repositoryContext.targetAudience || ['開発者'],
      keyFeatures: intelligentSummary.technicalHighlights || [],
      useCases: intelligentSummary.practicalApplications || [],
      technicalComplexity: this.mapToTechnicalComplexity(comprehensiveAnalysis.technicalComplexity.overallScore),
      maintainabilityScore: comprehensiveAnalysis.codeQuality.maintainabilityIndex || 50,
      codeQuality: {
        score: comprehensiveAnalysis.codeQuality.maintainabilityIndex || 50,
        testCoverage: this.mapTestingMaturity(comprehensiveAnalysis.codeQuality.testingMaturity),
        documentation: this.mapDocumentationQuality(comprehensiveAnalysis.codeQuality.documentationQuality),
        codeStyle: this.mapCodeOrganization(comprehensiveAnalysis.codeQuality.codeOrganization),
        errorHandling: 'basic',
        modularity: this.mapModularization(comprehensiveAnalysis.projectStructure.modularization)
      },
      maturityLevel: this.inferMaturityLevel(comprehensiveAnalysis.codeQuality),
      developmentStatus: this.inferDevelopmentStatus(repository, comprehensiveAnalysis.codeQuality),
      architecturePattern: comprehensiveAnalysis.projectStructure.architecturalPatterns || [],
      designPrinciples: comprehensiveAnalysis.projectStructure.designPrinciples || [],
      scalabilityAssessment: {
        score: 70,
        horizontalScaling: 'fair',
        verticalScaling: 'fair',
        performanceOptimization: 'basic',
        caching: 'none'
      },
      recommendations: this.generateAdvancedRecommendations(comprehensiveAnalysis),
      potentialIssues: comprehensiveAnalysis.technicalComplexity.simplificationOpportunities || [],
      analysisConfidence: Math.max(85, comprehensiveAnalysis.readmeIntelligence.usabilityScore || 70),
      lastAnalyzed: new Date().toISOString(),
      
      // Note: 高度な情報は別途管理
      // aiContext: aiOrientedExplanation,
      // businessValue: intelligentSummary.businessValue,
      // learningValue: intelligentSummary.learningValue,
      // recommendedUsage: intelligentSummary.recommendedUsage,
      // developmentMaturity: intelligentSummary.developmentMaturity
    };
  }

  /**
   * PracticalRepositorySummaryをRepositorySummary形式に変換
   */
  private convertPracticalAnalysisToSummary(practicalAnalysis: any, analysisResult: AnalysisResult): RepositorySummary {
    const { whatAndHow, technicalApproach, codebaseStructure, understandingGuidance, practicalSummary } = practicalAnalysis;
    const { repository } = analysisResult;

    return {
      description: whatAndHow.purpose || 'リポジトリの実用的分析',
      oneLineSummary: whatAndHow.coreFunction || '技術的ソリューション',
      purpose: whatAndHow.purpose || 'ソフトウェア開発支援',
      category: this.mapToProjectCategory(this.inferDomainFromPurpose(whatAndHow.purpose)),
      targetUsers: ['ソフトウェアエンジニア', '開発者'],
      keyFeatures: whatAndHow.practicalExamples?.map((ex: any) => ex.scenario) || [],
      useCases: whatAndHow.practicalExamples?.map((ex: any) => ex.scenario) || [],
      technicalComplexity: this.assessComplexityFromTechnicalApproach(technicalApproach),
      maintainabilityScore: this.calculateMaintainabilityFromStructure(codebaseStructure),
      codeQuality: {
        score: this.calculateMaintainabilityFromStructure(codebaseStructure),
        testCoverage: this.hasTestsFromStructure(codebaseStructure) ? 'medium' : 'low',
        documentation: this.hasDocsFromStructure(codebaseStructure) ? 'good' : 'basic',
        codeStyle: codebaseStructure.codeOrganization?.pattern ? 'good' : 'basic',
        errorHandling: 'basic',
        modularity: this.assessModularityFromStructure(codebaseStructure) as 'monolithic' | 'basic' | 'good' | 'excellent'
      },
      maturityLevel: this.inferMaturityFromGuidance(understandingGuidance),
      developmentStatus: this.inferDevelopmentStatusFromAnalysis(technicalApproach),
      architecturePattern: technicalApproach.architecturalChoices || [],
      designPrinciples: technicalApproach.designDecisions?.map((d: any) => d.decision) || [],
      scalabilityAssessment: {
        score: 70,
        horizontalScaling: 'fair',
        verticalScaling: 'fair',
        performanceOptimization: 'basic',
        caching: 'none'
      },
      recommendations: this.generatePracticalRecommendations(understandingGuidance),
      potentialIssues: understandingGuidance.commonIssues?.map((issue: any) => issue.issue) || [],
      analysisConfidence: 90, // 実用的分析は高い信頼度
      lastAnalyzed: new Date().toISOString(),
      
      // Note: 実用的分析特有の情報は別途管理
      // practicalContext: {
      //   whatAndHow: whatAndHow,
      //   technicalApproach: technicalApproach,
      //   codebaseStructure: codebaseStructure,
      //   understandingGuidance: understandingGuidance,
      //   engineeringSummary: practicalSummary
      // }
    };
  }

  // === Practical Analysis Helper Methods === //

  private inferDomainFromPurpose(purpose: string): string {
    if (!purpose) return 'ソフトウェア開発・エンジニアリング';
    
    const purposeLower = purpose.toLowerCase();
    if (purposeLower.includes('ui') || purposeLower.includes('ユーザー') || purposeLower.includes('インターフェース')) {
      return 'Web開発・UI/UX';
    }
    if (purposeLower.includes('api') || purposeLower.includes('サーバー') || purposeLower.includes('バックエンド')) {
      return 'API・バックエンド開発';
    }
    if (purposeLower.includes('cli') || purposeLower.includes('コマンド') || purposeLower.includes('ツール')) {
      return '開発ツール・CLI';
    }
    
    return 'ソフトウェア開発・エンジニアリング';
  }

  private assessComplexityFromTechnicalApproach(technicalApproach: any): TechnicalComplexity {
    const techCount = technicalApproach.coreTechnologies?.length || 0;
    const approachComplexity = technicalApproach.problemSolvingApproach?.length || 0;
    
    if (techCount >= 5 && approachComplexity >= 3) return 'expert';
    if (techCount >= 3 && approachComplexity >= 2) return 'advanced';
    if (techCount >= 2 || approachComplexity >= 1) return 'intermediate';
    return 'beginner';
  }

  private calculateMaintainabilityFromStructure(codebaseStructure: any): number {
    let score = 50; // Base score
    
    if (codebaseStructure.codeOrganization?.pattern) score += 20;
    if (codebaseStructure.entryPoints?.length > 0) score += 15;
    if (codebaseStructure.configurationPoints?.length > 0) score += 10;
    if (codebaseStructure.keyComponents?.length > 0) score += 5;
    
    return Math.min(100, score);
  }

  private hasTestsFromStructure(codebaseStructure: any): boolean {
    const testDirs = ['test', 'tests', '__tests__', 'spec'];
    return codebaseStructure.directoryStructure?.some((dir: any) => 
      testDirs.some(testDir => dir.path?.toLowerCase().includes(testDir))
    ) || false;
  }

  private hasDocsFromStructure(codebaseStructure: any): boolean {
    const docDirs = ['docs', 'doc', 'documentation'];
    return codebaseStructure.directoryStructure?.some((dir: any) => 
      docDirs.some(docDir => dir.path?.toLowerCase().includes(docDir))
    ) || false;
  }

  private assessModularityFromStructure(codebaseStructure: any): 'excellent' | 'good' | 'fair' | 'poor' {
    const componentCount = codebaseStructure.keyComponents?.length || 0;
    const structureQuality = codebaseStructure.codeOrganization?.pattern ? 1 : 0;
    
    const score = componentCount + structureQuality;
    if (score >= 5) return 'excellent';
    if (score >= 3) return 'good';
    if (score >= 1) return 'fair';
    return 'poor';
  }

  private inferMaturityFromGuidance(understandingGuidance: any): MaturityLevel {
    const hasAdvancedPath = understandingGuidance.learningPath?.advanced?.length > 0;
    const hasGoodCustomization = understandingGuidance.customizationGuidance?.bestPractices?.length > 0;
    
    if (hasAdvancedPath && hasGoodCustomization) return 'mature';
    if (hasAdvancedPath || hasGoodCustomization) return 'stable';
    return 'alpha';
  }

  private inferDevelopmentStatusFromAnalysis(technicalApproach: any): DevelopmentStatus {
    const designDecisionCount = technicalApproach.designDecisions?.length || 0;
    const coreTeches = technicalApproach.coreTechnologies?.length || 0;
    
    if (designDecisionCount >= 3 && coreTeches >= 3) return 'active';
    if (designDecisionCount >= 1 && coreTeches >= 2) return 'maintained';
    return 'stagnant';
  }

  private generatePracticalRecommendations(understandingGuidance: any): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (understandingGuidance.furtherLearning?.nextSteps) {
      understandingGuidance.furtherLearning.nextSteps.forEach((step: string) => {
        recommendations.push({
          type: 'tooling',
          priority: 'medium',
          title: 'Learning Enhancement',
          description: step,
          effort: 'medium',
          impact: 'medium'
        });
      });
    }
    
    if (understandingGuidance.commonIssues) {
      understandingGuidance.commonIssues.forEach((issue: any) => {
        recommendations.push({
          type: 'maintainability',
          priority: 'high',
          title: 'Issue Prevention',
          description: issue.prevention || issue.solution,
          effort: 'low',
          impact: 'high'
        });
      });
    }
    
    return recommendations;
  }

  // === Advanced Analysis Mapping Helper Methods === //

  private mapToProjectCategory(problemDomain: string): ProjectCategory {
    const domain = problemDomain.toLowerCase();
    
    if (domain.includes('web')) return 'web-application';
    if (domain.includes('mobile')) return 'mobile-application';
    if (domain.includes('api') || domain.includes('backend')) return 'api-service';
    if (domain.includes('devops') || domain.includes('インフラ')) return 'development-tool';
    if (domain.includes('データ') || domain.includes('ml') || domain.includes('ai')) return 'development-tool';
    if (domain.includes('cli')) return 'cli-tool';
    if (domain.includes('ライブラリ')) return 'library';
    
    return 'development-tool';
  }

  private mapToTechnicalComplexity(overallScore: number): TechnicalComplexity {
    if (overallScore >= 8) return 'expert';
    if (overallScore >= 6) return 'advanced';
    if (overallScore >= 4) return 'intermediate';
    return 'beginner';
  }

  private mapTestingMaturity(testingMaturity: string): 'none' | 'low' | 'medium' | 'high' {
    switch (testingMaturity) {
      case 'comprehensive': return 'high';
      case 'adequate': return 'medium';
      case 'basic': return 'low';
      case 'minimal': return 'low';
      default: return 'none';
    }
  }

  private mapDocumentationQuality(docQuality: string): 'none' | 'basic' | 'good' | 'excellent' {
    switch (docQuality) {
      case 'excellent': return 'excellent';
      case 'good': return 'good';
      case 'fair': return 'basic';
      default: return 'basic';
    }
  }

  private mapCodeOrganization(codeOrg: string): 'inconsistent' | 'basic' | 'good' | 'excellent' {
    switch (codeOrg) {
      case 'excellent': return 'excellent';
      case 'good': return 'good';
      case 'fair': return 'basic';
      default: return 'basic';
    }
  }

  private mapModularization(modularization: string): 'monolithic' | 'basic' | 'good' | 'excellent' {
    switch (modularization) {
      case 'excellent': return 'excellent';
      case 'good': return 'good';
      case 'fair': return 'basic';
      default: return 'monolithic';
    }
  }

  private inferMaturityLevel(codeQuality: any): MaturityLevel {
    if (codeQuality.maintainabilityIndex >= 90) return 'mature';
    if (codeQuality.maintainabilityIndex >= 75) return 'stable';
    if (codeQuality.maintainabilityIndex >= 60) return 'beta';
    if (codeQuality.maintainabilityIndex >= 40) return 'alpha';
    return 'prototype';
  }

  private inferDevelopmentStatus(repository: any, codeQuality: any): DevelopmentStatus {
    const lastUpdate = new Date(repository.updated_at);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 30 && codeQuality.maintainabilityIndex >= 60) return 'active';
    if (daysSinceUpdate < 90) return 'maintained';
    if (daysSinceUpdate < 365) return 'stagnant';
    return 'abandoned';
  }

  private generateAdvancedRecommendations(comprehensiveAnalysis: any): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { codeQuality, technicalComplexity } = comprehensiveAnalysis;

    // コード品質改善提案
    if (codeQuality.testingMaturity === 'none' || codeQuality.testingMaturity === 'minimal') {
      recommendations.push({
        type: 'maintainability',
        priority: 'high',
        title: 'テストカバレッジの向上',
        description: '自動テスト導入により、コードの信頼性と保守性を大幅に改善できます',
        effort: 'medium',
        impact: 'high'
      });
    }

    // 技術的複雑度に基づく提案
    if (technicalComplexity.overallScore >= 7) {
      recommendations.push({
        type: 'architecture',
        priority: 'medium',
        title: 'アーキテクチャドキュメント強化',
        description: '高度な実装に対する包括的なドキュメント整備を推奨します',
        effort: 'low',
        impact: 'medium'
      });
    }

    // 簡素化機会があれば提案
    if (technicalComplexity.simplificationOpportunities?.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: '実装の簡素化',
        description: `${technicalComplexity.simplificationOpportunities[0]}により、保守性向上が期待できます`,
        effort: 'low',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * AI分析による要約生成
   */
  private async generateAISummary(analysisResult: AnalysisResult, readmeContent: string): Promise<RepositorySummary> {
    const { repository, techStack, structure, detectedFiles, dependencies } = analysisResult;
    
    // 包括的分析プロンプトを構築
    const analysisPrompt = this.buildAnalysisPrompt(
      repository,
      techStack,
      structure,
      detectedFiles || [],
      dependencies || [],
      readmeContent
    );

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `あなたは経験豊富なソフトウェアアーキテクトです。GitHubリポジトリの詳細分析を行い、プロジェクトの本質を理解して包括的な要約を作成してください。

要求される分析項目：
1. プロジェクトの目的と解決する問題
2. 技術的複雑度とアーキテクチャパターン
3. コード品質と保守性の評価
4. プロジェクトの成熟度と開発状況
5. スケーラビリティとパフォーマンス特性
6. 改善提案と潜在的な問題

JSON形式で構造化された分析結果を返してください。`
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // JSONレスポンスをパース
    const aiAnalysis = JSON.parse(responseContent);
    
    // 構造化されたRepositorySummaryオブジェクトを作成
    return this.transformAIResponseToSummary(aiAnalysis, analysisResult);
  }

  /**
   * 高度なルールベース分析による要約生成
   */
  private generateEnhancedRuleBasedSummary(analysisResult: AnalysisResult, readmeContent: string): RepositorySummary {
    const { repository, techStack, structure, detectedFiles, dependencies } = analysisResult;
    
    // READMEから詳細情報を抽出
    const readmeAnalysis = githubContentFetcher.extractProjectOverviewFromReadme(readmeContent);
    
    // プロジェクトタイプの詳細分析
    const projectAnalysis = this.analyzeProjectType(repository, techStack, structure, detectedFiles || []);
    
    // 技術スタックの複雑度分析
    const complexityAnalysis = this.analyzeTechnicalComplexity(techStack, dependencies || []);
    
    // 品質とメトリクスの分析
    const qualityAnalysis = this.analyzeCodeQuality(structure, techStack, dependencies || []);
    
    // 成熟度と開発状況の分析
    const maturityAnalysis = this.analyzeMaturity(repository, structure);
    
    // 改善提案の生成
    const recommendations = this.generateRecommendations(techStack, structure, dependencies || []);

    return {
      description: this.generateDetailedDescription(repository, projectAnalysis, readmeAnalysis),
      oneLineSummary: this.generateOneLineSummary(repository, projectAnalysis),
      purpose: this.analyzePurpose(repository, readmeAnalysis, projectAnalysis),
      category: projectAnalysis.category,
      targetUsers: this.identifyTargetUsers(projectAnalysis, techStack),
      keyFeatures: this.extractKeyFeatures(readmeAnalysis, techStack, structure),
      useCases: this.generateUseCases(projectAnalysis, techStack),
      technicalComplexity: complexityAnalysis.level,
      maintainabilityScore: qualityAnalysis.maintainability,
      codeQuality: qualityAnalysis.quality,
      maturityLevel: maturityAnalysis.level,
      developmentStatus: maturityAnalysis.status,
      architecturePattern: this.identifyArchitecturePatterns(techStack, structure),
      designPrinciples: this.identifyDesignPrinciples(structure, techStack),
      scalabilityAssessment: this.assessScalability(techStack, structure),
      recommendations: recommendations,
      potentialIssues: this.identifyPotentialIssues(techStack, structure, dependencies || []),
      analysisConfidence: 85, // ルールベース分析の信頼度
      lastAnalyzed: new Date().toISOString(),
    };
  }

  /**
   * READMEコンテンツを抽出し、使用法や機能説明を分析
   */
  private async extractReadmeContent(analysisResult: AnalysisResult): Promise<string> {
    try {
      // GitHubリポジトリからREADMEを直接取得
      const repoUrl = analysisResult.repository.html_url;
      const urlParts = repoUrl.replace('https://github.com/', '').split('/');
      
      if (urlParts.length >= 2) {
        const [owner, repo] = urlParts;
        const content = await githubContentFetcher.fetchRepositoryContent(owner, repo);
        
        if (content.readme) {
          return this.parseReadmeForFeatures(content.readme.content);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch README from GitHub:', error);
    }
    
    // フォールバック: detectedFilesからREADMEファイルを探す
    const readmeFile = analysisResult.detectedFiles?.find(file => 
      file.name.toLowerCase().includes('readme')
    );
    
    if (readmeFile) {
      // 実際のプロジェクトでは、ローカルファイルからコンテンツを読み取る
      return analysisResult.repository.description || '';
    }
    
    return analysisResult.repository.description || '';
  }
  
  /**
   * READMEコンテンツから使用法や機能説明を抽出
   */
  private parseReadmeForFeatures(readmeContent: string): string {
    if (!readmeContent) return '';
    
    // READMEの中から特定のセクションを抽出
    const lines = readmeContent.split('\n');
    let relevantContent = '';
    let isInRelevantSection = false;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // 関連するセクションのタイトルを検出
      if (lowerLine.includes('# ') && (
        lowerLine.includes('usage') || lowerLine.includes('使い方') || lowerLine.includes('使用法') ||
        lowerLine.includes('features') || lowerLine.includes('機能') ||
        lowerLine.includes('getting started') || lowerLine.includes('始め方') ||
        lowerLine.includes('examples') || lowerLine.includes('例') ||
        lowerLine.includes('what') || lowerLine.includes('概要')
      )) {
        isInRelevantSection = true;
        continue;
      }
      
      // 次のセクションに進んだら終了
      if (isInRelevantSection && line.startsWith('# ')) {
        break;
      }
      
      // 関連セクションの内容を収集
      if (isInRelevantSection && line.trim()) {
        relevantContent += line + ' ';
      }
    }
    
    // 特定のキーワードで機能を抽出
    const functionalityKeywords = [
      'github api', 'repositories', 'issues', 'pull requests', 'actions',
      'mcp server', 'ai assistant', 'claude', 'chatgpt',
      'command line', 'cli', 'コマンドライン',
      '管理', '操作', '統合', '自動化'
    ];
    
    if (relevantContent) {
      return relevantContent.trim();
    }
    
    // 全体の最初の数行から概要を抽出
    const firstParagraph = lines.slice(0, 10).join(' ').trim();
    return firstParagraph.length > 100 ? firstParagraph.substring(0, 200) + '...' : firstParagraph;
  }

  /**
   * 分析プロンプトを構築
   */
  private buildAnalysisPrompt(
    repository: any,
    techStack: any[],
    structure: any,
    detectedFiles: any[],
    dependencies: any[],
    readmeContent: string
  ): string {
    // README内容から構造化情報を抽出
    const readmeAnalysis = githubContentFetcher.extractProjectOverviewFromReadme(readmeContent);
    
    // ファイル構造の重要度分析
    const criticalFiles = detectedFiles
      .filter(file => file.importance >= 8)
      .map(file => `${file.path} (${file.type})`)
      .join(', ');
    
    // 技術スタックのカテゴリ別分析
    const techByCategory = techStack.reduce((acc: any, tech) => {
      if (!acc[tech.category]) acc[tech.category] = [];
      acc[tech.category].push(tech.name);
      return acc;
    }, {});

    return `
# 📊 GitHubリポジトリ包括分析

## 基本情報
**リポジトリ**: ${repository.name}
**説明**: ${repository.description || '説明なし'}
**主言語**: ${repository.language || '不明'}
**人気度**: ⭐${repository.stargazers_count} 🍴${repository.forks_count}
**更新**: ${repository.updated_at}

## 📖 README分析結果
${readmeAnalysis.title ? `**タイトル**: ${readmeAnalysis.title}` : ''}
${readmeAnalysis.description ? `**説明**: ${readmeAnalysis.description}` : ''}
${readmeAnalysis.features ? `**機能**: ${readmeAnalysis.features.slice(0, 5).join(', ')}` : ''}
${readmeAnalysis.installation ? `**インストール**: ${readmeAnalysis.installation}` : ''}

## 🏗️ アーキテクチャ構造
**プロジェクトタイプ**: ${structure.type}
**フレームワーク**: ${structure.framework || 'なし'}
**ビルドシステム**: ${structure.buildTool || 'なし'}
**パッケージ管理**: ${structure.packageManager || 'なし'}

**品質指標**:
- ✅ テスト: ${structure.hasTests ? 'あり' : 'なし'}
- 📚 ドキュメント: ${structure.hasDocumentation ? 'あり' : 'なし'}  
- 🔄 CI/CD: ${structure.hasCI ? 'あり' : 'なし'}
- 📝 TypeScript: ${structure.hasTypeScript ? 'あり' : 'なし'}
- 🔍 Linting: ${structure.hasLinting ? 'あり' : 'なし'}

## 🛠️ 技術スタック分析
${Object.entries(techByCategory).map(([category, techs]: [string, any]) => 
  `**${category}**: ${(techs as string[]).join(', ')}`
).join('\n')}

## 📁 重要ファイル構造
${criticalFiles || '重要なファイルが検出されませんでした'}

## 📦 依存関係概要
**総数**: ${dependencies.length}個
**主要依存関係**:
${dependencies.slice(0, 8).map(dep => 
  `- ${dep.name}@${dep.version} ${dep.isDev ? '(dev)' : '(prod)'}`
).join('\n')}

## 🎯 分析指示

あなたは経験豊富なソフトウェアアーキテクトとして、上記の情報を基に以下の観点で包括的分析を行ってください：

### 1. プロジェクト本質の理解
- このプロジェクトは何を解決しようとしているか？
- ターゲットユーザーは誰か？
- 類似プロジェクトと比較した独自性は？

### 2. 技術的評価
- アーキテクチャの適切性と設計品質
- 技術選択の妥当性と将来性
- コードベースの成熟度と保守性

### 3. 実用性評価
- 実際の使用場面とユースケース
- 学習コストと導入障壁
- スケーラビリティとパフォーマンス特性

### 4. 改善提案
- セキュリティ・パフォーマンス・保守性の改善点
- 推奨される次のステップ
- 潜在的なリスクと対策

以下のJSON構造で詳細な分析結果を返してください:
{
  "description": "プロジェクトの本質を表現する2-3文の説明",
  "oneLineSummary": "プロジェクトを一言で表現",
  "purpose": "解決しようとしている具体的な問題・課題",
  "category": "最も適切なカテゴリ",
  "targetUsers": ["具体的なターゲットユーザー"],
  "keyFeatures": ["ユーザーから見た主要機能・価値"],
  "useCases": ["実際の使用場面・シナリオ"],
  "technicalComplexity": "beginner/intermediate/advanced/expert",
  "maintainabilityScore": "0-100の数値",
  "codeQuality": {
    "score": "総合的なコード品質スコア",
    "testCoverage": "テストカバレッジレベル",
    "documentation": "ドキュメント品質",
    "codeStyle": "コーディング規約遵守度",
    "errorHandling": "エラーハンドリング品質",
    "modularity": "モジュール化・分離度"
  },
  "maturityLevel": "開発段階の評価",
  "developmentStatus": "現在の開発活動状況",
  "architecturePattern": ["使用されているアーキテクチャパターン"],
  "designPrinciples": ["遵守されている設計原則"],
  "scalabilityAssessment": {
    "score": "スケーラビリティ総合スコア",
    "horizontalScaling": "水平スケーリング対応度",
    "verticalScaling": "垂直スケーリング対応度", 
    "performanceOptimization": "パフォーマンス最適化レベル",
    "caching": "キャッシュ戦略の実装度"
  },
  "recommendations": [
    {
      "type": "改善カテゴリ",
      "priority": "優先度",
      "title": "改善提案のタイトル",
      "description": "具体的な改善内容と期待効果",
      "effort": "実装工数の見積もり",
      "impact": "改善によるインパクト"
    }
  ],
  "potentialIssues": ["現在または将来の潜在的課題"],
  "analysisConfidence": "この分析の信頼度（0-100）"
}`;
  }

  /**
   * AI応答をRepositorySummaryに変換
   */
  private transformAIResponseToSummary(
    aiAnalysis: any, 
    analysisResult: AnalysisResult
  ): RepositorySummary {
    return {
      description: aiAnalysis.description || 'プロジェクトの説明を生成できませんでした',
      oneLineSummary: aiAnalysis.oneLineSummary || aiAnalysis.description || '',
      purpose: aiAnalysis.purpose || 'プロジェクトの目的を特定できませんでした',
      category: this.validateCategory(aiAnalysis.category),
      targetUsers: Array.isArray(aiAnalysis.targetUsers) ? aiAnalysis.targetUsers : ['一般開発者'],
      keyFeatures: Array.isArray(aiAnalysis.keyFeatures) ? aiAnalysis.keyFeatures : [],
      useCases: Array.isArray(aiAnalysis.useCases) ? aiAnalysis.useCases : [],
      technicalComplexity: this.validateComplexity(aiAnalysis.technicalComplexity),
      maintainabilityScore: Math.min(100, Math.max(0, aiAnalysis.maintainabilityScore || 50)),
      codeQuality: this.validateCodeQuality(aiAnalysis.codeQuality),
      maturityLevel: this.validateMaturityLevel(aiAnalysis.maturityLevel),
      developmentStatus: this.validateDevelopmentStatus(aiAnalysis.developmentStatus),
      architecturePattern: Array.isArray(aiAnalysis.architecturePattern) ? aiAnalysis.architecturePattern : [],
      designPrinciples: Array.isArray(aiAnalysis.designPrinciples) ? aiAnalysis.designPrinciples : [],
      scalabilityAssessment: this.validateScalabilityAssessment(aiAnalysis.scalabilityAssessment),
      recommendations: Array.isArray(aiAnalysis.recommendations) ? 
        aiAnalysis.recommendations.map((rec: any) => this.validateRecommendation(rec)) : [],
      potentialIssues: Array.isArray(aiAnalysis.potentialIssues) ? aiAnalysis.potentialIssues : [],
      analysisConfidence: Math.min(100, Math.max(0, aiAnalysis.analysisConfidence || 70)),
      lastAnalyzed: new Date().toISOString(),
    };
  }

  /**
   * フォールバック要約生成
   */
  private generateFallbackSummary(analysisResult: AnalysisResult): RepositorySummary {
    const { repository, techStack, structure } = analysisResult;
    
    return {
      description: repository.description || `${repository.name}プロジェクト`,
      oneLineSummary: repository.description || `${repository.language}で開発された${structure.type}プロジェクト`,
      purpose: '詳細な分析を実行できませんでした',
      category: this.inferCategoryFromStructure(structure),
      targetUsers: ['開発者'],
      keyFeatures: techStack.slice(0, 5).map(tech => tech.name),
      useCases: ['ソフトウェア開発'],
      technicalComplexity: this.inferComplexityFromTechStack(techStack),
      maintainabilityScore: structure.hasTests ? 70 : 50,
      codeQuality: {
        score: structure.hasTests ? 70 : 50,
        testCoverage: structure.hasTests ? 'medium' : 'none',
        documentation: structure.hasDocumentation ? 'good' : 'basic',
        codeStyle: 'basic',
        errorHandling: 'basic',
        modularity: 'basic'
      },
      maturityLevel: repository.stargazers_count > 100 ? 'stable' : 'beta',
      developmentStatus: 'active',
      architecturePattern: [],
      designPrinciples: [],
      scalabilityAssessment: {
        score: 60,
        horizontalScaling: 'fair',
        verticalScaling: 'fair',
        performanceOptimization: 'basic',
        caching: 'none'
      },
      recommendations: [],
      potentialIssues: [],
      analysisConfidence: 40,
      lastAnalyzed: new Date().toISOString(),
    };
  }

  // バリデーション・変換ヘルパーメソッド
  private validateCategory(category: string): ProjectCategory {
    const validCategories: ProjectCategory[] = [
      'web-application', 'mobile-application', 'desktop-application', 
      'library', 'cli-tool', 'api-service', 'development-tool', 
      'game', 'documentation', 'template', 'plugin', 'educational', 
      'experiment', 'unknown'
    ];
    return validCategories.includes(category as ProjectCategory) 
      ? category as ProjectCategory 
      : 'unknown';
  }

  private validateComplexity(complexity: string): TechnicalComplexity {
    const validComplexities: TechnicalComplexity[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    return validComplexities.includes(complexity as TechnicalComplexity) 
      ? complexity as TechnicalComplexity 
      : 'intermediate';
  }

  private validateMaturityLevel(level: string): MaturityLevel {
    const validLevels: MaturityLevel[] = ['prototype', 'alpha', 'beta', 'stable', 'mature', 'legacy'];
    return validLevels.includes(level as MaturityLevel) 
      ? level as MaturityLevel 
      : 'beta';
  }

  private validateDevelopmentStatus(status: string): DevelopmentStatus {
    const validStatuses: DevelopmentStatus[] = ['active', 'maintained', 'stagnant', 'abandoned'];
    return validStatuses.includes(status as DevelopmentStatus) 
      ? status as DevelopmentStatus 
      : 'active';
  }

  private validateCodeQuality(quality: any): CodeQuality {
    if (!quality || typeof quality !== 'object') {
      return {
        score: 50,
        testCoverage: 'none',
        documentation: 'basic',
        codeStyle: 'basic',
        errorHandling: 'basic',
        modularity: 'basic'
      };
    }

    return {
      score: Math.min(100, Math.max(0, quality.score || 50)),
      testCoverage: ['none', 'low', 'medium', 'high'].includes(quality.testCoverage) 
        ? quality.testCoverage : 'none',
      documentation: ['none', 'basic', 'good', 'excellent'].includes(quality.documentation) 
        ? quality.documentation : 'basic',
      codeStyle: ['inconsistent', 'basic', 'good', 'excellent'].includes(quality.codeStyle) 
        ? quality.codeStyle : 'basic',
      errorHandling: ['none', 'basic', 'good', 'excellent'].includes(quality.errorHandling) 
        ? quality.errorHandling : 'basic',
      modularity: ['monolithic', 'basic', 'good', 'excellent'].includes(quality.modularity) 
        ? quality.modularity : 'basic'
    };
  }

  private validateScalabilityAssessment(assessment: any): ScalabilityAssessment {
    if (!assessment || typeof assessment !== 'object') {
      return {
        score: 60,
        horizontalScaling: 'fair',
        verticalScaling: 'fair',
        performanceOptimization: 'basic',
        caching: 'none'
      };
    }

    const validLevels = ['poor', 'fair', 'good', 'excellent'];
    const validBasicLevels = ['none', 'basic', 'good', 'excellent'];

    return {
      score: Math.min(100, Math.max(0, assessment.score || 60)),
      horizontalScaling: validLevels.includes(assessment.horizontalScaling) 
        ? assessment.horizontalScaling : 'fair',
      verticalScaling: validLevels.includes(assessment.verticalScaling) 
        ? assessment.verticalScaling : 'fair',
      performanceOptimization: validBasicLevels.includes(assessment.performanceOptimization) 
        ? assessment.performanceOptimization : 'basic',
      caching: validBasicLevels.includes(assessment.caching) 
        ? assessment.caching : 'none'
    };
  }

  private validateRecommendation(rec: any): Recommendation {
    const validTypes = ['security', 'performance', 'maintainability', 'architecture', 'tooling'];
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const validEfforts = ['low', 'medium', 'high'];
    const validImpacts = ['low', 'medium', 'high'];

    return {
      type: validTypes.includes(rec.type) ? rec.type : 'maintainability',
      priority: validPriorities.includes(rec.priority) ? rec.priority : 'medium',
      title: rec.title || '改善提案',
      description: rec.description || '詳細な説明が必要です',
      effort: validEfforts.includes(rec.effort) ? rec.effort : 'medium',
      impact: validImpacts.includes(rec.impact) ? rec.impact : 'medium'
    };
  }

  private inferCategoryFromStructure(structure: any): ProjectCategory {
    if (structure.type === 'web') return 'web-application';
    if (structure.type === 'mobile') return 'mobile-application';
    if (structure.type === 'desktop') return 'desktop-application';
    if (structure.type === 'cli') return 'cli-tool';
    if (structure.type === 'library') return 'library';
    return 'unknown';
  }

  private inferComplexityFromTechStack(techStack: any[]): TechnicalComplexity {
    const complexTech = techStack.filter(tech => 
      ['kubernetes', 'docker', 'microservices', 'graphql', 'tensorflow'].includes(tech.name.toLowerCase())
    );
    
    if (complexTech.length > 2) return 'expert';
    if (techStack.length > 10) return 'advanced';
    if (techStack.length > 5) return 'intermediate';
    return 'beginner';
  }

  // 高度なルールベース分析メソッド

  private analyzeProjectType(repository: any, techStack: any[], structure: any, detectedFiles: any[]) {
    const { name, description = '', language } = repository;
    const lowerDesc = description.toLowerCase();
    const lowerName = name.toLowerCase();
    
    // プロジェクトタイプを分析
    let category: ProjectCategory = 'unknown';
    let type = 'ソフトウェアプロジェクト';
    let detectedLanguage = language || 'その他';
    
    // フレームワーク・技術ベースの分析
    const frameworks = techStack?.map(t => t.name?.toLowerCase()).filter(Boolean) || [];
    
    // 検出されたファイルから推測
    const fileTypes = detectedFiles?.map(f => f.type?.toLowerCase()).filter(Boolean) || [];
    const filePaths = detectedFiles?.map(f => f.path?.toLowerCase()).filter(Boolean) || [];
    
    // ファイル拡張子から言語を推測
    if (!detectedLanguage || detectedLanguage === 'unknown' || detectedLanguage === 'Unknown') {
      const goFiles = filePaths.filter(p => p.endsWith('.go')).length;
      const jsFiles = filePaths.filter(p => p.endsWith('.js') || p.endsWith('.jsx')).length;
      const tsFiles = filePaths.filter(p => p.endsWith('.ts') || p.endsWith('.tsx')).length;
      const pyFiles = filePaths.filter(p => p.endsWith('.py')).length;
      const rustFiles = filePaths.filter(p => p.endsWith('.rs')).length;
      const javaFiles = filePaths.filter(p => p.endsWith('.java')).length;
      
      if (goFiles > 0) detectedLanguage = 'Go';
      else if (tsFiles > 0) detectedLanguage = 'TypeScript';
      else if (jsFiles > 0) detectedLanguage = 'JavaScript';
      else if (pyFiles > 0) detectedLanguage = 'Python';
      else if (rustFiles > 0) detectedLanguage = 'Rust';
      else if (javaFiles > 0) detectedLanguage = 'Java';
    }
    
    // MCPサーバーの特定パターン
    if (lowerName.includes('mcp') || lowerDesc.includes('mcp') || lowerDesc.includes('model context protocol') ||
        filePaths.some(p => p.includes('mcp')) || 
        filePaths.some(p => p.includes('server') && (p.endsWith('.go') || p.endsWith('.py') || p.endsWith('.js')))) {
      category = 'development-tool';
      type = 'MCPサーバー';
    }
    // フレームワーク・技術ベースの分析
    else if (frameworks.includes('react') || frameworks.includes('vue') || frameworks.includes('angular')) {
      if (frameworks.includes('react-native') || frameworks.includes('ionic')) {
        category = 'mobile-application';
        type = 'モバイルアプリケーション';
      } else {
        category = 'web-application';
        type = 'Webアプリケーション';
      }
    } else if (frameworks.includes('electron') || frameworks.includes('tauri')) {
      category = 'desktop-application';
      type = 'デスクトップアプリケーション';
    } else if (lowerDesc.includes('library') || lowerDesc.includes('framework') || structure.type === 'library' || 
               lowerDesc.includes('ui library') || lowerDesc.includes('component library')) {
      category = 'library';
      type = 'ライブラリ';
    } else if (lowerDesc.includes('cli') || lowerName.includes('cli') || structure.type === 'cli' ||
               filePaths.some(p => p.includes('bin/')) || frameworks.includes('commander')) {
      category = 'cli-tool';
      type = 'CLIツール';
    } else if (lowerDesc.includes('api') || lowerDesc.includes('server') || frameworks.includes('express') ||
               frameworks.includes('fastify') || frameworks.includes('koa')) {
      category = 'api-service';
      type = 'APIサービス';
    } else if (lowerDesc.includes('plugin') || lowerDesc.includes('extension')) {
      category = 'plugin';
      type = 'プラグイン';
    } else if (fileTypes.includes('python') || language === 'Python') {
      if (lowerDesc.includes('ml') || lowerDesc.includes('machine learning') || lowerDesc.includes('ai')) {
        category = 'development-tool';
        type = '機械学習ツール';
      } else {
        category = 'development-tool';
        type = 'Pythonツール';
      }
    } else if (detectedLanguage === 'JavaScript' || detectedLanguage === 'TypeScript') {
      category = 'web-application';
      type = 'Webアプリケーション';
    } else if (detectedLanguage === 'Go') {
      category = 'development-tool';
      type = 'Goツール';
    } else if (detectedLanguage === 'Rust') {
      category = 'development-tool';
      type = 'Rustツール';
    } else if (detectedLanguage && detectedLanguage !== 'その他') {
      category = 'development-tool';
      type = `${detectedLanguage}プロジェクト`;
    }

    return { category, type, frameworks, language: detectedLanguage };
  }

  private analyzeTechnicalComplexity(techStack: any[], dependencies: any[]) {
    let complexityScore = 0;
    let level: TechnicalComplexity = 'beginner';

    // 技術の複雑さを評価
    const complexTechnologies = [
      'kubernetes', 'docker', 'microservices', 'graphql', 'tensorflow',
      'pytorch', 'redis', 'elasticsearch', 'mongodb', 'postgresql'
    ];

    const advancedTechnologies = [
      'webpack', 'babel', 'typescript', 'jest', 'cypress', 'storybook',
      'next.js', 'nuxt.js', 'gatsby', 'vue', 'angular'
    ];

    techStack.forEach(tech => {
      const techName = tech.name.toLowerCase();
      if (complexTechnologies.includes(techName)) {
        complexityScore += 3;
      } else if (advancedTechnologies.includes(techName)) {
        complexityScore += 2;
      } else {
        complexityScore += 1;
      }
    });

    // 依存関係の数も考慮
    const depCount = dependencies.length;
    if (depCount > 100) complexityScore += 3;
    else if (depCount > 50) complexityScore += 2;
    else if (depCount > 20) complexityScore += 1;

    // 複雑度レベルを決定
    if (complexityScore >= 15) level = 'expert';
    else if (complexityScore >= 10) level = 'advanced';
    else if (complexityScore >= 5) level = 'intermediate';

    return { level, score: complexityScore };
  }

  private analyzeCodeQuality(structure: any, techStack: any[], dependencies: any[]) {
    let qualityScore = 50; // ベーススコア
    
    // 品質指標の評価
    if (structure.hasTests) qualityScore += 15;
    if (structure.hasTypeScript) qualityScore += 10;
    if (structure.hasLinting) qualityScore += 10;
    if (structure.hasDocumentation) qualityScore += 10;
    if (structure.hasCI) qualityScore += 5;

    // TypeScriptやJestなど品質向上ツールの存在
    const qualityTools = techStack.filter(tech => 
      ['typescript', 'jest', 'cypress', 'eslint', 'prettier', 'husky'].includes(tech.name.toLowerCase())
    );
    qualityScore += qualityTools.length * 3;

    // 依存関係の健全性
    const devDepRatio = dependencies.filter(dep => dep.isDev).length / Math.max(dependencies.length, 1);
    if (devDepRatio > 0.7) qualityScore += 5; // 開発依存関係が多い = 品質ツールが充実

    const maintainability = Math.min(95, Math.max(30, qualityScore));

    return {
      maintainability,
      quality: {
        score: maintainability,
        testCoverage: structure.hasTests ? 'medium' as const : 'low' as const,
        documentation: structure.hasDocumentation ? 'good' as const : 'basic' as const,
        codeStyle: structure.hasLinting ? 'good' as const : 'basic' as const,
        errorHandling: structure.hasTypeScript ? 'good' as const : 'basic' as const,
        modularity: techStack.length > 5 ? 'good' as const : 'basic' as const
      }
    };
  }

  private analyzeMaturity(repository: any, structure: any) {
    const { stargazers_count = 0, forks_count = 0, created_at, updated_at } = repository;
    
    let level: MaturityLevel = 'beta';
    let status: DevelopmentStatus = 'active';

    // 人気度による成熟度評価
    if (stargazers_count > 10000) level = 'mature';
    else if (stargazers_count > 1000) level = 'stable';
    else if (stargazers_count > 100) level = 'beta';
    else level = 'alpha';

    // 最終更新からの経過時間で開発状況を判定
    const lastUpdate = new Date(updated_at);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 30) status = 'active';
    else if (daysSinceUpdate < 180) status = 'maintained';
    else if (daysSinceUpdate < 365) status = 'stagnant';
    else status = 'abandoned';

    return { level, status };
  }

  private generateRecommendations(techStack: any[], structure: any, dependencies: any[]) {
    const recommendations: any[] = [];

    // テストカバレッジの改善
    if (!structure.hasTests) {
      recommendations.push({
        type: 'maintainability',
        priority: 'high',
        title: 'テストスイートの導入',
        description: 'プロジェクトの品質と信頼性を向上させるため、単体テストと統合テストの実装を推奨します',
        effort: 'medium',
        impact: 'high'
      });
    }

    // TypeScript導入
    if (!structure.hasTypeScript && techStack.some(t => t.name.toLowerCase().includes('javascript'))) {
      recommendations.push({
        type: 'maintainability',
        priority: 'medium',
        title: 'TypeScript導入',
        description: 'コードの型安全性と開発効率を向上させるためTypeScriptの導入を検討してください',
        effort: 'medium',
        impact: 'medium'
      });
    }

    // CI/CD設定
    if (!structure.hasCI) {
      recommendations.push({
        type: 'tooling',
        priority: 'medium',
        title: 'CI/CDパイプライン構築',
        description: 'コード品質の自動化とデプロイメントの効率化のためCI/CDパイプラインの導入を推奨します',
        effort: 'medium',
        impact: 'high'
      });
    }

    // セキュリティ
    const hasOldDependencies = dependencies.some(dep => {
      const version = dep.version?.replace(/[^\d.]/g, '');
      return version && parseFloat(version) < 1.0;
    });

    if (hasOldDependencies) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: '依存関係の更新',
        description: '古いバージョンの依存関係を最新版に更新し、セキュリティリスクを軽減してください',
        effort: 'low',
        impact: 'high'
      });
    }

    return recommendations;
  }

  private generateDetailedDescription(repository: any, projectAnalysis: any, readmeAnalysis: any): string {
    const { name, description } = repository;
    const readmeDesc = readmeAnalysis?.description || '';
    const type = projectAnalysis.type || 'ソフトウェアプロジェクト';
    const language = projectAnalysis.language || 'プログラミング言語';
    
    // MCPサーバーの場合の特別な説明
    if (type === 'MCPサーバー') {
      if (readmeDesc && readmeDesc.length > 10) {
        return `${name}は${language}で開発されたModel Context Protocol (MCP)サーバーです。${readmeDesc}`;
      }
      return `${name}は${language}で開発されたModel Context Protocol (MCP)サーバーで、AIアシスタントと外部システムの連携を可能にします。GitHubとの統合機能を提供し、リポジトリ管理、Issue追跡、Pull Request操作などの機能をAIから直接利用できるようにします。`;
    }
    
    if (readmeDesc && readmeDesc.length > 10) {
      return `${name}は${language}で開発された${type}です。${readmeDesc}`;
    } else if (description && description.length > 5) {
      return `${name}は${description}を目的とした${language}製の${type}です。`;
    }
    
    return `${name}は${language}で開発された${type}として、特定の開発課題の解決を目指しています。`;
  }

  private generateOneLineSummary(repository: any, projectAnalysis: any): string {
    const language = projectAnalysis.language || repository.language || 'その他の言語';
    const type = projectAnalysis.type || 'ソフトウェアプロジェクト';
    return `${language}で開発された${type}`;
  }

  private analyzePurpose(repository: any, readmeAnalysis: any, projectAnalysis: any): string {
    // READMEから抽出した説明を優先
    if (readmeAnalysis?.description && readmeAnalysis.description.length > 10) {
      return readmeAnalysis.description;
    }
    
    // リポジトリの説明を使用
    if (repository.description && repository.description.length > 5) {
      return repository.description;
    }

    // MCPサーバー特別な目的説明
    if (projectAnalysis?.type === 'MCPサーバー') {
      if (repository.name?.toLowerCase().includes('github')) {
        return 'ClaudeやChatGPTなどのAIアシスタントが自然言語でGitHubを操作できるようにし、リポジトリ管理、Issue処理、コードレビューなどの開発ワークフローをAIの支援を受けながら効率化する';
      }
      return 'AIアシスタントと外部システム間のシームレスな統合を実現し、会話型インターフェースから直接システム操作を可能にする';
    }

    // カテゴリに基づく目的の推定
    const purposeMap: Record<string, string> = {
      'web-application': 'ユーザーにWebベースのサービスを提供する',
      'mobile-application': 'モバイルデバイス向けのアプリケーションサービスを提供する',
      'library': '他の開発者が利用可能な再利用可能なコードを提供する',
      'cli-tool': 'コマンドライン操作による効率的な作業環境を提供する',
      'api-service': 'システム間連携のためのAPIサービスを提供する',
      'development-tool': '開発者の作業効率や産品クオリティを向上させる',
      'plugin': '既存システムの機能を拡張し、カスタマイズ性を提供する'
    };

    return purposeMap[projectAnalysis.category] || 'ソフトウェア開発における特定の課題を解決する';
  }

  private identifyTargetUsers(projectAnalysis: any, techStack: any[]): string[] {
    const users: string[] = [];
    
    switch (projectAnalysis?.category) {
      case 'web-application':
        users.push('Webユーザー', 'フロントエンド開発者');
        break;
      case 'mobile-application':
        users.push('モバイルユーザー', 'モバイル開発者');
        break;
      case 'library':
        users.push('ソフトウェア開発者', 'プログラマー');
        break;
      case 'cli-tool':
        users.push('システム管理者', '開発者', 'DevOpsエンジニア');
        break;
      case 'api-service':
        users.push('バックエンド開発者', 'システムインテグレーター');
        break;
      case 'development-tool':
        users.push('ソフトウェア開発者', 'デベロッパー', 'エンジニア');
        break;
      case 'plugin':
        users.push('エンドユーザー', 'システム管理者', '開発者');
        break;
      default:
        users.push('ソフトウェア開発者');
    }

    // 技術スタックに基づく追加ユーザー
    if (techStack && Array.isArray(techStack)) {
      if (techStack.some(t => t?.name?.toLowerCase().includes('react'))) {
        users.push('React開発者');
      }
      if (techStack.some(t => t?.name?.toLowerCase().includes('typescript'))) {
        users.push('TypeScript開発者');
      }
      if (techStack.some(t => t?.name?.toLowerCase().includes('python'))) {
        users.push('Python開発者');
      }
      if (techStack.some(t => t?.name?.toLowerCase().includes('go'))) {
        users.push('Go開発者');
      }
    }

    return [...new Set(users)]; // 重複を除去
  }

  private extractKeyFeatures(readmeAnalysis: any, techStack: any[], structure: any): string[] {
    const features: string[] = [];
    
    // READMEから機能を抽出
    if (readmeAnalysis?.features && Array.isArray(readmeAnalysis.features) && readmeAnalysis.features.length > 0) {
      features.push(...readmeAnalysis.features.slice(0, 5));
    }
    
    // 検出されたファイルから具体的な機能を抽出
    const detectedFeatures = this.analyzeImplementedFeatures(structure?.detectedFiles || []);
    if (detectedFeatures.length > 0) {
      features.push(...detectedFeatures.slice(0, 4));
    }
    
    // 技術スタックがある場合のみ主要機能を推定
    if (techStack && Array.isArray(techStack) && techStack.length > 0) {
      techStack.slice(0, 2).forEach(tech => {
        if (tech?.name) {
          features.push(`${tech.name}対応`);
        }
      });
    }

    // プロジェクト特性から機能を追加
    if (structure?.hasTests) features.push('統合テスト');
    if (structure?.hasDocumentation) features.push('詳細ドキュメント');
    if (structure?.hasTypeScript) features.push('型安全性');
    if (structure?.hasLinting) features.push('コード品質管理');

    // 機能が空の場合のデフォルト機能
    if (features.length === 0) {
      features.push('システム統合', 'API連携', 'データ処理', '自動化機能');
    }

    return [...new Set(features)].slice(0, 6);
  }

  /**
   * 検出されたファイルから具体的な機能を分析
   */
  private analyzeImplementedFeatures(detectedFiles: any[]): string[] {
    const features: string[] = [];
    
    if (!Array.isArray(detectedFiles)) return features;
    
    const filePaths = detectedFiles.map(f => f.path?.toLowerCase()).filter(Boolean);
    
    // GitHub関連機能を分析
    if (filePaths.some(p => p.includes('github'))) {
      if (filePaths.some(p => p.includes('actions'))) features.push('GitHub Actions管理');
      if (filePaths.some(p => p.includes('issues'))) features.push('Issue管理・追跡');
      if (filePaths.some(p => p.includes('pullrequest'))) features.push('Pull Request操作');
      if (filePaths.some(p => p.includes('repositories'))) features.push('リポジトリ管理');
      if (filePaths.some(p => p.includes('search'))) features.push('高度な検索機能');
      if (filePaths.some(p => p.includes('secret') || p.includes('security'))) features.push('セキュリティスキャン');
      if (filePaths.some(p => p.includes('dependabot'))) features.push('Dependabot管理');
      if (filePaths.some(p => p.includes('discussions'))) features.push('ディスカッション管理');
      if (filePaths.some(p => p.includes('notifications'))) features.push('通知管理');
    }
    
    // CLIツール機能
    if (filePaths.some(p => p.includes('cmd/') || p.includes('cli'))) {
      features.push('コマンドラインインターフェース');
    }
    
    // テスト機能
    if (filePaths.some(p => p.includes('test') || p.includes('e2e'))) {
      features.push('統合テストスイート');
    }
    
    // ドキュメント機能
    if (filePaths.some(p => p.includes('docs/') || p.includes('readme'))) {
      features.push('詳細ドキュメント');
    }
    
    return [...new Set(features)];
  }

  private generateUseCases(projectAnalysis: any, techStack: any[]): string[] {
    const useCases: string[] = [];
    
    // MCPサーバーの場合の特別な使用例
    if (projectAnalysis?.type === 'MCPサーバー') {
      useCases.push(
        'AIアシスタントとGitHubの統合',
        'コードレビューのAI支援',
        'Issue管理の自動化',
        'AIベースのプロジェクト管理',
        '開発ワークフローの効率化'
      );
      return useCases;
    }
    
    switch (projectAnalysis?.category) {
      case 'web-application':
        useCases.push('ユーザーインターフェース提供', 'データ表示・操作', 'ユーザー認証・管理');
        break;
      case 'library':
        useCases.push('コード再利用', '機能拡張', '開発効率向上');
        break;
      case 'cli-tool':
        useCases.push('自動化スクリプト', 'システム管理', 'バッチ処理');
        break;
      case 'api-service':
        useCases.push('データ連携', 'マイクロサービス', 'システム統合');
        break;
      case 'development-tool':
        useCases.push('開発効率化', 'コード品質向上', 'プロジェクト管理支援');
        break;
      default:
        useCases.push('ソフトウェア開発', '問題解決', '効率化');
    }

    return useCases;
  }

  private identifyArchitecturePatterns(techStack: any[], structure: any): string[] {
    const patterns: string[] = [];
    
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    if (frameworks.includes('react') || frameworks.includes('vue')) {
      patterns.push('コンポーネントベースアーキテクチャ');
    }
    if (frameworks.includes('redux') || frameworks.includes('vuex')) {
      patterns.push('状態管理パターン');
    }
    if (frameworks.includes('express') || frameworks.includes('fastify')) {
      patterns.push('RESTfulアーキテクチャ');
    }
    if (frameworks.includes('graphql')) {
      patterns.push('GraphQLアーキテクチャ');
    }
    if (structure.hasTests) {
      patterns.push('テスト駆動開発');
    }

    return patterns;
  }

  private identifyDesignPrinciples(structure: any, techStack: any[]): string[] {
    const principles: string[] = [];
    
    if (structure.hasTypeScript) principles.push('型安全性');
    if (structure.hasTests) principles.push('テスタビリティ');
    if (structure.hasLinting) principles.push('コード品質');
    if (techStack.length > 3) principles.push('関心の分離');
    if (structure.packageManager) principles.push('依存関係管理');

    return principles;
  }

  private assessScalability(techStack: any[], structure: any): ScalabilityAssessment {
    let score = 60; // ベーススコア
    
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    // スケーラビリティを向上させる技術
    if (frameworks.includes('kubernetes')) score += 15;
    if (frameworks.includes('docker')) score += 10;
    if (frameworks.includes('redis')) score += 8;
    if (frameworks.includes('nginx')) score += 5;
    if (structure.hasTests) score += 10;

    return {
      score: Math.min(95, score),
      horizontalScaling: score > 80 ? 'excellent' as const : score > 60 ? 'good' as const : 'fair' as const,
      verticalScaling: score > 70 ? 'good' as const : 'fair' as const,
      performanceOptimization: structure.hasLinting ? 'good' as const : 'basic' as const,
      caching: frameworks.includes('redis') ? 'good' as const : 'none' as const
    };
  }

  private identifyPotentialIssues(techStack: any[], structure: any, dependencies: any[]): string[] {
    const issues: string[] = [];
    
    if (!structure.hasTests) {
      issues.push('テストカバレッジ不足によるバグリスク');
    }
    
    if (dependencies.length > 100) {
      issues.push('過度な依存関係による複雑性');
    }
    
    if (!structure.hasTypeScript && techStack.some(t => t.name.toLowerCase().includes('javascript'))) {
      issues.push('型安全性の欠如による実行時エラーリスク');
    }
    
    if (!structure.hasCI) {
      issues.push('手動デプロイによる人的ミスリスク');
    }

    return issues;
  }
}

// シングルトンインスタンスをエクスポート
export const repositorySummaryEngine = new RepositorySummaryEngine();