/**
 * Enhanced README Intelligence Extractor for ZIP-based Analysis
 * READMEコンテンツから詳細で実用的な情報を抽出
 */

export interface EnhancedReadmeAnalysis {
  // 基本情報
  title: string;
  description: string;
  purpose: string;
  category: string;
  
  // 機能・特徴
  features: string[];
  keyBenefits: string[];
  useCases: string[];
  
  // 技術情報
  technologies: string[];
  requirements: string[];
  installation: {
    steps: string[];
    commands: string[];
    notes: string[];
  };
  
  // 使用方法
  usage: {
    basicUsage: string;
    examples: string[];
    codeSnippets: string[];
  };
  
  // プロジェクト情報
  projectType: string;
  targetAudience: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  
  // 品質指標
  analysisQuality: number; // 0-100
  detectedPatterns: string[];
}

export class EnhancedReadmeIntelligenceExtractor {
  
  /**
   * README内容から包括的な情報を抽出
   */
  extractIntelligence(readmeContent: string): EnhancedReadmeAnalysis {
    console.log('🧠 Starting enhanced README intelligence extraction...');
    
    // マークダウンパースとセクション分析
    const sections = this.parseMarkdownSections(readmeContent);
    const cleanedContent = this.cleanContent(readmeContent);
    
    // 各要素を抽出
    const analysis: EnhancedReadmeAnalysis = {
      title: this.extractTitle(sections, cleanedContent),
      description: this.extractDescription(sections, cleanedContent),
      purpose: this.extractPurpose(sections, cleanedContent),
      category: this.inferCategory(sections, cleanedContent),
      
      features: this.extractFeatures(sections, cleanedContent),
      keyBenefits: this.extractBenefits(sections, cleanedContent),
      useCases: this.extractUseCases(sections, cleanedContent),
      
      technologies: this.extractTechnologies(sections, cleanedContent),
      requirements: this.extractRequirements(sections, cleanedContent),
      installation: this.extractInstallation(sections, cleanedContent),
      
      usage: this.extractUsage(sections, cleanedContent),
      
      projectType: this.inferProjectType(sections, cleanedContent),
      targetAudience: this.extractTargetAudience(sections, cleanedContent),
      complexity: this.assessComplexity(sections, cleanedContent),
      
      analysisQuality: this.calculateQualityScore(sections, cleanedContent),
      detectedPatterns: this.detectPatterns(sections, cleanedContent)
    };
    
    console.log(`✅ README intelligence extracted - Quality: ${analysis.analysisQuality}%`);
    
    return analysis;
  }
  
  /**
   * マークダウンをセクションごとに分解
   */
  private parseMarkdownSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = 'intro';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      const headerMatch = line.match(/^#+\s*(.+)/);
      if (headerMatch) {
        // 前のセクションを保存
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        
        // 新しいセクション開始
        currentSection = headerMatch[1].toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '_');
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    // 最後のセクション
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }
    
    return sections;
  }
  
  /**
   * コンテンツクリーニング
   */
  private cleanContent(content: string): string {
    return content
      .replace(/!\[.*?\]\(.*?\)/g, '') // 画像除去
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // リンクテキスト化
      .replace(/`([^`]+)`/g, '$1') // インラインコード
      .replace(/```[\s\S]*?```/g, '') // コードブロック除去
      .replace(/\*\*(.*?)\*\*/g, '$1') // ボールド除去
      .replace(/\*(.*?)\*/g, '$1') // イタリック除去
      .replace(/\n\s*\n/g, '\n') // 空行整理
      .trim();
  }
  
  /**
   * タイトル抽出
   */
  private extractTitle(sections: Record<string, string>, content: string): string {
    // 最初のH1ヘッダーを探す
    const firstH1 = content.match(/^#\s+(.+)/m);
    if (firstH1) {
      return firstH1[1].trim();
    }
    
    // セクションから推測
    const titleCandidates = Object.keys(sections).filter(key => 
      key.includes('title') || key.includes('name')
    );
    
    return titleCandidates.length > 0 ? sections[titleCandidates[0]] : 'Unknown Project';
  }
  
  /**
   * 説明抽出
   */
  private extractDescription(sections: Record<string, string>, content: string): string {
    // intro, description, about セクションを探す
    const descSections = ['intro', 'description', 'about', 'overview'];
    
    for (const sectionName of descSections) {
      if (sections[sectionName]) {
        const lines = sections[sectionName].split('\n');
        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.length > 30 && this.isValidDescription(cleanLine)) {
            return cleanLine;
          }
        }
      }
    }
    
    // 最初の有効な段落を抽出
    const lines = content.split('\n');
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length > 30 && 
          !cleanLine.startsWith('#') && 
          this.isValidDescription(cleanLine)) {
        return cleanLine;
      }
    }
    
    return 'No description available';
  }
  
  /**
   * 有効な説明文かどうかを判定
   */
  private isValidDescription(text: string): boolean {
    // 除外すべきパターン
    const excludePatterns = [
      /^\[.*\]\(.*\)/, // リンクのみの行
      /^!\[.*\]/, // 画像のみの行
      /^```/, // コードブロック
      /^\s*[-*+]\s/, // リスト項目
      /^\s*\d+\.\s/, // 番号付きリスト
      /^\s*\|/, // テーブル
      /^https?:\/\//, // URL
      /^#{1,6}\s/, // ヘッダー
      /^\s*$/, // 空行
    ];
    
    // 有効でないパターンをチェック
    for (const pattern of excludePatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }
    
    // 文として成立しているかチェック
    const wordCount = text.split(/\s+/).length;
    return wordCount >= 4; // 最低4単語以上
  }
  
  /**
   * 目的・用途抽出
   */
  private extractPurpose(sections: Record<string, string>, content: string): string {
    // 特定のキーワードを含む文を探す
    const purposeKeywords = [
      'is a', 'provides', 'enables', 'allows', 'helps', 'designed to',
      'built for', 'used to', 'purpose', 'goal', 'objective'
    ];
    
    const sentences = content.split(/[.!?]/).map(s => s.trim());
    
    for (const sentence of sentences) {
      for (const keyword of purposeKeywords) {
        if (sentence.toLowerCase().includes(keyword) && sentence.length > 30) {
          return sentence + '.';
        }
      }
    }
    
    return this.extractDescription(sections, content);
  }
  
  /**
   * カテゴリ推論
   */
  private inferCategory(sections: Record<string, string>, content: string): string {
    const lowerContent = content.toLowerCase();
    
    // パターンマッチング
    const patterns = {
      'MCP Server': ['mcp', 'model context protocol', 'server', 'integration'],
      'Web Framework': ['framework', 'web', 'http', 'api', 'server'],
      'Library': ['library', 'package', 'module', 'sdk'],
      'CLI Tool': ['command line', 'cli', 'terminal', 'shell'],
      'API Service': ['api', 'service', 'endpoint', 'rest'],
      'Development Tool': ['development', 'developer', 'tool', 'utility'],
      'Database': ['database', 'db', 'storage', 'data'],
      'Frontend': ['frontend', 'ui', 'interface', 'react', 'vue'],
      'Backend': ['backend', 'server', 'service', 'microservice']
    };
    
    for (const [category, keywords] of Object.entries(patterns)) {
      const matchCount = keywords.filter(keyword => lowerContent.includes(keyword)).length;
      if (matchCount >= 2) {
        return category;
      }
    }
    
    return 'Software Tool';
  }
  
  /**
   * 機能・特徴抽出
   */
  private extractFeatures(sections: Record<string, string>, content: string): string[] {
    const features: string[] = [];
    
    // Features セクションを探す
    const featureSections = Object.keys(sections).filter(key =>
      key.includes('feature') || key.includes('capability') || key.includes('function')
    );
    
    for (const sectionName of featureSections) {
      const sectionContent = sections[sectionName];
      // リスト項目を抽出
      const listItems = sectionContent.match(/^[-*+]\s+(.+)/gm);
      if (listItems) {
        features.push(...listItems.map(item => item.replace(/^[-*+]\s+/, '').trim()));
      }
    }
    
    // 数字付きリストも探す
    const numberedItems = content.match(/^\d+\.\s+(.+)/gm);
    if (numberedItems) {
      features.push(...numberedItems.map(item => item.replace(/^\d+\.\s+/, '').trim()));
    }
    
    return features.slice(0, 10); // 最大10個
  }
  
  /**
   * 利点抽出
   */
  private extractBenefits(sections: Record<string, string>, content: string): string[] {
    const benefitKeywords = [
      'benefit', 'advantage', 'improve', 'enhance', 'optimize',
      'fast', 'easy', 'simple', 'secure', 'reliable'
    ];
    
    const sentences = content.split(/[.!?]/).map(s => s.trim());
    const benefits: string[] = [];
    
    for (const sentence of sentences) {
      for (const keyword of benefitKeywords) {
        if (sentence.toLowerCase().includes(keyword) && sentence.length > 20) {
          benefits.push(sentence);
          break;
        }
      }
    }
    
    return benefits.slice(0, 5);
  }
  
  /**
   * 使用ケース抽出
   */
  private extractUseCases(sections: Record<string, string>, content: string): string[] {
    const useCaseSections = Object.keys(sections).filter(key =>
      key.includes('use') || key.includes('example') || key.includes('scenario')
    );
    
    const useCases: string[] = [];
    
    for (const sectionName of useCaseSections) {
      const sectionContent = sections[sectionName];
      const listItems = sectionContent.match(/^[-*+]\s+(.+)/gm);
      if (listItems) {
        useCases.push(...listItems.map(item => item.replace(/^[-*+]\s+/, '').trim()));
      }
    }
    
    return useCases.slice(0, 5);
  }
  
  /**
   * 技術スタック抽出
   */
  private extractTechnologies(sections: Record<string, string>, content: string): string[] {
    const techKeywords = [
      'go', 'golang', 'node.js', 'javascript', 'typescript', 'python', 'java',
      'react', 'vue', 'angular', 'express', 'fastify', 'django', 'flask',
      'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'postgresql', 'mysql',
      'mongodb', 'redis', 'nginx', 'apache'
    ];
    
    const lowerContent = content.toLowerCase();
    const detectedTech: string[] = [];
    
    for (const tech of techKeywords) {
      if (lowerContent.includes(tech)) {
        detectedTech.push(tech);
      }
    }
    
    return [...new Set(detectedTech)]; // 重複除去
  }
  
  /**
   * 要件抽出
   */
  private extractRequirements(sections: Record<string, string>, content: string): string[] {
    const reqSections = Object.keys(sections).filter(key =>
      key.includes('requirement') || key.includes('prerequisite') || key.includes('dependency')
    );
    
    const requirements: string[] = [];
    
    for (const sectionName of reqSections) {
      const sectionContent = sections[sectionName];
      const listItems = sectionContent.match(/^[-*+]\s+(.+)/gm);
      if (listItems) {
        requirements.push(...listItems.map(item => item.replace(/^[-*+]\s+/, '').trim()));
      }
    }
    
    return requirements;
  }
  
  /**
   * インストール情報抽出
   */
  private extractInstallation(sections: Record<string, string>, content: string): any {
    const installSections = Object.keys(sections).filter(key =>
      key.includes('install') || key.includes('setup') || key.includes('getting_started')
    );
    
    const installation = {
      steps: [] as string[],
      commands: [] as string[],
      notes: [] as string[]
    };
    
    for (const sectionName of installSections) {
      const sectionContent = sections[sectionName];
      
      // コマンド抽出
      const commands = sectionContent.match(/```[\s\S]*?```/g);
      if (commands) {
        installation.commands.push(...commands.map(cmd => 
          cmd.replace(/```[^\n]*\n?/, '').replace(/```$/, '').trim()
        ));
      }
      
      // ステップ抽出
      const steps = sectionContent.match(/^\d+\.\s+(.+)/gm);
      if (steps) {
        installation.steps.push(...steps.map(step => step.replace(/^\d+\.\s+/, '').trim()));
      }
    }
    
    return installation;
  }
  
  /**
   * 使用方法抽出
   */
  private extractUsage(sections: Record<string, string>, content: string): any {
    const usageSections = Object.keys(sections).filter(key =>
      key.includes('usage') || key.includes('example') || key.includes('quick')
    );
    
    const usage = {
      basicUsage: '',
      examples: [] as string[],
      codeSnippets: [] as string[]
    };
    
    for (const sectionName of usageSections) {
      const sectionContent = sections[sectionName];
      
      if (!usage.basicUsage && sectionContent.length > 50) {
        usage.basicUsage = sectionContent.split('\n')[0];
      }
      
      // コードスニペット抽出
      const snippets = sectionContent.match(/```[\s\S]*?```/g);
      if (snippets) {
        usage.codeSnippets.push(...snippets);
      }
    }
    
    return usage;
  }
  
  /**
   * プロジェクトタイプ推論
   */
  private inferProjectType(sections: Record<string, string>, content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('mcp') && lowerContent.includes('server')) return 'MCP Server';
    if (lowerContent.includes('api') && lowerContent.includes('server')) return 'API Server';
    if (lowerContent.includes('library') || lowerContent.includes('package')) return 'Library';
    if (lowerContent.includes('framework')) return 'Framework';
    if (lowerContent.includes('tool') || lowerContent.includes('utility')) return 'Development Tool';
    if (lowerContent.includes('application') || lowerContent.includes('app')) return 'Application';
    
    return 'Software Project';
  }
  
  /**
   * 対象ユーザー抽出
   */
  private extractTargetAudience(sections: Record<string, string>, content: string): string[] {
    const audienceKeywords = {
      'developers': ['developer', 'programmer', 'engineer'],
      'system administrators': ['sysadmin', 'administrator', 'devops'],
      'data scientists': ['data scientist', 'analyst', 'researcher'],
      'beginners': ['beginner', 'newcomer', 'starter'],
      'enterprises': ['enterprise', 'organization', 'company']
    };
    
    const lowerContent = content.toLowerCase();
    const audiences: string[] = [];
    
    for (const [audience, keywords] of Object.entries(audienceKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        audiences.push(audience);
      }
    }
    
    return audiences.length > 0 ? audiences : ['developers'];
  }
  
  /**
   * 複雑度評価
   */
  private assessComplexity(sections: Record<string, string>, content: string): 'beginner' | 'intermediate' | 'advanced' {
    const lowerContent = content.toLowerCase();
    
    // 複雑度指標
    let complexity = 0;
    
    // 高度なキーワード
    const advancedKeywords = ['kubernetes', 'microservice', 'distributed', 'scalable', 'performance'];
    complexity += advancedKeywords.filter(keyword => lowerContent.includes(keyword)).length * 2;
    
    // 中級キーワード
    const intermediateKeywords = ['api', 'database', 'authentication', 'configuration'];
    complexity += intermediateKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    
    // セクション数（複雑度の指標）
    complexity += Object.keys(sections).length * 0.5;
    
    if (complexity >= 8) return 'advanced';
    if (complexity >= 4) return 'intermediate';
    return 'beginner';
  }
  
  /**
   * 品質スコア計算
   */
  private calculateQualityScore(sections: Record<string, string>, content: string): number {
    let score = 0;
    
    // セクション多様性 (最大30点)
    score += Math.min(Object.keys(sections).length * 3, 30);
    
    // コンテンツ長 (最大20点)
    score += Math.min(content.length / 500 * 10, 20);
    
    // 構造化要素 (最大30点)
    const structureElements = [
      content.includes('```'), // コードブロック
      content.includes('- '), // リスト
      content.includes('## '), // サブヘッダー
      content.includes('['), // リンク
      content.includes('|') // テーブル
    ];
    score += structureElements.filter(Boolean).length * 6;
    
    // 包括性 (最大20点)
    const comprehensivenessKeywords = ['install', 'usage', 'example', 'feature'];
    score += comprehensivenessKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    ).length * 5;
    
    return Math.min(Math.round(score), 100);
  }
  
  /**
   * パターン検出
   */
  private detectPatterns(sections: Record<string, string>, content: string): string[] {
    const patterns: string[] = [];
    
    if (content.includes('```')) patterns.push('Code Examples');
    if (content.includes('- ')) patterns.push('Structured Lists');
    if (content.includes('## ')) patterns.push('Well Organized');
    if (content.includes('[') && content.includes('](')) patterns.push('External References');
    if (content.includes('|')) patterns.push('Tabular Data');
    if (content.toLowerCase().includes('license')) patterns.push('Licensed Project');
    if (content.toLowerCase().includes('contribute')) patterns.push('Open Source');
    
    return patterns;
  }
}

export const enhancedReadmeIntelligenceExtractor = new EnhancedReadmeIntelligenceExtractor();