import { gitHubZipFetcher } from './github-zip-fetcher';
import { TechStackItem, AnalysisResult } from '@/types';

interface ZipAnalysisResult {
  repository: any;
  techStack: TechStackItem[];
  dependencies: any[];
  structure: {
    type: string;
    framework?: string;
    language?: string;
    packageManager?: string;
    hasTests: boolean;
    hasDocumentation: boolean;
    hasCI: boolean;
    hasLinting: boolean;
    hasTypeScript: boolean;
  };
  detectedFiles: string[];
  summary: string;
  readmeContent?: string | null;
}

export class ZipBasedAnalyzer {
  
  /**
   * ZIPベースでリポジトリを包括分析
   */
  async analyzeRepository(owner: string, repo: string): Promise<ZipAnalysisResult> {
    console.log(`🔍 Starting ZIP-based analysis for ${owner}/${repo}`);
    
    try {
      // 1. ZIPファイル取得・解析
      const zipData = await gitHubZipFetcher.fetchRepositoryAsZip(owner, repo);
      
      // 2. リポジトリ基本情報構築（GitHub API無しバージョン）
      const repository = this.buildRepositoryInfo(owner, repo, zipData);
      
      // 3. 技術スタック分析
      const techStack = this.analyzeTechStack(zipData);
      
      // 4. 依存関係分析
      const dependencies = this.analyzeDependencies(zipData);
      
      // 5. プロジェクト構造分析
      const structure = this.analyzeProjectStructure(zipData);
      
      // 6. 検出ファイル一覧
      const detectedFiles = zipData.allFiles.map(f => f.fileName);
      
      // 7. サマリー生成
      const summary = this.generateSummary(repository, techStack, structure);
      
      // README content for enhanced analysis
      const readmeFile = zipData.documentationFiles.find((f: any) => 
        f.fileName.toLowerCase().includes('readme')
      );

      const result: ZipAnalysisResult = {
        repository,
        techStack,
        dependencies,
        structure,
        detectedFiles,
        summary,
        readmeContent: readmeFile?.content || null
      };
      
      console.log(`✅ ZIP analysis complete for ${owner}/${repo}:`, {
        techStack: techStack.length,
        dependencies: dependencies.length,
        files: detectedFiles.length
      });
      
      return result;
      
    } catch (error) {
      console.error(`❌ ZIP analysis failed for ${owner}/${repo}:`, error);
      throw error;
    }
  }
  
  /**
   * リポジトリ基本情報構築（GitHub API代替）
   */
  private buildRepositoryInfo(owner: string, repo: string, zipData: any) {
    // README から description を抽出
    const readmeFile = zipData.documentationFiles.find((f: any) => 
      f.fileName.toLowerCase().includes('readme')
    );
    
    let description = null;
    if (readmeFile) {
      // README の最初の段落を description として使用
      const lines = readmeFile.content.split('\n').filter((line: string) => line.trim());
      for (const line of lines) {
        if (!line.startsWith('#') && !line.startsWith('!') && line.length > 20) {
          description = line.trim();
          break;
        }
      }
    }
    
    // 言語推定（ファイル拡張子から）
    const language = this.inferPrimaryLanguage(zipData);
    
    return {
      id: Math.floor(Math.random() * 1000000),
      name: repo,
      full_name: `${owner}/${repo}`,
      description: description || `${repo} repository`,
      html_url: `https://github.com/${owner}/${repo}`,
      language: language,
      stargazers_count: 0, // ZIP解析では取得不可
      forks_count: 0, // ZIP解析では取得不可
      updated_at: new Date().toISOString(),
      default_branch: 'main',
      owner: {
        login: owner,
        avatar_url: `https://github.com/${owner}.png`,
        html_url: `https://github.com/${owner}`
      }
    };
  }
  
  /**
   * 主要言語推定
   */
  private inferPrimaryLanguage(zipData: any): string {
    const languageCount: Record<string, number> = {};
    
    zipData.sourceFiles.forEach((file: any) => {
      const ext = file.fileName.split('.').pop()?.toLowerCase();
      if (ext) {
        const lang = this.extensionToLanguage(ext);
        if (lang) {
          languageCount[lang] = (languageCount[lang] || 0) + file.size;
        }
      }
    });
    
    // サイズベースで最大言語を選択
    const topLanguage = Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    return topLanguage ? topLanguage[0] : 'Unknown';
  }
  
  /**
   * ファイル拡張子から言語マッピング
   */
  private extensionToLanguage(ext: string): string | null {
    const langMap: Record<string, string> = {
      'js': 'JavaScript',
      'jsx': 'JavaScript',
      'ts': 'TypeScript',
      'tsx': 'TypeScript',
      'py': 'Python',
      'java': 'Java',
      'kt': 'Kotlin',
      'scala': 'Scala',
      'go': 'Go',
      'rs': 'Rust',
      'c': 'C',
      'cpp': 'C++',
      'cxx': 'C++',
      'cc': 'C++',
      'h': 'C',
      'hpp': 'C++',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'swift': 'Swift',
      'dart': 'Dart',
      'elm': 'Elm',
      'clj': 'Clojure',
      'cljs': 'Clojure'
    };
    
    return langMap[ext] || null;
  }
  
  /**
   * 技術スタック分析
   */
  private analyzeTechStack(zipData: any): TechStackItem[] {
    const techStack: TechStackItem[] = [];
    
    // 1. package.json 分析
    const packageJson = zipData.configFiles.find((f: any) => f.fileName === 'package.json');
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content);
        this.extractFromPackageJson(pkg, techStack);
      } catch (error) {
        console.warn('Failed to parse package.json:', error);
      }
    }
    
    // 2. その他設定ファイル分析
    this.analyzeConfigFiles(zipData.configFiles, techStack);
    
    // 3. ソースファイル分析
    this.analyzeSourceFiles(zipData.sourceFiles, techStack);
    
    // 4. 言語検出
    this.addLanguagesFromFiles(zipData.sourceFiles, techStack);
    
    // 5. 重複除去・信頼度調整
    return this.deduplicateAndScore(techStack);
  }
  
  /**
   * package.json から技術抽出
   */
  private extractFromPackageJson(pkg: any, techStack: TechStackItem[]): void {
    // フレームワーク・ライブラリ検出
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    };
    
    const frameworkMap: Record<string, { name: string, category: string, confidence: number }> = {
      'react': { name: 'React', category: 'フレームワーク', confidence: 0.95 },
      'vue': { name: 'Vue.js', category: 'フレームワーク', confidence: 0.95 },
      'angular': { name: 'Angular', category: 'フレームワーク', confidence: 0.95 },
      'next': { name: 'Next.js', category: 'フレームワーク', confidence: 0.9 },
      'nuxt': { name: 'Nuxt.js', category: 'フレームワーク', confidence: 0.9 },
      'express': { name: 'Express', category: 'フレームワーク', confidence: 0.9 },
      'fastify': { name: 'Fastify', category: 'フレームワーク', confidence: 0.9 },
      'koa': { name: 'Koa', category: 'フレームワーク', confidence: 0.85 },
      'nest': { name: 'NestJS', category: 'フレームワーク', confidence: 0.85 },
      'typescript': { name: 'TypeScript', category: '言語', confidence: 0.9 },
      'webpack': { name: 'Webpack', category: 'ビルドツール', confidence: 0.8 },
      'vite': { name: 'Vite', category: 'ビルドツール', confidence: 0.8 },
      'rollup': { name: 'Rollup', category: 'ビルドツール', confidence: 0.8 },
      'jest': { name: 'Jest', category: 'テスト', confidence: 0.8 },
      'vitest': { name: 'Vitest', category: 'テスト', confidence: 0.8 },
      'cypress': { name: 'Cypress', category: 'テスト', confidence: 0.8 },
      'tailwindcss': { name: 'Tailwind CSS', category: 'CSS', confidence: 0.8 },
      'sass': { name: 'Sass', category: 'CSS', confidence: 0.7 },
      'less': { name: 'Less', category: 'CSS', confidence: 0.7 }
    };
    
    Object.keys(allDeps).forEach(dep => {
      const mapped = frameworkMap[dep];
      if (mapped) {
        techStack.push({
          name: mapped.name,
          category: mapped.category,
          confidence: mapped.confidence
        });
      }
    });
    
    // Node.js (package.jsonがあること自体でNode.js確定)
    techStack.push({
      name: 'Node.js',
      category: 'ランタイム',
      confidence: 0.95
    });
    
    // JavaScript (package.jsonがあること自体でJavaScript確定)
    if (!techStack.some(t => t.name === 'TypeScript')) {
      techStack.push({
        name: 'JavaScript',
        category: '言語',
        confidence: 0.9
      });
    }
  }
  
  /**
   * 設定ファイル分析
   */
  private analyzeConfigFiles(configFiles: any[], techStack: TechStackItem[]): void {
    configFiles.forEach(file => {
      const fileName = file.fileName.toLowerCase();
      
      // Go
      if (fileName === 'go.mod' || fileName === 'go.sum') {
        techStack.push({
          name: 'Go',
          category: '言語',
          confidence: 0.95
        });
      }
      
      // Rust
      if (fileName === 'cargo.toml' || fileName === 'cargo.lock') {
        techStack.push({
          name: 'Rust',
          category: '言語',
          confidence: 0.95
        });
      }
      
      // Python
      if (fileName === 'requirements.txt' || fileName === 'pyproject.toml' || fileName === 'setup.py') {
        techStack.push({
          name: 'Python',
          category: '言語',
          confidence: 0.9
        });
      }
      
      // Java
      if (fileName === 'pom.xml' || fileName === 'build.gradle') {
        techStack.push({
          name: 'Java',
          category: '言語',
          confidence: 0.9
        });
      }
      
      // Docker
      if (fileName === 'dockerfile' || fileName === 'docker-compose.yml') {
        techStack.push({
          name: 'Docker',
          category: 'ツール',
          confidence: 0.85
        });
      }
      
      // TypeScript
      if (fileName === 'tsconfig.json') {
        techStack.push({
          name: 'TypeScript',
          category: '言語',
          confidence: 0.9
        });
      }
    });
  }
  
  /**
   * ソースファイル分析
   */
  private analyzeSourceFiles(sourceFiles: any[], techStack: TechStackItem[]): void {
    // ファイル内容から特定のフレームワーク検出
    sourceFiles.forEach(file => {
      const content = file.content.toLowerCase();
      
      // React検出
      if (content.includes('import react') || content.includes('from \'react\'') || content.includes('jsx')) {
        if (!techStack.some(t => t.name === 'React')) {
          techStack.push({
            name: 'React',
            category: 'フレームワーク',
            confidence: 0.8
          });
        }
      }
      
      // Vue検出
      if (content.includes('<template>') || content.includes('vue')) {
        if (!techStack.some(t => t.name === 'Vue.js')) {
          techStack.push({
            name: 'Vue.js',
            category: 'フレームワーク',
            confidence: 0.8
          });
        }
      }
    });
  }
  
  /**
   * ファイル拡張子から言語追加
   */
  private addLanguagesFromFiles(sourceFiles: any[], techStack: TechStackItem[]): void {
    const languageCount: Record<string, number> = {};
    
    sourceFiles.forEach(file => {
      const ext = file.fileName.split('.').pop()?.toLowerCase();
      if (ext) {
        const lang = this.extensionToLanguage(ext);
        if (lang) {
          languageCount[lang] = (languageCount[lang] || 0) + 1;
        }
      }
    });
    
    // 複数ファイルがある言語のみ追加
    Object.entries(languageCount).forEach(([lang, count]) => {
      if (count >= 3 && !techStack.some(t => t.name === lang)) {
        techStack.push({
          name: lang,
          category: '言語',
          confidence: Math.min(0.9, 0.5 + count * 0.05)
        });
      }
    });
  }
  
  /**
   * 重複除去・信頼度調整
   */
  private deduplicateAndScore(techStack: TechStackItem[]): TechStackItem[] {
    const techMap = new Map<string, TechStackItem>();
    
    techStack.forEach(tech => {
      const existing = techMap.get(tech.name);
      if (existing) {
        // 信頼度を平均化
        existing.confidence = Math.min(0.95, (existing.confidence + tech.confidence) / 2 + 0.1);
      } else {
        techMap.set(tech.name, { ...tech });
      }
    });
    
    return Array.from(techMap.values())
      .sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * 依存関係分析
   */
  private analyzeDependencies(zipData: any): any[] {
    const dependencies: any[] = [];
    
    // package.json から依存関係抽出
    const packageJson = zipData.configFiles.find((f: any) => f.fileName === 'package.json');
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content);
        
        if (pkg.dependencies) {
          Object.entries(pkg.dependencies).forEach(([name, version]) => {
            dependencies.push({
              name,
              version: version as string,
              type: 'production',
              description: `Production dependency`
            });
          });
        }
        
        if (pkg.devDependencies) {
          Object.entries(pkg.devDependencies).forEach(([name, version]) => {
            dependencies.push({
              name,
              version: version as string,
              type: 'development',
              description: `Development dependency`
            });
          });
        }
      } catch (error) {
        console.warn('Failed to parse package.json for dependencies:', error);
      }
    }
    
    return dependencies;
  }
  
  /**
   * プロジェクト構造分析
   */
  private analyzeProjectStructure(zipData: any): any {
    const structure = {
      type: 'unknown',
      framework: undefined as string | undefined,
      language: undefined as string | undefined,
      packageManager: undefined as string | undefined,
      hasTests: zipData.testFiles.length > 0,
      hasDocumentation: zipData.documentationFiles.length > 0,
      hasCI: false,
      hasLinting: false,
      hasTypeScript: false
    };
    
    // フレームワーク推定
    const packageJson = zipData.configFiles.find((f: any) => f.fileName === 'package.json');
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        if (allDeps.react) structure.framework = 'React';
        else if (allDeps.vue) structure.framework = 'Vue.js';
        else if (allDeps.angular) structure.framework = 'Angular';
        else if (allDeps.next) structure.framework = 'Next.js';
        else if (allDeps.express) structure.framework = 'Express';
        
        structure.type = structure.framework ? 'web' : 'library';
      } catch (error) {
        console.warn('Failed to parse package.json for structure:', error);
      }
    }
    
    // 言語推定
    structure.language = this.inferPrimaryLanguage(zipData);
    
    // パッケージマネージャー推定
    if (zipData.configFiles.some((f: any) => f.fileName === 'package-lock.json')) {
      structure.packageManager = 'npm';
    } else if (zipData.configFiles.some((f: any) => f.fileName === 'yarn.lock')) {
      structure.packageManager = 'yarn';
    } else if (zipData.configFiles.some((f: any) => f.fileName === 'pnpm-lock.yaml')) {
      structure.packageManager = 'pnpm';
    }
    
    // TypeScript検出
    structure.hasTypeScript = zipData.configFiles.some((f: any) => f.fileName === 'tsconfig.json') ||
                              zipData.sourceFiles.some((f: any) => f.fileName.endsWith('.ts') || f.fileName.endsWith('.tsx'));
    
    // Linting検出
    structure.hasLinting = zipData.configFiles.some((f: any) => 
      f.fileName.includes('eslint') || f.fileName.includes('prettier')
    );
    
    // CI検出
    structure.hasCI = zipData.allFiles.some((f: any) => 
      f.fileName.includes('.github/workflows') || 
      f.fileName.includes('.gitlab-ci') ||
      f.fileName.includes('travis.yml')
    );
    
    return structure;
  }
  
  /**
   * サマリー生成
   */
  private generateSummary(repository: any, techStack: TechStackItem[], structure: any): string {
    const mainTech = techStack[0]?.name || 'Unknown';
    const framework = structure.framework || '';
    
    let summary = `${repository.name} is a ${structure.language || 'software'} project`;
    
    if (framework) {
      summary += ` built with ${framework}`;
    }
    
    if (techStack.length > 1) {
      const otherTechs = techStack.slice(1, 4).map(t => t.name).join(', ');
      summary += ` and ${otherTechs}`;
    }
    
    summary += `.`;
    
    if (structure.hasTests) {
      summary += ` Includes automated testing.`;
    }
    
    if (structure.hasTypeScript) {
      summary += ` Written in TypeScript for type safety.`;
    }
    
    return summary;
  }
}

export const zipBasedAnalyzer = new ZipBasedAnalyzer();