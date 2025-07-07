import { githubContentFetcher } from './github-content-fetcher';

export interface EnhancedReadmeAnalysis {
  // 基本情報
  title: string;
  description: string;
  tagline?: string;
  
  // 機能・特徴
  features: string[];
  keyBenefits: string[];
  useCases: string[];
  
  // 使用方法
  installation: InstallationInfo;
  usage: UsageInfo;
  examples: CodeExample[];
  
  // プロジェクト詳細
  architecture: string[];
  technicalDetails: string[];
  requirements: string[];
  
  // コミュニティ・開発
  contributing: string;
  roadmap: string[];
  
  // 信頼性指標
  badges: BadgeInfo[];
  
  // 構造化された内容
  structuredSections: Record<string, string>;
}

interface InstallationInfo {
  npm?: string;
  yarn?: string;
  pip?: string;
  cargo?: string;
  go?: string;
  manual?: string;
  docker?: string;
  prerequisites?: string[];
}

interface UsageInfo {
  basicUsage: string;
  apiReference?: string;
  configuration?: string;
  advancedUsage?: string;
}

interface CodeExample {
  language: string;
  title: string;
  code: string;
  description?: string;
}

interface BadgeInfo {
  type: string;
  value: string;
  url?: string;
}

export class EnhancedReadmeAnalyzer {
  
  /**
   * README内容を包括的に分析
   */
  analyzeReadme(readmeContent: string): EnhancedReadmeAnalysis {
    const lines = readmeContent.split('\n');
    
    // セクション分割
    const sections = this.extractSections(lines);
    
    // 基本情報抽出
    const basicInfo = this.extractBasicInfo(lines, sections);
    
    // 機能・特徴抽出
    const features = this.extractFeatures(sections);
    
    // インストール情報抽出
    const installation = this.extractInstallationInfo(sections);
    
    // 使用方法抽出
    const usage = this.extractUsageInfo(sections);
    
    // コード例抽出
    const examples = this.extractCodeExamples(lines);
    
    // 技術詳細抽出
    const technicalDetails = this.extractTechnicalDetails(sections);
    
    // バッジ情報抽出
    const badges = this.extractBadges(lines);
    
    // ロードマップ抽出
    const roadmap = this.extractRoadmap(sections);

    return {
      ...basicInfo,
      features: features.features,
      keyBenefits: features.benefits,
      useCases: features.useCases,
      installation,
      usage,
      examples,
      architecture: technicalDetails.architecture,
      technicalDetails: technicalDetails.details,
      requirements: technicalDetails.requirements,
      contributing: sections['contributing'] || sections['development'] || '',
      roadmap,
      badges,
      structuredSections: sections
    };
  }

  /**
   * READMEをセクションごとに分割
   */
  private extractSections(lines: string[]): Record<string, string> {
    const sections: Record<string, string> = {};
    let currentSection = 'intro';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // ヘッダー検出 (# ## ### #### ##### ######)
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        // 前のセクションを保存
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
          currentContent = [];
        }
        
        // 新しいセクションを開始
        const sectionTitle = headerMatch[2].toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '_');
        currentSection = sectionTitle;
        continue;
      }

      currentContent.push(line);
    }

    // 最後のセクションを保存
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * 基本情報（タイトル、説明）を抽出 - 改善版
   */
  private extractBasicInfo(lines: string[], sections: Record<string, string>) {
    let title = '';
    let description = '';
    let tagline = '';

    console.log('📋 README Basic Info Extraction:', {
      totalLines: lines.length,
      sections: Object.keys(sections),
      introLength: sections.intro?.length || 0
    });

    // タイトル抽出（最初のH1または大きなヘッダー）
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        title = trimmed
          .replace(/^# /, '') // H1マーカー削除
          .replace(/[*_`]/g, '') // Markdownスタイル削除
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンクをテキストに変換
          .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 画像削除
          .replace(/\s+/g, ' ') // 複数スペースを単一に
          .trim();
        
        // 有効なタイトルかチェック
        if (title.length > 0 && title.length < 100 && !title.includes('|')) {
          break;
        } else {
          title = ''; // 無効なタイトルはリセット
        }
      }
    }

    // より詳細な説明抽出（intro セクションから）
    if (sections.intro) {
      const introLines = sections.intro.split('\n');
      const descriptionCandidates: string[] = [];
      
      for (const line of introLines) {
        const trimmed = line.trim();
        if (trimmed && 
            !trimmed.startsWith('#') && 
            !trimmed.startsWith('!') &&
            !trimmed.startsWith('[![') &&
            !trimmed.startsWith('[!') &&
            trimmed.length > 10) {
          // バッジやリンクを除外し、より厳密にフィルタ
          if (!this.isBadgeLine(trimmed) && 
              !this.isImageLine(trimmed) &&
              !this.isLinkLine(trimmed)) {
            descriptionCandidates.push(trimmed);
          }
        }
      }
      
      if (descriptionCandidates.length > 0) {
        // より有用な文を優先選択
        const meaningfulSentences = descriptionCandidates
          .filter(sent => this.isMeaningfulSentence(sent))
          .slice(0, 3);
        
        if (meaningfulSentences.length > 0) {
          description = meaningfulSentences.join(' ').substring(0, 500);
        } else {
          description = descriptionCandidates.slice(0, 2).join(' ').substring(0, 500);
        }
      }
    }

    // About、Description、Overview セクションからも説明を補完
    const aboutSections = ['about', 'description', 'overview', 'what_is', 'what_it_does', 'summary'];
    for (const sectionKey of aboutSections) {
      if (sections[sectionKey] && sections[sectionKey].length > description.length) {
        const aboutText = sections[sectionKey]
          .replace(/[#*_`]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
          .trim();
        if (aboutText.length > 50 && this.isMeaningfulDescription(aboutText)) {
          description = aboutText.substring(0, 500);
          break;
        }
      }
    }

    // タグライン抽出（短くて印象的な説明を探す）
    if (!tagline && sections.intro) {
      const shortLines = sections.intro.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 10 && l.length < 100 && !l.startsWith('#'));
      
      for (const line of shortLines) {
        if (this.looksLikeTagline(line)) {
          tagline = line;
          break;
        }
      }
    }

    console.log('📋 Extracted basic info:', { title, descriptionLength: description.length, tagline });
    return { title, description, tagline };
  }

  /**
   * 有意味な文章かどうかを判定
   */
  private isMeaningfulSentence(sentence: string): boolean {
    const lowerSentence = sentence.toLowerCase();
    // 技術的な内容や目的を説明している文章を優先
    const meaningfulKeywords = [
      'tool', 'library', 'framework', 'application', 'service', 'api',
      'help', 'provide', 'enable', 'support', 'manage', 'create',
      'build', 'generate', 'process', 'handle', 'implement', 'develop',
      'designed', 'used for', 'allows', 'features', 'includes'
    ];
    
    return meaningfulKeywords.some(keyword => lowerSentence.includes(keyword));
  }

  /**
   * 有意味な説明文かどうかを判定
   */
  private isMeaningfulDescription(text: string): boolean {
    // 一般的すぎるフレーズを除外
    const genericPhrases = [
      'this is a',
      'simple',
      'basic',
      'example',
      'demo',
      'test',
      'sample'
    ];
    
    const lowerText = text.toLowerCase();
    return !genericPhrases.some(phrase => lowerText.startsWith(phrase));
  }

  /**
   * タグラインっぽい文章かどうかを判定
   */
  private looksLikeTagline(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return (
      (lowerLine.includes('a ') || lowerLine.includes('an ')) &&
      (lowerLine.includes('for') || lowerLine.includes('to')) &&
      line.length < 80
    );
  }

  /**
   * リンク行かどうかを判定
   */
  private isLinkLine(line: string): boolean {
    return line.includes('](') || line.startsWith('http') || line.includes('<a ');
  }

  /**
   * 機能と特徴を抽出 - 改善版
   */
  private extractFeatures(sections: Record<string, string>) {
    const features: string[] = [];
    const benefits: string[] = [];
    const useCases: string[] = [];

    console.log('🔧 Feature extraction from sections:', Object.keys(sections));

    // より包括的な機能関連セクションを探す
    const featureSections = [
      'features', 'capabilities', 'what_it_does', 'key_features', 'highlights',
      'functionality', 'core_features', 'main_features', 'overview',
      'what_does_it_do', 'functionality', 'components'
    ];
    const benefitSections = [
      'benefits', 'why_use', 'advantages', 'value_proposition',
      'pros', 'strengths', 'benefits_of_using', 'why_choose'
    ];
    const useCaseSections = [
      'use_cases', 'examples', 'scenarios', 'when_to_use',
      'usage_examples', 'real_world_examples', 'applications',
      'use_scenarios', 'common_uses'
    ];

    // 機能抽出（改善版）
    for (const sectionKey of featureSections) {
      if (sections[sectionKey]) {
        const extracted = this.extractListItems(sections[sectionKey]);
        if (extracted.length > 0) {
          console.log(`📋 Found ${extracted.length} features in ${sectionKey}:`, extracted.slice(0, 3));
          features.push(...extracted);
        }
      }
    }

    // 利点抽出
    for (const sectionKey of benefitSections) {
      if (sections[sectionKey]) {
        const extracted = this.extractListItems(sections[sectionKey]);
        benefits.push(...extracted);
      }
    }

    // 使用例抽出
    for (const sectionKey of useCaseSections) {
      if (sections[sectionKey]) {
        const extracted = this.extractListItems(sections[sectionKey]);
        useCases.push(...extracted);
      }
    }

    // リストが見つからない場合、より積極的に段落から抽出
    if (features.length === 0) {
      console.log('🔍 No explicit features found, extracting from content...');
      features.push(...this.extractKeyPhrases(sections));
      features.push(...this.extractImplicitFeatures(sections));
    }

    // useCasesが空の場合、featuresから推論
    if (useCases.length === 0 && features.length > 0) {
      useCases.push(...this.inferUseCasesFromFeatures(features));
    }

    console.log('🔧 Final extraction results:', {
      features: features.length,
      benefits: benefits.length,
      useCases: useCases.length
    });

    return { features, benefits, useCases };
  }

  /**
   * コンテンツから暗黙的な機能を抽出
   */
  private extractImplicitFeatures(sections: Record<string, string>): string[] {
    const implicitFeatures: string[] = [];
    
    // 技術キーワードから機能を推論
    const allContent = Object.values(sections).join(' ').toLowerCase();
    
    if (allContent.includes('api') && allContent.includes('rest')) {
      implicitFeatures.push('RESTful API endpoints providing data access and manipulation');
    }
    if (allContent.includes('cli') || allContent.includes('command line')) {
      implicitFeatures.push('Command-line interface for automation and scripting');
    }
    if (allContent.includes('web') && allContent.includes('app')) {
      implicitFeatures.push('Web-based user interface for interactive operations');
    }
    if (allContent.includes('docker') || allContent.includes('container')) {
      implicitFeatures.push('Containerized deployment for consistent environments');
    }
    if (allContent.includes('test') && allContent.includes('coverage')) {
      implicitFeatures.push('Comprehensive testing suite with coverage reporting');
    }
    
    return implicitFeatures;
  }

  /**
   * 機能から使用例を推論
   */
  private inferUseCasesFromFeatures(features: string[]): string[] {
    const useCases: string[] = [];
    
    features.forEach(feature => {
      const lowerFeature = feature.toLowerCase();
      
      if (lowerFeature.includes('api')) {
        useCases.push('Integration with third-party applications and services');
      }
      if (lowerFeature.includes('automation') || lowerFeature.includes('cli')) {
        useCases.push('Workflow automation and batch processing');
      }
      if (lowerFeature.includes('web') || lowerFeature.includes('ui')) {
        useCases.push('Interactive web-based operations and management');
      }
      if (lowerFeature.includes('data') || lowerFeature.includes('process')) {
        useCases.push('Data processing and analysis workflows');
      }
    });
    
    return [...new Set(useCases)]; // Remove duplicates
  }

  /**
   * インストール情報を抽出 - 改善版
   */
  private extractInstallationInfo(sections: Record<string, string>): InstallationInfo {
    const installation: InstallationInfo = {};
    
    console.log('🚀 Extracting installation info from sections:', Object.keys(sections));
    
    const installSections = [
      'installation', 'install', 'getting_started', 'setup', 'quick_start',
      'quickstart', 'how_to_install', 'requirements', 'dependencies'
    ];
    
    for (const sectionKey of installSections) {
      if (sections[sectionKey]) {
        const content = sections[sectionKey];
        
        console.log(`📦 Processing ${sectionKey} section (${content.length} chars)`);
        
        // より柔軟なパターンマッチング
        
        // npm (より包括的)
        const npmMatches = [
          /npm\s+install\s+([^\s\n`]+)/gi,
          /npm\s+i\s+([^\s\n`]+)/gi,
          /`npm\s+install\s+([^`]+)`/gi
        ];
        for (const pattern of npmMatches) {
          const match = content.match(pattern);
          if (match && !installation.npm) {
            installation.npm = match[0].replace(/`/g, '').trim();
            break;
          }
        }
        
        // yarn
        const yarnMatches = [
          /yarn\s+add\s+([^\s\n`]+)/gi,
          /`yarn\s+add\s+([^`]+)`/gi
        ];
        for (const pattern of yarnMatches) {
          const match = content.match(pattern);
          if (match && !installation.yarn) {
            installation.yarn = match[0].replace(/`/g, '').trim();
            break;
          }
        }
        
        // pip
        const pipMatches = [
          /pip\s+install\s+([^\s\n`]+)/gi,
          /pip3\s+install\s+([^\s\n`]+)/gi,
          /`pip\s+install\s+([^`]+)`/gi
        ];
        for (const pattern of pipMatches) {
          const match = content.match(pattern);
          if (match && !installation.pip) {
            installation.pip = match[0].replace(/`/g, '').trim();
            break;
          }
        }
        
        // cargo
        const cargoMatch = content.match(/cargo\s+install\s+([^\s\n`]+)/i);
        if (cargoMatch && !installation.cargo) {
          installation.cargo = cargoMatch[0].replace(/`/g, '').trim();
        }
        
        // go
        const goMatches = [
          /go\s+get\s+([^\s\n`]+)/gi,
          /go\s+install\s+([^\s\n`]+)/gi
        ];
        for (const pattern of goMatches) {
          const match = content.match(pattern);
          if (match && !installation.go) {
            installation.go = match[0].replace(/`/g, '').trim();
            break;
          }
        }
        
        // docker
        const dockerMatches = [
          /docker\s+(run|pull)\s+([^\s\n`]+)/gi,
          /`docker\s+(run|pull)\s+([^`]+)`/gi
        ];
        for (const pattern of dockerMatches) {
          const match = content.match(pattern);
          if (match && !installation.docker) {
            installation.docker = match[0].replace(/`/g, '').trim();
            break;
          }
        }
        
        // Manual installation
        if (content.toLowerCase().includes('download') || content.toLowerCase().includes('binary')) {
          const manualLines = content.split('\n')
            .filter(line => 
              line.toLowerCase().includes('download') || 
              line.toLowerCase().includes('binary') ||
              line.toLowerCase().includes('release')
            )
            .slice(0, 2);
          if (manualLines.length > 0 && !installation.manual) {
            installation.manual = manualLines.join('; ').trim();
          }
        }
        
        // より包括的な前提条件
        const prereqPatterns = [
          'require', 'prerequisite', 'dependency', 'need', 'must have',
          'before installing', 'system requirement', 'minimum requirement'
        ];
        
        const prereqLines = content.split('\n').filter(line => {
          const lowerLine = line.toLowerCase();
          return prereqPatterns.some(pattern => lowerLine.includes(pattern)) &&
                 line.trim().length > 10 &&
                 !line.includes('```'); // コードブロックを除外
        });
        
        if (prereqLines.length > 0 && !installation.prerequisites) {
          installation.prerequisites = prereqLines
            .map(line => line.trim().replace(/^[-*+]\s*/, ''))
            .slice(0, 5); // 最大5個
        }
      }
    }

    console.log('🚀 Installation info extracted:', {
      npm: !!installation.npm,
      pip: !!installation.pip,
      docker: !!installation.docker,
      prerequisites: installation.prerequisites?.length || 0
    });

    return installation;
  }

  /**
   * 使用方法を抽出 - 改善版
   */
  private extractUsageInfo(sections: Record<string, string>): UsageInfo {
    const usage: UsageInfo = { basicUsage: '' };
    
    console.log('💡 Extracting usage info from sections:', Object.keys(sections));
    
    const usageSections = [
      'usage', 'how_to_use', 'examples', 'basic_usage', 'quick_start',
      'quickstart', 'getting_started', 'tutorial', 'guide', 'walkthrough'
    ];
    const apiSections = [
      'api', 'api_reference', 'methods', 'functions', 'endpoints',
      'api_documentation', 'reference', 'api_guide'
    ];
    const configSections = [
      'configuration', 'config', 'settings', 'options', 'parameters',
      'environment', 'setup', 'customization'
    ];
    
    // 基本使用方法（より詳細に）
    for (const sectionKey of usageSections) {
      if (sections[sectionKey] && sections[sectionKey].trim().length > 50) {
        const content = sections[sectionKey];
        
        // コードブロックとテキストを分離して、より有用な情報を抽出
        const cleanedContent = this.extractMeaningfulUsage(content);
        if (cleanedContent.length > 20) {
          usage.basicUsage = cleanedContent.substring(0, 1000);
          console.log(`💡 Found basic usage in ${sectionKey} (${cleanedContent.length} chars)`);
          break;
        }
      }
    }
    
    // API リファレンス
    for (const sectionKey of apiSections) {
      if (sections[sectionKey] && sections[sectionKey].trim().length > 50) {
        const content = this.extractMeaningfulUsage(sections[sectionKey]);
        if (content.length > 20) {
          usage.apiReference = content.substring(0, 1000);
          break;
        }
      }
    }
    
    // 設定
    for (const sectionKey of configSections) {
      if (sections[sectionKey] && sections[sectionKey].trim().length > 50) {
        const content = this.extractMeaningfulUsage(sections[sectionKey]);
        if (content.length > 20) {
          usage.configuration = content.substring(0, 1000);
          break;
        }
      }
    }

    // 高度な使用法を探す
    const advancedSections = ['advanced', 'advanced_usage', 'complex_examples', 'advanced_guide'];
    for (const sectionKey of advancedSections) {
      if (sections[sectionKey] && sections[sectionKey].trim().length > 50) {
        const content = this.extractMeaningfulUsage(sections[sectionKey]);
        if (content.length > 20) {
          usage.advancedUsage = content.substring(0, 1000);
          break;
        }
      }
    }

    console.log('💡 Usage info extracted:', {
      basicUsage: usage.basicUsage.length,
      apiReference: usage.apiReference?.length || 0,
      configuration: usage.configuration?.length || 0,
      advancedUsage: usage.advancedUsage?.length || 0
    });

    return usage;
  }

  /**
   * 有意味な使用法情報を抽出
   */
  private extractMeaningfulUsage(content: string): string {
    // マークダウンのコードブロックやリンクを除去し、説明文を抽出
    const lines = content.split('\n');
    const meaningfulLines: string[] = [];
    
    let inCodeBlock = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // コードブロックの開始/終了を検出
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && meaningfulLines.length === 0) {
          // コードブロックの後に説明がある場合は、簡潔なコード例として保持
          meaningfulLines.push('Code example available');
        }
        continue;
      }
      
      // コードブロック内はスキップ
      if (inCodeBlock) continue;
      
      // 有意味な説明行を抽出
      if (trimmed.length > 10 && 
          !this.isBadgeLine(trimmed) && 
          !this.isImageLine(trimmed) &&
          !this.isLinkLine(trimmed) &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('- [')) {
        meaningfulLines.push(trimmed);
      }
    }
    
    return meaningfulLines.join(' ').substring(0, 800);
  }

  /**
   * コード例を抽出
   */
  private extractCodeExamples(lines: string[]): CodeExample[] {
    const examples: CodeExample[] = [];
    let inCodeBlock = false;
    let currentCode: string[] = [];
    let currentLanguage = '';
    let currentTitle = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // コードブロック開始
      const codeBlockMatch = line.match(/^```(\w+)?/);
      if (codeBlockMatch) {
        if (inCodeBlock) {
          // コードブロック終了
          if (currentCode.length > 0) {
            examples.push({
              language: currentLanguage || 'text',
              title: currentTitle || `Example ${examples.length + 1}`,
              code: currentCode.join('\n'),
              description: ''
            });
          }
          currentCode = [];
          currentLanguage = '';
          currentTitle = '';
          inCodeBlock = false;
        } else {
          // コードブロック開始
          inCodeBlock = true;
          currentLanguage = codeBlockMatch[1] || '';
          // 前の行からタイトルを取得
          if (i > 0) {
            const prevLine = lines[i - 1].trim();
            if (prevLine && !prevLine.startsWith('```')) {
              currentTitle = prevLine.replace(/[#*]/g, '').trim();
            }
          }
        }
        continue;
      }

      if (inCodeBlock) {
        currentCode.push(line);
      }
    }

    return examples.slice(0, 10); // 最大10個のサンプル
  }

  /**
   * 技術詳細を抽出
   */
  private extractTechnicalDetails(sections: Record<string, string>) {
    const architecture: string[] = [];
    const details: string[] = [];
    const requirements: string[] = [];

    const archSections = ['architecture', 'design', 'structure', 'how_it_works', 'implementation'];
    const techSections = ['technical_details', 'internals', 'algorithm', 'approach'];
    const reqSections = ['requirements', 'dependencies', 'prerequisites', 'system_requirements'];

    // アーキテクチャ
    for (const sectionKey of archSections) {
      if (sections[sectionKey]) {
        architecture.push(...this.extractListItems(sections[sectionKey]));
      }
    }

    // 技術詳細
    for (const sectionKey of techSections) {
      if (sections[sectionKey]) {
        details.push(...this.extractListItems(sections[sectionKey]));
      }
    }

    // 要件
    for (const sectionKey of reqSections) {
      if (sections[sectionKey]) {
        requirements.push(...this.extractListItems(sections[sectionKey]));
      }
    }

    return { architecture, details, requirements };
  }

  /**
   * バッジ情報を抽出 - 改善版
   */
  private extractBadges(lines: string[]): BadgeInfo[] {
    const badges: BadgeInfo[] = [];
    
    console.log('🏷️ Extracting badges from', lines.length, 'lines');
    
    for (const line of lines) {
      // ![badge](url) 形式（より包括的）
      const badgeMatches = line.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g);
      for (const match of badgeMatches) {
        const [, alt, url] = match;
        if (this.isBadgeUrl(url)) {
          badges.push({
            type: this.determineBadgeType(alt, url),
            value: alt || 'Badge',
            url: url
          });
        }
      }
      
      // HTML形式のバッジも検出
      const htmlBadgeMatches = line.matchAll(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/g);
      for (const match of htmlBadgeMatches) {
        const [, url, alt] = match;
        if (this.isBadgeUrl(url)) {
          badges.push({
            type: this.determineBadgeType(alt, url),
            value: alt || 'Badge',
            url: url
          });
        }
      }
    }

    console.log('🏷️ Found', badges.length, 'badges');
    return badges;
  }

  /**
   * バッジURLかどうかを判定
   */
  private isBadgeUrl(url: string): boolean {
    const badgeIndicators = [
      'shield', 'badge', 'travis', 'ci', 'codecov', 'coveralls',
      'npm', 'pypi', 'maven', 'nuget', 'packagist',
      'github.com/badges', 'img.shields.io', 'badgen.net',
      'circleci', 'appveyor', 'jenkins'
    ];
    
    return badgeIndicators.some(indicator => url.toLowerCase().includes(indicator));
  }

  /**
   * ロードマップを抽出 - 改善版
   */
  private extractRoadmap(sections: Record<string, string>): string[] {
    const roadmapSections = [
      'roadmap', 'todo', 'future', 'planned_features', 'upcoming',
      'future_plans', 'whats_next', 'coming_soon', 'development_plan',
      'milestones', 'goals', 'next_steps'
    ];
    
    console.log('🗺️ Looking for roadmap in sections:', Object.keys(sections));
    
    for (const sectionKey of roadmapSections) {
      if (sections[sectionKey]) {
        const items = this.extractListItems(sections[sectionKey]);
        if (items.length > 0) {
          console.log(`🗺️ Found ${items.length} roadmap items in ${sectionKey}`);
          return items;
        }
      }
    }

    // CHANGELOGやRELEASESセクションから将来の計画を推論
    const futureSections = ['changelog', 'releases', 'versions'];
    for (const sectionKey of futureSections) {
      if (sections[sectionKey]) {
        const content = sections[sectionKey].toLowerCase();
        if (content.includes('upcoming') || content.includes('planned') || content.includes('next')) {
          return this.extractListItems(sections[sectionKey]).slice(0, 5);
        }
      }
    }

    return [];
  }

  // ヘルパーメソッド - 改善版
  private extractListItems(content: string): string[] {
    const items: string[] = [];
    const lines = content.split('\n');
    
    console.log('📝 Extracting list items from', lines.length, 'lines');
    
    let inCodeBlock = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // コードブロックをスキップ
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      
      // より包括的なリストアイテム検出
      const listPatterns = [
        /^[-*+]\s+(.+)$/,     // - * + リスト
        /^\d+\.\s+(.+)$/,     // 番号付きリスト
        /^\s*[\-\*\+]\s+(.+)$/, // インデントされたリスト
        /^\s*\d+\.\s+(.+)$/   // インデントされた番号付きリスト
      ];
      
      for (const pattern of listPatterns) {
        const match = trimmed.match(pattern);
        if (match) {
          const item = match[1]
            .replace(/[*_`]/g, '')  // マークダウンフォーマット除去
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンクテキスト抽出
            .trim();
          
          if (item.length > 5 && item.length < 200 && !this.isCodeSnippet(item)) {
            items.push(item);
          }
          break;
        }
      }
      
      // checkbox リストも検出
      const checkboxMatch = trimmed.match(/^\s*-\s*\[[ x]\]\s+(.+)$/);
      if (checkboxMatch) {
        const item = checkboxMatch[1].trim();
        if (item.length > 5 && item.length < 200) {
          items.push(item);
        }
      }
    }
    
    console.log('📝 Extracted', items.length, 'list items');
    return items;
  }

  /**
   * コードスニペットかどうかを判定
   */
  private isCodeSnippet(text: string): boolean {
    const codeIndicators = [
      '()', '{', '}', '=>', 'function', 'const', 'let', 'var',
      'import', 'export', 'class', 'def ', 'return '
    ];
    
    return codeIndicators.some(indicator => text.includes(indicator));
  }

  private extractKeyPhrases(sections: Record<string, string>): string[] {
    const phrases: string[] = [];
    const content = Object.values(sections).join(' ');
    
    console.log('🔑 Extracting key phrases from content length:', content.length);
    
    // より包括的な技術キーワードを含む文を抽出
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 20);
    const techKeywords = [
      // Core functionality
      'API', 'framework', 'library', 'tool', 'service', 'platform', 'application',
      // Actions
      'support', 'provide', 'enable', 'allow', 'help', 'manage', 'handle',
      'create', 'build', 'develop', 'integrate', 'automate', 'generate',
      'process', 'analyze', 'monitor', 'deploy', 'configure', 'optimize',
      // Technical concepts
      'server', 'client', 'database', 'authentication', 'security',
      'performance', 'scalability', 'testing', 'deployment', 'CI/CD'
    ];
    
    const meaningfulSentences: string[] = [];
    
    for (const sentence of sentences.slice(0, 15)) {
      const trimmed = sentence.trim();
      if (techKeywords.some(keyword => trimmed.toLowerCase().includes(keyword.toLowerCase()))) {
        // より意味のある文章を選別
        if (this.isDescriptiveSentence(trimmed)) {
          meaningfulSentences.push(trimmed.substring(0, 150));
        }
      }
    }
    
    // 重複を除去し、最も有用な文章を選択
    const uniquePhrases = [...new Set(meaningfulSentences)];
    phrases.push(...uniquePhrases.slice(0, 5));
    
    console.log('🔑 Extracted key phrases:', phrases.length);
    return phrases;
  }

  /**
   * 説明的な文章かどうかを判定
   */
  private isDescriptiveSentence(sentence: string): boolean {
    const lower = sentence.toLowerCase();
    
    // 避けるべきパターン
    const avoidPatterns = [
      'see also', 'for more', 'click here', 'read more',
      'example:', 'note:', 'warning:', 'tip:',
      'install', 'run', 'execute', 'download'
    ];
    
    if (avoidPatterns.some(pattern => lower.includes(pattern))) {
      return false;
    }
    
    // 望ましいパターン
    const desiredPatterns = [
      'is a', 'provides', 'enables', 'supports', 'helps',
      'designed to', 'used for', 'allows you to', 'built for'
    ];
    
    return desiredPatterns.some(pattern => lower.includes(pattern)) || 
           (sentence.length > 40 && sentence.length < 150);
  }

  private isBadgeLine(line: string): boolean {
    return (line.includes('![') || line.includes('<img')) && (
      line.includes('shield') || 
      line.includes('badge') || 
      line.includes('travis') ||
      line.includes('ci') ||
      line.includes('npm') ||
      line.includes('pypi') ||
      line.includes('codecov') ||
      line.includes('img.shields.io') ||
      line.includes('badgen.net')
    );
  }

  private isImageLine(line: string): boolean {
    return line.includes('![') && (
      line.includes('.png') ||
      line.includes('.jpg') ||
      line.includes('.gif') ||
      line.includes('.svg')
    );
  }

  private determineBadgeType(alt: string, url: string): string {
    const altLower = alt.toLowerCase();
    const urlLower = url.toLowerCase();
    
    // より詳細なバッジタイプ分類
    if (altLower.includes('npm') || urlLower.includes('npm')) return 'npm';
    if (altLower.includes('pypi') || urlLower.includes('pypi')) return 'pypi';
    if (altLower.includes('version') || urlLower.includes('version')) return 'version';
    if (altLower.includes('build') || altLower.includes('ci') || urlLower.includes('travis') || urlLower.includes('circleci')) return 'build';
    if (altLower.includes('coverage') || urlLower.includes('codecov') || urlLower.includes('coveralls')) return 'coverage';
    if (altLower.includes('license') || urlLower.includes('license')) return 'license';
    if (altLower.includes('download') || altLower.includes('install')) return 'downloads';
    if (altLower.includes('star') || altLower.includes('github')) return 'github';
    if (altLower.includes('docker') || urlLower.includes('docker')) return 'docker';
    if (altLower.includes('security') || urlLower.includes('security')) return 'security';
    if (altLower.includes('quality') || urlLower.includes('quality') || urlLower.includes('codacy')) return 'quality';
    
    return 'other';
  }
}

// シングルトンインスタンス
export const enhancedReadmeAnalyzer = new EnhancedReadmeAnalyzer();