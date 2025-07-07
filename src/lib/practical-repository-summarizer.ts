import { githubContentFetcher } from './github-content-fetcher';
import { enhancedReadmeAnalyzer } from './enhanced-readme-analyzer';
import { AnalysisResult } from '@/types';

export interface PracticalRepositorySummary {
  // 1. このリポジトリはどういうものでどのように用いればよいのか
  whatAndHow: WhatAndHowAnalysis;
  
  // 2. このリポジトリはそれらをどう実現しようとしているのか
  technicalApproach: TechnicalApproachAnalysis;
  
  // 3. このリポジトリはどのような構造を有しているのか
  codebaseStructure: CodebaseStructureAnalysis;
  
  // 4. ユーザーはそれらとともにこのリポジトリをどう理解すればよいのか
  understandingGuidance: UnderstandingGuidanceAnalysis;
  
  // 統合された実用的要約
  practicalSummary: string;
}

interface WhatAndHowAnalysis {
  // 何をするツールなのか
  purpose: string;
  coreFunction: string;
  
  // 実際の使用法
  quickStart: {
    installation: string[];
    firstSteps: string[];
    basicUsage: string[];
  };
  
  // 実用例とユースケース
  practicalExamples: {
    scenario: string;
    steps: string[];
    expectedOutput: string;
  }[];
  
  // 前提条件と要件
  prerequisites: {
    systemRequirements: string[];
    knowledgeRequirements: string[];
    dependencies: string[];
  };
}

interface TechnicalApproachAnalysis {
  // 技術的戦略
  implementationStrategy: string;
  architecturalChoices: string[];
  
  // 核となる技術・手法
  coreTechnologies: {
    name: string;
    role: string;
    whyChosen: string;
  }[];
  
  // 解決アプローチ
  problemSolvingApproach: {
    challenge: string;
    solution: string;
    implementation: string;
  }[];
  
  // 技術的トレードオフ
  designDecisions: {
    decision: string;
    rationale: string;
    implications: string;
  }[];
}

interface CodebaseStructureAnalysis {
  // 物理的構造
  directoryStructure: {
    path: string;
    purpose: string;
    importance: 'critical' | 'important' | 'supporting';
  }[];
  
  // 論理的構造
  codeOrganization: {
    pattern: string;
    description: string;
    examples: string[];
  };
  
  // 主要コンポーネント
  keyComponents: {
    name: string;
    location: string;
    purpose: string;
    interactions: string[];
  }[];
  
  // エントリーポイント
  entryPoints: {
    file: string;
    purpose: string;
    whenToUse: string;
  }[];
  
  // 設定とカスタマイズ
  configurationPoints: {
    file: string;
    purpose: string;
    customizationOptions: string[];
  }[];
}

interface UnderstandingGuidanceAnalysis {
  // 学習パス
  learningPath: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  };
  
  // 読み方・探し方
  codeReadingGuidance: {
    startHere: string[];
    readingOrder: string[];
    keyFilesToUnderstand: string[];
  };
  
  // カスタマイズとextension
  customizationGuidance: {
    commonCustomizations: string[];
    extensionPoints: string[];
    bestPractices: string[];
  };
  
  // トラブルシューティング
  commonIssues: {
    issue: string;
    solution: string;
    prevention: string;
  }[];
  
  // さらなる学習
  furtherLearning: {
    relatedConcepts: string[];
    recommendedResources: string[];
    nextSteps: string[];
  };
}

export class PracticalRepositorySummarizer {
  
  /**
   * ソフトウェアエンジニア向けの実用的要約を生成
   */
  async generatePracticalSummary(analysisResult: AnalysisResult): Promise<PracticalRepositorySummary> {
    console.log('🔧 Starting practical repository summarization for engineers...');
    
    // README intelligence extraction
    const readmeAnalysis = await this.extractReadmeIntelligence(analysisResult);
    
    // 1. What & How Analysis
    const whatAndHow = this.analyzeWhatAndHow(analysisResult, readmeAnalysis);
    
    // 2. Technical Approach Analysis
    const technicalApproach = this.analyzeTechnicalApproach(analysisResult, readmeAnalysis);
    
    // 3. Codebase Structure Analysis
    const codebaseStructure = this.analyzeCodebaseStructure(analysisResult);
    
    // 4. Understanding Guidance
    const understandingGuidance = this.generateUnderstandingGuidance(analysisResult, readmeAnalysis);
    
    // Practical Summary Integration
    const practicalSummary = this.synthesizePracticalSummary(
      whatAndHow, technicalApproach, codebaseStructure, understandingGuidance
    );
    
    console.log('✅ Practical repository summary generated for engineers');
    
    return {
      whatAndHow,
      technicalApproach,
      codebaseStructure,
      understandingGuidance,
      practicalSummary
    };
  }

  /**
   * README intelligence extraction (enhanced for practical use)
   */
  private async extractReadmeIntelligence(analysisResult: AnalysisResult): Promise<any> {
    try {
      const repoUrl = analysisResult.repository.html_url;
      const urlParts = repoUrl.replace('https://github.com/', '').split('/');
      
      if (urlParts.length >= 2) {
        const [owner, repo] = urlParts;
        const content = await githubContentFetcher.fetchRepositoryContent(owner, repo);
        
        if (content.readme) {
          return enhancedReadmeAnalyzer.analyzeReadme(content.readme.content);
        }
      }
    } catch (error) {
      console.warn('Failed to extract README intelligence:', error);
    }
    
    return { 
      title: analysisResult.repository.name,
      description: analysisResult.repository.description || '',
      features: [],
      installation: {},
      usage: { basicUsage: '' },
      examples: []
    };
  }

  /**
   * 1. このリポジトリはどういうものでどのように用いればよいのか
   */
  private analyzeWhatAndHow(analysisResult: AnalysisResult, readmeAnalysis: any): WhatAndHowAnalysis {
    const { repository, techStack, structure } = analysisResult;
    
    // 目的とコア機能の特定
    const purpose = this.identifyPurpose(repository, readmeAnalysis, techStack);
    const coreFunction = this.identifyCoreFunction(repository, readmeAnalysis, techStack);
    
    // クイックスタート手順
    const quickStart = this.extractQuickStart(readmeAnalysis, techStack, structure);
    
    // 実用例の生成
    const practicalExamples = this.generatePracticalExamples(repository, readmeAnalysis, techStack);
    
    // 前提条件の特定
    const prerequisites = this.identifyPrerequisites(readmeAnalysis, techStack, structure);

    return {
      purpose,
      coreFunction,
      quickStart,
      practicalExamples,
      prerequisites
    };
  }

  /**
   * 2. このリポジトリはそれらをどう実現しようとしているのか
   */
  private analyzeTechnicalApproach(analysisResult: AnalysisResult, readmeAnalysis: any): TechnicalApproachAnalysis {
    const { techStack, structure, dependencies } = analysisResult;
    
    // 実装戦略の推論
    const implementationStrategy = this.inferImplementationStrategy(techStack, structure);
    
    // アーキテクチャ選択の分析
    const architecturalChoices = this.identifyArchitecturalChoices(techStack, structure);
    
    // 核となる技術の分析
    const coreTechnologies = this.analyzeCoreTechnologies(techStack, dependencies || []);
    
    // 問題解決アプローチ
    const problemSolvingApproach = this.analyzeProblemSolvingApproach(techStack, readmeAnalysis);
    
    // 設計判断
    const designDecisions = this.inferDesignDecisions(techStack, structure);

    return {
      implementationStrategy,
      architecturalChoices,
      coreTechnologies,
      problemSolvingApproach,
      designDecisions
    };
  }

  /**
   * 3. このリポジトリはどのような構造を有しているのか
   */
  private analyzeCodebaseStructure(analysisResult: AnalysisResult): CodebaseStructureAnalysis {
    const { structure, techStack, detectedFiles } = analysisResult;
    
    // ディレクトリ構造の分析
    const directoryStructure = this.analyzeDirectoryStructure(detectedFiles || [], techStack);
    
    // コード組織化パターン
    const codeOrganization = this.identifyCodeOrganization(techStack, structure);
    
    // 主要コンポーネント
    const keyComponents = this.identifyKeyComponents(detectedFiles || [], techStack);
    
    // エントリーポイント
    const entryPoints = this.identifyEntryPoints(detectedFiles || [], techStack, structure);
    
    // 設定ポイント
    const configurationPoints = this.identifyConfigurationPoints(detectedFiles || []);

    return {
      directoryStructure,
      codeOrganization,
      keyComponents,
      entryPoints,
      configurationPoints
    };
  }

  /**
   * 4. ユーザーはそれらとともにこのリポジトリをどう理解すればよいのか
   */
  private generateUnderstandingGuidance(analysisResult: AnalysisResult, readmeAnalysis: any): UnderstandingGuidanceAnalysis {
    const { techStack, structure, dependencies } = analysisResult;
    
    // 学習パス
    const learningPath = this.generateLearningPath(techStack, structure);
    
    // コード読解ガイダンス
    const codeReadingGuidance = this.generateCodeReadingGuidance(techStack, structure);
    
    // カスタマイズガイダンス
    const customizationGuidance = this.generateCustomizationGuidance(techStack, structure);
    
    // よくある問題
    const commonIssues = this.identifyCommonIssues(techStack, dependencies || []);
    
    // さらなる学習
    const furtherLearning = this.generateFurtherLearning(techStack, readmeAnalysis);

    return {
      learningPath,
      codeReadingGuidance,
      customizationGuidance,
      commonIssues,
      furtherLearning
    };
  }

  // === Implementation Helper Methods === //

  private identifyPurpose(repository: any, readmeAnalysis: any, techStack: any[]): string {
    console.log('🔍 Purpose analysis:', { 
      repoName: repository.name, 
      repoDesc: repository.description,
      readmeDesc: readmeAnalysis.description,
      techStackCount: techStack.length,
      mainTechs: techStack.slice(0, 3).map(t => t.name)
    });
    
    // README description優先（より詳細に解析）
    if (readmeAnalysis.description && readmeAnalysis.description.length > 20) {
      // README descriptionをそのまま使うのではなく、より具体的に解釈
      const desc = readmeAnalysis.description;
      if (desc.toLowerCase().includes('tool') || desc.toLowerCase().includes('utility')) {
        return `${desc}（開発・運用効率化のためのツール）`;
      }
      if (desc.toLowerCase().includes('library') || desc.toLowerCase().includes('framework')) {
        return `${desc}（開発者向けのライブラリ・フレームワーク）`;
      }
      return desc;
    }
    
    // Repository description（GitHub description）
    if (repository.description && repository.description.length > 10) {
      const desc = repository.description;
      // GitHub descriptionも同様に具体化
      if (desc.toLowerCase().includes('api')) {
        return `${desc}（API・サービス連携のためのソリューション）`;
      }
      if (desc.toLowerCase().includes('web') || desc.toLowerCase().includes('app')) {
        return `${desc}（Webアプリケーション・サービス）`;
      }
      return desc;
    }
    
    // Tech stackからより具体的に推論
    const frameworks = techStack.map(t => t.name.toLowerCase());
    const repoName = repository.name.toLowerCase();
    
    // リポジトリ名からも手がかりを得る
    if (repoName.includes('api') || repoName.includes('server')) {
      return `${repository.name}: バックエンドAPI・サーバーサイドサービスの実装`;
    }
    if (repoName.includes('cli') || repoName.includes('tool')) {
      return `${repository.name}: コマンドライン・開発ツールの実装`;
    }
    if (repoName.includes('web') || repoName.includes('app') || repoName.includes('site')) {
      return `${repository.name}: Webアプリケーション・サービスの実装`;
    }
    
    // Tech stackベースの推論（より具体的に）
    if (frameworks.includes('react') || frameworks.includes('vue') || frameworks.includes('angular')) {
      return `${repository.name}: React/Vue/Angularを使用したモダンフロントエンドアプリケーション`;
    }
    if (frameworks.includes('express') || frameworks.includes('fastapi') || frameworks.includes('spring')) {
      return `${repository.name}: Express/FastAPI/Springを使用したRESTful APIサービス`;
    }
    if (frameworks.includes('next') || frameworks.includes('nuxt') || frameworks.includes('gatsby')) {
      return `${repository.name}: Next.js/Nuxt/Gatsbyを使用したフルスタックWebアプリケーション`;
    }
    if (frameworks.includes('docker') || frameworks.includes('kubernetes')) {
      return `${repository.name}: Docker/Kubernetesを使用したコンテナ化・オーケストレーションソリューション`;
    }
    
    // 最後の手段として、より詳細なフォールバック
    const mainLanguage = techStack.find(t => t.category === '言語' || t.category === 'language')?.name || 'Unknown';
    return `${repository.name}: ${mainLanguage}で実装された特定の技術的課題を解決するソフトウェアソリューション`;
  }

  private identifyCoreFunction(repository: any, readmeAnalysis: any, techStack: any[]): string {
    console.log('🎯 Core function analysis:', {
      features: readmeAnalysis.features,
      techStack: techStack.slice(0, 5).map(t => `${t.name}(${t.category})`)
    });
    
    // README features から核心機能を抽出（より詳細に）
    if (readmeAnalysis.features && readmeAnalysis.features.length > 0) {
      const mainFeature = readmeAnalysis.features[0];
      if (mainFeature.length > 100) {
        // 長すぎる場合は要約
        return mainFeature.substring(0, 100) + '...';
      }
      return mainFeature;
    }
    
    // README useCasesから推論
    if (readmeAnalysis.useCases && readmeAnalysis.useCases.length > 0) {
      return `主な用途: ${readmeAnalysis.useCases[0]}`;
    }
    
    // Tech stack から具体的に推論
    const frameworks = techStack.map(t => t.name.toLowerCase());
    const categories = techStack.map(t => t.category.toLowerCase());
    
    // より具体的な分析
    if (frameworks.includes('react') && frameworks.includes('typescript')) {
      return 'TypeScript + Reactによる型安全なインタラクティブUIコンポーネントの構築';
    }
    if (frameworks.includes('express') && frameworks.includes('mongodb')) {
      return 'Express + MongoDBによるRESTful API・データベース連携サービス';
    }
    if (frameworks.includes('next') || frameworks.includes('nuxt')) {
      return 'フルスタックWebアプリケーション（SSR/SSG対応）';
    }
    if (frameworks.includes('docker') && (frameworks.includes('kubernetes') || frameworks.includes('helm'))) {
      return 'コンテナ化アプリケーションのデプロイメント・オーケストレーション';
    }
    if (frameworks.includes('pytest') || frameworks.includes('jest') || frameworks.includes('mocha')) {
      return 'テスト駆動開発による品質保証・自動化テスト実行';
    }
    
    // カテゴリベースの推論
    if (categories.includes('cli') || categories.includes('tool')) {
      return `${repository.name}の核心機能: コマンドライン操作による自動化・効率化`;
    }
    if (categories.includes('library') || categories.includes('framework')) {
      return `${repository.name}の核心機能: 開発者向けライブラリ・フレームワーク機能の提供`;
    }
    
    // 最終フォールバック（より詳細に）
    const mainTech = techStack[0]?.name || '不明な技術';
    const techCategory = techStack[0]?.category || '汎用的';
    return `${mainTech}(${techCategory})を使用した${repository.name}の実装・運用機能`;
  }

  private extractQuickStart(readmeAnalysis: any, techStack: any[], structure: any): any {
    const installation: string[] = [];
    const firstSteps: string[] = [];
    const basicUsage: string[] = [];
    
    // Installation steps from README
    if (readmeAnalysis.installation) {
      if (readmeAnalysis.installation.npm) installation.push(readmeAnalysis.installation.npm);
      if (readmeAnalysis.installation.pip) installation.push(readmeAnalysis.installation.pip);
      if (readmeAnalysis.installation.yarn) installation.push(readmeAnalysis.installation.yarn);
      if (readmeAnalysis.installation.go) installation.push(readmeAnalysis.installation.go);
      if (readmeAnalysis.installation.cargo) installation.push(readmeAnalysis.installation.cargo);
    }
    
    // Default installation based on tech stack
    if (installation.length === 0) {
      const frameworks = techStack.map(t => t.name.toLowerCase());
      if (frameworks.includes('npm') || structure.packageManager === 'npm') {
        installation.push('npm install');
      }
      if (frameworks.includes('python') || frameworks.includes('pip')) {
        installation.push('pip install -r requirements.txt');
      }
      if (frameworks.includes('go')) {
        installation.push('go mod download');
      }
    }
    
    // First steps
    if (readmeAnalysis.usage && readmeAnalysis.usage.basicUsage) {
      const usageText = readmeAnalysis.usage.basicUsage;
      const sentences = usageText.split(/[.!?]/).filter((s: string) => s.trim().length > 10);
      firstSteps.push(...sentences.slice(0, 3).map((s: string) => s.trim()));
    } else {
      // Default first steps based on project type
      if (structure.hasTests) firstSteps.push('テスト実行による動作確認');
      firstSteps.push('設定ファイルの確認と必要に応じた調整');
      firstSteps.push('サンプルコードまたはドキュメントの確認');
    }
    
    // Basic usage
    if (readmeAnalysis.examples && readmeAnalysis.examples.length > 0) {
      basicUsage.push(`基本的な使用例: ${readmeAnalysis.examples[0].title || '基本実装'}`);
      if (readmeAnalysis.examples[0].code) {
        basicUsage.push('提供されたサンプルコードの実行');
      }
    } else {
      // Infer from tech stack
      const frameworks = techStack.map(t => t.name.toLowerCase());
      if (frameworks.includes('cli')) {
        basicUsage.push('コマンドライン引数を指定して実行');
      } else if (frameworks.includes('library')) {
        basicUsage.push('import/require してAPIを呼び出し');
      } else {
        basicUsage.push('メイン機能の実行');
      }
    }

    return { installation, firstSteps, basicUsage };
  }

  private generatePracticalExamples(repository: any, readmeAnalysis: any, techStack: any[]): any[] {
    const examples: any[] = [];
    
    // README examples から実用例を生成
    if (readmeAnalysis.examples && readmeAnalysis.examples.length > 0) {
      readmeAnalysis.examples.slice(0, 3).forEach((example: any) => {
        examples.push({
          scenario: example.title || '基本的な使用例',
          steps: [
            'コードを実行環境にコピー',
            '必要な設定やパラメータを調整',
            '実行して結果を確認'
          ],
          expectedOutput: example.description || '期待される結果の出力'
        });
      });
    }
    
    // Tech stack から推論した実用例
    if (examples.length === 0) {
      const frameworks = techStack.map(t => t.name.toLowerCase());
      
      if (frameworks.includes('api') || frameworks.includes('express')) {
        examples.push({
          scenario: 'API エンドポイントの使用',
          steps: [
            'サーバーを起動',
            'HTTP クライアントでエンドポイントにリクエスト送信',
            'レスポンスの確認と処理'
          ],
          expectedOutput: 'JSON形式のレスポンスとHTTPステータスコード'
        });
      } else if (frameworks.includes('cli')) {
        examples.push({
          scenario: 'コマンドライン実行',
          steps: [
            'コマンドライン引数を準備',
            'プログラムを実行',
            '結果の確認とログ出力の確認'
          ],
          expectedOutput: 'コンソール出力と処理結果'
        });
      } else {
        examples.push({
          scenario: '基本的な機能の使用',
          steps: [
            'プログラムのセットアップ',
            '主要機能の実行',
            '結果の確認'
          ],
          expectedOutput: '想定された処理結果'
        });
      }
    }

    return examples;
  }

  private identifyPrerequisites(readmeAnalysis: any, techStack: any[], structure: any): any {
    const systemRequirements: string[] = [];
    const knowledgeRequirements: string[] = [];
    const dependencies: string[] = [];
    
    // README から前提条件を抽出
    if (readmeAnalysis.installation && readmeAnalysis.installation.prerequisites) {
      systemRequirements.push(...readmeAnalysis.installation.prerequisites);
    }
    
    // Tech stack から要件を推論
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    // System requirements
    if (frameworks.includes('node') || frameworks.includes('npm')) {
      systemRequirements.push('Node.js (推奨: LTS版)');
    }
    if (frameworks.includes('python')) {
      systemRequirements.push('Python 3.7+ または対応バージョン');
    }
    if (frameworks.includes('go')) {
      systemRequirements.push('Go 1.16+ または対応バージョン');
    }
    if (frameworks.includes('rust')) {
      systemRequirements.push('Rust toolchain');
    }
    if (frameworks.includes('docker')) {
      systemRequirements.push('Docker Engine');
    }
    
    // Knowledge requirements
    if (frameworks.includes('typescript')) {
      knowledgeRequirements.push('TypeScript の基本的な理解');
    }
    if (frameworks.includes('react')) {
      knowledgeRequirements.push('React components とライフサイクルの理解');
    }
    if (frameworks.includes('api') || frameworks.includes('rest')) {
      knowledgeRequirements.push('REST API の基本概念');
    }
    if (frameworks.includes('cli')) {
      knowledgeRequirements.push('コマンドライン操作の基本');
    }
    
    // Basic dependencies
    if (structure.packageManager) {
      dependencies.push(`パッケージマネージャー (${structure.packageManager})`);
    }
    
    return {
      systemRequirements: systemRequirements.length > 0 ? systemRequirements : ['標準的な開発環境'],
      knowledgeRequirements: knowledgeRequirements.length > 0 ? knowledgeRequirements : ['基本的なプログラミング知識'],
      dependencies: dependencies.length > 0 ? dependencies : ['プロジェクト固有の依存関係']
    };
  }

  private inferImplementationStrategy(techStack: any[], structure: any): string {
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    // 主要なアーキテクチャパターンから戦略を推論
    if (frameworks.includes('microservice') || frameworks.includes('kubernetes')) {
      return 'マイクロサービスアーキテクチャによる分散システム設計で、スケーラビリティと保守性を重視';
    }
    
    if (frameworks.includes('react') || frameworks.includes('vue')) {
      return 'コンポーネントベースアーキテクチャによる再利用可能なUI構築と状態管理';
    }
    
    if (frameworks.includes('api') || frameworks.includes('rest')) {
      return 'RESTful API 設計によるクライアント-サーバー間のデータ交換とサービス連携';
    }
    
    if (structure.hasTests && structure.hasTypeScript) {
      return '型安全性とテスト駆動開発による品質重視の実装アプローチ';
    }
    
    if (frameworks.includes('cli')) {
      return 'コマンドライン操作による自動化と開発ワークフローの効率化';
    }
    
    return '段階的開発とイテレーティブ改善による継続的な価値提供';
  }

  private identifyArchitecturalChoices(techStack: any[], structure: any): string[] {
    const choices: string[] = [];
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    // アーキテクチャ的選択を特定
    if (frameworks.includes('typescript')) {
      choices.push('TypeScript採用による静的型検査とコード品質向上');
    }
    
    if (frameworks.includes('react')) {
      choices.push('React生態系の活用による効率的なフロントエンド開発');
    }
    
    if (frameworks.includes('nodejs') || frameworks.includes('express')) {
      choices.push('Node.js runtime による JavaScript统一環境');
    }
    
    if (structure.hasTests) {
      choices.push('自動テスト導入による継続的品質保証');
    }
    
    if (structure.hasCI) {
      choices.push('CI/CD パイプライン構築による自動化デプロイ');
    }
    
    if (frameworks.includes('docker')) {
      choices.push('コンテナ化による環境の一貫性と配布容易性');
    }
    
    return choices.length > 0 ? choices : ['標準的な開発手法とベストプラクティスの採用'];
  }

  private analyzeCoreTechnologies(techStack: any[], dependencies: any[]): any[] {
    const coreTechs: any[] = [];
    
    // 主要な技術を分析
    techStack.slice(0, 5).forEach(tech => {
      const role = this.inferTechRole(tech.name, tech.category);
      const whyChosen = this.inferWhyChosen(tech.name, tech.category);
      
      coreTechs.push({
        name: tech.name,
        role,
        whyChosen
      });
    });
    
    return coreTechs;
  }

  private inferTechRole(techName: string, category: string): string {
    const name = techName.toLowerCase();
    
    if (category === '言語') {
      return 'メイン実装言語として、プロジェクト全体の基盤を提供';
    }
    
    if (name.includes('react')) return 'ユーザーインターフェースの構築とコンポーネント管理';
    if (name.includes('express')) return 'HTTP サーバーとAPI エンドポイントの実装';
    if (name.includes('typescript')) return '型安全性の確保とコード品質の向上';
    if (name.includes('jest')) return '自動テストとコード品質の継続的検証';
    if (name.includes('webpack')) return 'アセットのビルドとバンドル最適化';
    if (name.includes('docker')) return '環境の標準化とデプロイメントの簡素化';
    
    return `${category}としての機能提供`;
  }

  private inferWhyChosen(techName: string, category: string): string {
    const name = techName.toLowerCase();
    
    if (name.includes('typescript')) return '静的型検査によるバグ削減と開発効率向上のため';
    if (name.includes('react')) return '豊富な生態系と再利用可能なコンポーネント開発のため';
    if (name.includes('express')) return '軽量で柔軟なWeb サーバー構築のため';
    if (name.includes('jest')) return 'JavaScript/TypeScript エコシステムとの親和性のため';
    if (name.includes('webpack')) return 'モダンなフロントエンド開発ワークフローの実現のため';
    if (name.includes('docker')) return '環境依存性の解消と一貫したデプロイメントのため';
    
    return '技術的要件と開発効率のバランスを考慮した選択';
  }

  private analyzeProblemSolvingApproach(techStack: any[], readmeAnalysis: any): any[] {
    const approaches: any[] = [];
    
    // README features から問題解決アプローチを推論
    if (readmeAnalysis.features && readmeAnalysis.features.length > 0) {
      readmeAnalysis.features.slice(0, 3).forEach((feature: string) => {
        approaches.push({
          challenge: `${feature}の実現`,
          solution: `技術的実装による自動化・効率化`,
          implementation: `${techStack[0]?.name || 'プログラム'}を用いた具体的実装`
        });
      });
    }
    
    // Tech stack から典型的なアプローチを推論
    if (approaches.length === 0) {
      const frameworks = techStack.map(t => t.name.toLowerCase());
      
      if (frameworks.includes('api')) {
        approaches.push({
          challenge: 'システム間のデータ連携',
          solution: 'RESTful API による標準化されたインターフェース提供',
          implementation: 'HTTP エンドポイントとJSON データ交換の実装'
        });
      }
      
      if (frameworks.includes('cli')) {
        approaches.push({
          challenge: '手動作業の自動化',
          solution: 'コマンドライン インターフェースによる操作の効率化',
          implementation: 'コマンド引数解析とバッチ処理の実装'
        });
      }
      
      approaches.push({
        challenge: '開発効率と品質の両立',
        solution: '適切な技術選択とツールチェーンの構築',
        implementation: 'モダンな開発手法とベストプラクティスの適用'
      });
    }
    
    return approaches;
  }

  private inferDesignDecisions(techStack: any[], structure: any): any[] {
    const decisions: any[] = [];
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    // TypeScript使用決定
    if (structure.hasTypeScript) {
      decisions.push({
        decision: 'TypeScript の採用',
        rationale: '静的型検査による開発時のバグ削減と IDE サポート向上',
        implications: '学習コストの増加と引き換えに長期的な保守性向上を実現'
      });
    }
    
    // テスト導入決定
    if (structure.hasTests) {
      decisions.push({
        decision: '自動テストの導入',
        rationale: 'コード品質の継続的保証とリファクタリングの安全性確保',
        implications: '初期開発コスト増加だが長期的な安定性と信頼性向上'
      });
    }
    
    // フレームワーク選択
    if (frameworks.includes('react')) {
      decisions.push({
        decision: 'React フレームワークの選択',
        rationale: '豊富な生態系と大規模なコミュニティサポート',
        implications: 'フレームワーク依存性と引き換えに開発効率の大幅向上'
      });
    }
    
    return decisions;
  }

  private analyzeDirectoryStructure(detectedFiles: any[], techStack: any[]): any[] {
    const structure: any[] = [];
    const directories = new Set<string>();
    
    // ファイルパスからディレクトリを抽出
    detectedFiles.forEach(file => {
      const parts = file.path.split('/');
      if (parts.length > 1) {
        directories.add(parts[0]);
      }
    });
    
    // 重要度とpurposeを推論
    Array.from(directories).forEach(dir => {
      const purpose = this.inferDirectoryPurpose(dir, techStack);
      const importance = this.inferDirectoryImportance(dir);
      
      structure.push({
        path: dir,
        purpose,
        importance
      });
    });
    
    // ルートファイルも追加
    const rootFiles = detectedFiles.filter(f => !f.path.includes('/'));
    if (rootFiles.length > 0) {
      structure.unshift({
        path: '/',
        purpose: '設定ファイルとプロジェクトメタデータ',
        importance: 'critical' as const
      });
    }
    
    return structure;
  }

  private inferDirectoryPurpose(dirName: string, techStack: any[]): string {
    const name = dirName.toLowerCase();
    
    if (name === 'src' || name === 'source') return 'メインソースコード';
    if (name === 'lib' || name === 'libs') return 'ライブラリとユーティリティ';
    if (name === 'test' || name === 'tests' || name === '__tests__') return 'テストコード';
    if (name === 'docs' || name === 'doc') return 'ドキュメント';
    if (name === 'public' || name === 'static') return '静的アセット';
    if (name === 'config' || name === 'configs') return '設定ファイル';
    if (name === 'scripts') return 'ビルド・デプロイスクリプト';
    if (name === 'components') return 'UIコンポーネント';
    if (name === 'pages' || name === 'views') return 'ページ・ビューファイル';
    if (name === 'api' || name === 'routes') return 'API エンドポイント';
    if (name === 'utils' || name === 'helpers') return 'ヘルパー関数・ユーティリティ';
    if (name === 'types' || name === 'typings') return '型定義ファイル';
    if (name === 'assets') return 'アセットファイル（画像・CSS等）';
    
    return '特定目的のファイル群';
  }

  private inferDirectoryImportance(dirName: string): 'critical' | 'important' | 'supporting' {
    const name = dirName.toLowerCase();
    
    if (['src', 'source', 'lib', 'api'].includes(name)) return 'critical';
    if (['components', 'pages', 'routes', 'config'].includes(name)) return 'important';
    return 'supporting';
  }

  private identifyCodeOrganization(techStack: any[], structure: any): any {
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    if (frameworks.includes('react')) {
      return {
        pattern: 'コンポーネントベース構成',
        description: '再利用可能なコンポーネント単位でコードを組織化',
        examples: ['components/Button.tsx', 'pages/HomePage.tsx', 'hooks/useAuth.ts']
      };
    }
    
    if (frameworks.includes('express') || frameworks.includes('api')) {
      return {
        pattern: 'MVC (Model-View-Controller) パターン',
        description: 'ビジネスロジック、データ、プレゼンテーション層の分離',
        examples: ['routes/api.js', 'models/User.js', 'controllers/AuthController.js']
      };
    }
    
    if (structure.hasTypeScript) {
      return {
        pattern: 'レイヤードアーキテクチャ',
        description: '機能別・責務別のディレクトリ構成',
        examples: ['src/services/', 'src/types/', 'src/utils/']
      };
    }
    
    return {
      pattern: '機能ベース構成',
      description: '機能単位でファイルを組織化する構成',
      examples: ['feature1/', 'feature2/', 'shared/']
    };
  }

  private identifyKeyComponents(detectedFiles: any[], techStack: any[]): any[] {
    const components: any[] = [];
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    // メインファイルを特定
    const mainFiles = detectedFiles.filter(f => 
      f.path.includes('main') || 
      f.path.includes('index') || 
      f.path.includes('app')
    );
    
    mainFiles.forEach(file => {
      components.push({
        name: file.path.split('/').pop() || file.path,
        location: file.path,
        purpose: 'アプリケーションのエントリーポイント',
        interactions: ['他の全てのコンポーネントを統合']
      });
    });
    
    // API関連ファイル
    if (frameworks.includes('api') || frameworks.includes('express')) {
      const apiFiles = detectedFiles.filter(f => 
        f.path.includes('api') || 
        f.path.includes('route') ||
        f.path.includes('controller')
      );
      
      apiFiles.slice(0, 3).forEach(file => {
        components.push({
          name: file.path.split('/').pop() || file.path,
          location: file.path,
          purpose: 'HTTP リクエストの処理とレスポンス生成',
          interactions: ['データベース', 'ビジネスロジック', 'クライアント']
        });
      });
    }
    
    // Config files
    const configFiles = detectedFiles.filter(f => 
      f.path.includes('config') || 
      f.path.endsWith('.config.js') ||
      f.path.endsWith('package.json')
    );
    
    configFiles.slice(0, 2).forEach(file => {
      components.push({
        name: file.path.split('/').pop() || file.path,
        location: file.path,
        purpose: 'アプリケーション設定とメタデータ',
        interactions: ['ビルドシステム', 'ランタイム環境']
      });
    });
    
    return components;
  }

  private identifyEntryPoints(detectedFiles: any[], techStack: any[], structure: any): any[] {
    const entryPoints: any[] = [];
    
    // Main entry points
    const mainFiles = ['index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts'];
    mainFiles.forEach(fileName => {
      const found = detectedFiles.find(f => f.path.endsWith(fileName));
      if (found) {
        entryPoints.push({
          file: found.path,
          purpose: 'アプリケーションのメインエントリーポイント',
          whenToUse: 'アプリケーション起動時およびコード読解の開始点'
        });
      }
    });
    
    // Package.json scripts
    const packageJson = detectedFiles.find(f => f.path.endsWith('package.json'));
    if (packageJson) {
      entryPoints.push({
        file: 'package.json',
        purpose: 'NPMスクリプトとプロジェクトメタデータ',
        whenToUse: '開発タスクの実行とプロジェクト情報の確認'
      });
    }
    
    // CLI entry points
    const frameworks = techStack.map(t => t.name.toLowerCase());
    if (frameworks.includes('cli')) {
      const binFiles = detectedFiles.filter(f => f.path.includes('bin/') || f.path.includes('cli'));
      binFiles.forEach(file => {
        entryPoints.push({
          file: file.path,
          purpose: 'コマンドライン実行のエントリーポイント',
          whenToUse: 'CLI として実行する場合'
        });
      });
    }
    
    return entryPoints;
  }

  private identifyConfigurationPoints(detectedFiles: any[]): any[] {
    const configPoints: any[] = [];
    
    // Common config files
    const configFiles = [
      { pattern: 'package.json', purpose: 'NPMパッケージとスクリプト設定' },
      { pattern: 'tsconfig.json', purpose: 'TypeScriptコンパイラ設定' },
      { pattern: '.eslintrc', purpose: 'ESLintルール設定' },
      { pattern: 'webpack.config.js', purpose: 'Webpackビルド設定' },
      { pattern: '.env', purpose: '環境変数設定' },
      { pattern: 'docker-compose.yml', purpose: 'Docker環境設定' },
      { pattern: 'next.config.js', purpose: 'Next.js設定' },
      { pattern: 'vite.config.js', purpose: 'Vite設定' }
    ];
    
    configFiles.forEach(({ pattern, purpose }) => {
      const found = detectedFiles.find(f => f.path.includes(pattern));
      if (found) {
        configPoints.push({
          file: found.path,
          purpose,
          customizationOptions: this.getCustomizationOptions(pattern)
        });
      }
    });
    
    return configPoints;
  }

  private getCustomizationOptions(configType: string): string[] {
    switch (configType) {
      case 'package.json':
        return ['スクリプトの追加', '依存関係の管理', 'メタデータの更新'];
      case 'tsconfig.json':
        return ['コンパイラオプション', 'パス設定', '除外ファイル指定'];
      case '.eslintrc':
        return ['ルールの追加・無効化', 'プラグイン設定', '環境設定'];
      case '.env':
        return ['環境変数の追加', 'API キーの設定', 'データベース接続設定'];
      default:
        return ['設定値の調整', 'オプションの追加', '環境固有の設定'];
    }
  }

  private generateLearningPath(techStack: any[], structure: any): any {
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    const beginner = [
      'プロジェクト概要とREADMEの確認',
      'package.jsonや設定ファイルの理解',
      'メインのエントリーポイントファイルの確認'
    ];
    
    const intermediate = [
      '主要なソースコードディレクトリの探索',
      'API エンドポイントやコンポーネントの理解',
      'テストコードの確認と実行'
    ];
    
    const advanced = [
      'アーキテクチャパターンの理解',
      'ビルドプロセスとデプロイメント手順の習得',
      'カスタマイズと拡張方法の学習'
    ];
    
    // Tech stack に応じた調整
    if (frameworks.includes('react')) {
      intermediate.push('React コンポーネントの構造とstate管理の理解');
      advanced.push('React Hook の活用とパフォーマンス最適化');
    }
    
    if (frameworks.includes('typescript')) {
      intermediate.push('TypeScript型定義の理解');
      advanced.push('高度な型システムの活用');
    }
    
    return { beginner, intermediate, advanced };
  }

  private generateCodeReadingGuidance(techStack: any[], structure: any): any {
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    const startHere = [
      'README.md または documentation',
      'package.json (dependencies と scripts)',
      'index.js/ts または main.js/ts (エントリーポイント)'
    ];
    
    const readingOrder = [
      '設定ファイル群の確認',
      'メインアプリケーション・ロジックの理解',
      '個別機能・コンポーネントの詳細確認',
      'テストコードによる使用例の理解'
    ];
    
    const keyFilesToUnderstand = [
      'プロジェクトのエントリーポイント',
      '主要なビジネスロジック実装ファイル',
      '設定とコンフィギュレーションファイル'
    ];
    
    // Tech stack specific guidance
    if (frameworks.includes('react')) {
      readingOrder.push('コンポーネント階層と props の流れの把握');
      keyFilesToUnderstand.push('App.tsx/jsx とルートコンポーネント');
    }
    
    if (frameworks.includes('api')) {
      readingOrder.push('API ルーティングとミドルウェアの確認');
      keyFilesToUnderstand.push('API エンドポイント定義ファイル');
    }
    
    return { startHere, readingOrder, keyFilesToUnderstand };
  }

  private generateCustomizationGuidance(techStack: any[], structure: any): any {
    const commonCustomizations = [
      '設定ファイルの値変更による動作調整',
      '新しい機能・コンポーネントの追加',
      'スタイルやテーマのカスタマイズ'
    ];
    
    const extensionPoints = [
      'プラグインアーキテクチャの活用',
      'コンフィギュレーションベースの機能拡張',
      'Hook やイベントリスナーを使った処理追加'
    ];
    
    const bestPractices = [
      '既存のコード・スタイルとパターンに従う',
      '変更前にテストの実行と動作確認',
      'バックアップとバージョン管理の活用'
    ];
    
    return { commonCustomizations, extensionPoints, bestPractices };
  }

  private identifyCommonIssues(techStack: any[], dependencies: any[]): any[] {
    const issues: any[] = [];
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    // 依存関係の問題
    if (dependencies.length > 50) {
      issues.push({
        issue: '依存関係の競合やバージョン不整合',
        solution: 'npm ls でバージョン確認し、必要に応じて依存関係を更新',
        prevention: '定期的な依存関係のメンテナンスとロックファイルの活用'
      });
    }
    
    // Node.js関連
    if (frameworks.includes('node') || frameworks.includes('npm')) {
      issues.push({
        issue: 'Node.js バージョンの不一致',
        solution: 'nvm や .nvmrc ファイルを使用して適切なバージョンに切り替え',
        prevention: 'プロジェクト固有のNode.jsバージョンの文書化'
      });
    }
    
    // TypeScript関連
    if (frameworks.includes('typescript')) {
      issues.push({
        issue: 'TypeScript型エラーやコンパイルエラー',
        solution: 'tsconfig.json の設定確認と型定義の追加',
        prevention: '段階的な型システムの導入とstrict モードの活用'
      });
    }
    
    return issues;
  }

  private generateFurtherLearning(techStack: any[], readmeAnalysis: any): any {
    const frameworks = techStack.map(t => t.name.toLowerCase());
    
    const relatedConcepts = [
      'ソフトウェアアーキテクチャパターン',
      '継続的インテグレーション・デプロイメント',
      'コード品質とテスト戦略'
    ];
    
    // Tech stack specific concepts
    if (frameworks.includes('react')) {
      relatedConcepts.push('React ecosystem とstate management');
    }
    if (frameworks.includes('typescript')) {
      relatedConcepts.push('Advanced TypeScript patterns');
    }
    if (frameworks.includes('api')) {
      relatedConcepts.push('RESTful API design principles');
    }
    
    const recommendedResources = [
      '公式ドキュメントとAPI リファレンス',
      'GitHub Issues と Discussions',
      '関連技術のベストプラクティスガイド'
    ];
    
    const nextSteps = [
      'プロジェクトへの contribution',
      '類似プロジェクトの調査・比較',
      '学んだパターンの他プロジェクトへの応用'
    ];
    
    return { relatedConcepts, recommendedResources, nextSteps };
  }

  private synthesizePracticalSummary(
    whatAndHow: WhatAndHowAnalysis,
    technicalApproach: TechnicalApproachAnalysis,
    codebaseStructure: CodebaseStructureAnalysis,
    understandingGuidance: UnderstandingGuidanceAnalysis
  ): string {
    return `## 🔧 エンジニア向け実用要約

### このリポジトリの本質
${whatAndHow.purpose}

**コア機能**: ${whatAndHow.coreFunction}

### 実装アプローチ
${technicalApproach.implementationStrategy}

**主要技術**: ${technicalApproach.coreTechnologies.slice(0, 3).map(t => t.name).join(', ')}

### 使い始めるには
**セットアップ**: ${whatAndHow.quickStart.installation.join(' → ')}
**最初のステップ**: ${whatAndHow.quickStart.firstSteps[0] || '基本設定から開始'}

### コードベース構造
**組織化パターン**: ${codebaseStructure.codeOrganization.pattern}
**重要なエントリーポイント**: ${codebaseStructure.entryPoints.slice(0, 2).map(e => e.file).join(', ')}

### 理解のポイント
**学習順序**: ${understandingGuidance.codeReadingGuidance.readingOrder.slice(0, 2).join(' → ')}
**キーファイル**: ${understandingGuidance.codeReadingGuidance.keyFilesToUnderstand.slice(0, 2).join(', ')}

### 実用的価値
このリポジトリは、${whatAndHow.practicalExamples[0]?.scenario || '特定の技術的課題'}の解決に実用的なアプローチを提供し、${technicalApproach.implementationStrategy}による実装を通じて、エンジニアの実際の開発作業に直接活用できる具体的な解決策を提供します。`;
  }
}

// シングルトンインスタンス
export const practicalRepositorySummarizer = new PracticalRepositorySummarizer();