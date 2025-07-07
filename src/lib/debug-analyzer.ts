/**
 * 分析結果デバッグ・可視化ユーティリティ
 * 実際のアウトプットを把握し、問題を特定するためのツール
 */

export interface AnalysisDebugInfo {
  repositoryInfo: {
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    url: string;
  };
  readmeAnalysis: {
    hasReadme: boolean;
    titleExtracted: string;
    descriptionExtracted: string;
    descriptionLength: number;
    featuresCount: number;
    examplesCount: number;
    installationMethods: string[];
    usageInfoLength: number;
  };
  techStackAnalysis: {
    totalTechnologies: number;
    languages: string[];
    frameworks: string[];
    tools: string[];
    categories: Record<string, number>;
  };
  practicalSummaryOutput: {
    purposeGenerated: string;
    coreFunctionGenerated: string;
    implementationStrategy: string;
    quickStartSteps: number;
    practicalExamples: number;
    finalSummaryLength: number;
  };
  qualityAssessment: {
    isGeneric: boolean;
    hasSpecificDetails: boolean;
    providesActionableInfo: boolean;
    exceedsReadmeValue: boolean;
    engineerUseful: boolean;
    overallScore: number; // 0-100
  };
}

export class AnalysisDebugger {
  
  /**
   * 分析結果の詳細デバッグ情報を生成
   */
  generateDebugInfo(
    repository: any,
    readmeAnalysis: any,
    techStack: any[],
    practicalSummary: any
  ): AnalysisDebugInfo {
    
    console.log('🔍 Generating comprehensive debug info...');
    
    const repositoryInfo = {
      name: repository.name,
      description: repository.description,
      language: repository.language,
      stars: repository.stargazers_count || 0,
      url: repository.html_url
    };
    
    const readmeDebug = this.analyzeReadmeQuality(readmeAnalysis);
    const techStackDebug = this.analyzeTechStackQuality(techStack);
    const summaryDebug = this.analyzeSummaryQuality(practicalSummary);
    const qualityScore = this.assessOverallQuality(
      repositoryInfo,
      readmeDebug,
      techStackDebug,
      summaryDebug
    );
    
    const debugInfo: AnalysisDebugInfo = {
      repositoryInfo,
      readmeAnalysis: readmeDebug,
      techStackAnalysis: techStackDebug,
      practicalSummaryOutput: summaryDebug,
      qualityAssessment: qualityScore
    };
    
    // コンソールに詳細情報を出力
    this.logDetailedAnalysis(debugInfo);
    
    return debugInfo;
  }
  
  private analyzeReadmeQuality(readmeAnalysis: any) {
    return {
      hasReadme: !!readmeAnalysis,
      titleExtracted: readmeAnalysis?.title || 'No title',
      descriptionExtracted: readmeAnalysis?.description || 'No description',
      descriptionLength: readmeAnalysis?.description?.length || 0,
      featuresCount: readmeAnalysis?.features?.length || 0,
      examplesCount: readmeAnalysis?.examples?.length || 0,
      installationMethods: Object.keys(readmeAnalysis?.installation || {}),
      usageInfoLength: readmeAnalysis?.usage?.basicUsage?.length || 0
    };
  }
  
  private analyzeTechStackQuality(techStack: any[]) {
    const categories: Record<string, number> = {};
    const languages: string[] = [];
    const frameworks: string[] = [];
    const tools: string[] = [];
    
    techStack.forEach(tech => {
      const category = tech.category.toLowerCase();
      categories[category] = (categories[category] || 0) + 1;
      
      if (category.includes('language') || category.includes('言語')) {
        languages.push(tech.name);
      } else if (category.includes('framework') || category.includes('フレームワーク')) {
        frameworks.push(tech.name);
      } else if (category.includes('tool') || category.includes('ツール')) {
        tools.push(tech.name);
      }
    });
    
    return {
      totalTechnologies: techStack.length,
      languages,
      frameworks,
      tools,
      categories
    };
  }
  
  private analyzeSummaryQuality(practicalSummary: any) {
    return {
      purposeGenerated: practicalSummary?.whatAndHow?.purpose || 'No purpose',
      coreFunctionGenerated: practicalSummary?.whatAndHow?.coreFunction || 'No core function',
      implementationStrategy: practicalSummary?.technicalApproach?.implementationStrategy || 'No strategy',
      quickStartSteps: practicalSummary?.whatAndHow?.quickStart?.installation?.length || 0,
      practicalExamples: practicalSummary?.whatAndHow?.practicalExamples?.length || 0,
      finalSummaryLength: practicalSummary?.practicalSummary?.length || 0
    };
  }
  
  private assessOverallQuality(
    repo: any,
    readme: any,
    techStack: any,
    summary: any
  ) {
    let score = 0;
    const checks = {
      isGeneric: false,
      hasSpecificDetails: false,
      providesActionableInfo: false,
      exceedsReadmeValue: false,
      engineerUseful: false
    };
    
    // 汎用的すぎるかチェック
    const genericPhrases = [
      '特定の技術的機能の実装',
      '特定の技術的課題の解決',
      'ソフトウェア開発',
      '技術的ソリューション'
    ];
    
    const purposeText = summary.purposeGenerated.toLowerCase();
    checks.isGeneric = genericPhrases.some(phrase => purposeText.includes(phrase));
    if (!checks.isGeneric) score += 20;
    
    // 具体的な詳細があるかチェック
    checks.hasSpecificDetails = (
      summary.quickStartSteps > 0 &&
      summary.practicalExamples > 0 &&
      techStack.totalTechnologies > 2
    );
    if (checks.hasSpecificDetails) score += 25;
    
    // 実行可能な情報があるかチェック
    checks.providesActionableInfo = (
      summary.quickStartSteps > 1 &&
      summary.finalSummaryLength > 200
    );
    if (checks.providesActionableInfo) score += 20;
    
    // README以上の価値があるかチェック
    checks.exceedsReadmeValue = (
      summary.finalSummaryLength > readme.descriptionLength &&
      summary.practicalExamples > readme.examplesCount
    );
    if (checks.exceedsReadmeValue) score += 20;
    
    // エンジニアに有用かチェック
    checks.engineerUseful = (
      !checks.isGeneric &&
      checks.hasSpecificDetails &&
      checks.providesActionableInfo
    );
    if (checks.engineerUseful) score += 15;
    
    return {
      ...checks,
      overallScore: score
    };
  }
  
  private logDetailedAnalysis(debugInfo: AnalysisDebugInfo) {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DETAILED ANALYSIS DEBUG REPORT');
    console.log('='.repeat(80));
    
    console.log('\n📁 REPOSITORY INFO:');
    console.log(`  Name: ${debugInfo.repositoryInfo.name}`);
    console.log(`  Description: ${debugInfo.repositoryInfo.description}`);
    console.log(`  Language: ${debugInfo.repositoryInfo.language}`);
    console.log(`  Stars: ${debugInfo.repositoryInfo.stars}`);
    
    console.log('\n📖 README ANALYSIS:');
    console.log(`  Has README: ${debugInfo.readmeAnalysis.hasReadme}`);
    console.log(`  Title: ${debugInfo.readmeAnalysis.titleExtracted}`);
    console.log(`  Description Length: ${debugInfo.readmeAnalysis.descriptionLength}`);
    console.log(`  Features Count: ${debugInfo.readmeAnalysis.featuresCount}`);
    console.log(`  Examples Count: ${debugInfo.readmeAnalysis.examplesCount}`);
    console.log(`  Installation Methods: ${debugInfo.readmeAnalysis.installationMethods.join(', ')}`);
    
    console.log('\n🔧 TECH STACK ANALYSIS:');
    console.log(`  Total Technologies: ${debugInfo.techStackAnalysis.totalTechnologies}`);
    console.log(`  Languages: ${debugInfo.techStackAnalysis.languages.join(', ')}`);
    console.log(`  Frameworks: ${debugInfo.techStackAnalysis.frameworks.join(', ')}`);
    console.log(`  Tools: ${debugInfo.techStackAnalysis.tools.join(', ')}`);
    
    console.log('\n📝 PRACTICAL SUMMARY OUTPUT:');
    console.log(`  Purpose Generated: ${debugInfo.practicalSummaryOutput.purposeGenerated}`);
    console.log(`  Core Function: ${debugInfo.practicalSummaryOutput.coreFunctionGenerated}`);
    console.log(`  Implementation Strategy: ${debugInfo.practicalSummaryOutput.implementationStrategy}`);
    console.log(`  Quick Start Steps: ${debugInfo.practicalSummaryOutput.quickStartSteps}`);
    console.log(`  Practical Examples: ${debugInfo.practicalSummaryOutput.practicalExamples}`);
    console.log(`  Final Summary Length: ${debugInfo.practicalSummaryOutput.finalSummaryLength}`);
    
    console.log('\n📊 QUALITY ASSESSMENT:');
    console.log(`  Is Generic: ${debugInfo.qualityAssessment.isGeneric ? '❌' : '✅'}`);
    console.log(`  Has Specific Details: ${debugInfo.qualityAssessment.hasSpecificDetails ? '✅' : '❌'}`);
    console.log(`  Provides Actionable Info: ${debugInfo.qualityAssessment.providesActionableInfo ? '✅' : '❌'}`);
    console.log(`  Exceeds README Value: ${debugInfo.qualityAssessment.exceedsReadmeValue ? '✅' : '❌'}`);
    console.log(`  Engineer Useful: ${debugInfo.qualityAssessment.engineerUseful ? '✅' : '❌'}`);
    console.log(`  Overall Score: ${debugInfo.qualityAssessment.overallScore}/100`);
    
    if (debugInfo.qualityAssessment.overallScore < 60) {
      console.log('\n🚨 LOW QUALITY DETECTED - NEEDS IMPROVEMENT');
      this.suggestImprovements(debugInfo);
    }
    
    console.log('\n' + '='.repeat(80));
  }
  
  private suggestImprovements(debugInfo: AnalysisDebugInfo) {
    console.log('\n💡 IMPROVEMENT SUGGESTIONS:');
    
    if (debugInfo.qualityAssessment.isGeneric) {
      console.log('  - Purpose is too generic, need more specific analysis');
    }
    
    if (!debugInfo.qualityAssessment.hasSpecificDetails) {
      console.log('  - Need more specific technical details and examples');
    }
    
    if (!debugInfo.qualityAssessment.providesActionableInfo) {
      console.log('  - Need more actionable steps and practical guidance');
    }
    
    if (!debugInfo.qualityAssessment.exceedsReadmeValue) {
      console.log('  - Summary should provide more value than README');
    }
    
    if (debugInfo.readmeAnalysis.featuresCount === 0) {
      console.log('  - README feature extraction failed, need better parsing');
    }
    
    if (debugInfo.techStackAnalysis.totalTechnologies < 3) {
      console.log('  - Tech stack detection insufficient, need better analysis');
    }
  }
  
  /**
   * 要約の品質スコアを計算
   */
  calculateSummaryScore(summary: string, repository: any): number {
    let score = 0;
    
    // 長さチェック
    if (summary.length > 100) score += 10;
    if (summary.length > 300) score += 10;
    
    // 具体性チェック
    const specificKeywords = [
      'API', 'CLI', 'Web', 'React', 'Vue', 'Express', 'FastAPI',
      'Docker', 'Kubernetes', 'TypeScript', 'Python', 'Go', 'Rust'
    ];
    const foundKeywords = specificKeywords.filter(keyword => 
      summary.toLowerCase().includes(keyword.toLowerCase())
    );
    score += foundKeywords.length * 5;
    
    // 汎用的フレーズのペナルティ
    const genericPhrases = [
      '特定の技術的機能',
      '特定の技術的課題',
      'ソフトウェア開発',
      '技術的ソリューション'
    ];
    const genericCount = genericPhrases.filter(phrase => 
      summary.includes(phrase)
    ).length;
    score -= genericCount * 15;
    
    // リポジトリ名の活用
    if (summary.includes(repository.name)) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
}

export const analysisDebugger = new AnalysisDebugger();