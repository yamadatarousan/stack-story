import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { DeepCodeAnalyzer, DeepAnalysisResult } from './deep-code-analyzer';
import { GitHubRepository, AnalysisResult } from '@/types';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);

interface LocalAnalysisProgress {
  stage: 'cloning' | 'scanning' | 'analyzing' | 'completed' | 'error';
  message: string;
  progress: number; // 0-100
  currentFile?: string;
}

export class LocalRepoAnalyzer {
  private tempDir: string;
  private repoPath: string;
  private progressCallback?: (progress: LocalAnalysisProgress) => void;

  constructor(progressCallback?: (progress: LocalAnalysisProgress) => void) {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.repoPath = '';
    this.progressCallback = progressCallback;
    
    // temp ディレクトリが存在しない場合は作成
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async analyzeFromGitUrl(gitUrl: string): Promise<AnalysisResult> {
    const repoId = this.generateRepoId(gitUrl);
    this.repoPath = path.join(this.tempDir, repoId);

    try {
      // 1. Git clone
      await this.cloneRepository(gitUrl);
      
      // 2. ファイルスキャン
      const files = await this.scanFiles();
      
      // 3. リポジトリ情報を生成
      const repository = this.generateRepositoryInfo(gitUrl);
      
      // 4. ディープ分析実行
      const analysis = await this.performAnalysis(repository, files);
      
      // 5. クリーンアップ
      await this.cleanup();
      
      return analysis;
      
    } catch (error) {
      await this.cleanup();
      this.reportProgress({
        stage: 'error',
        message: `分析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
      });
      throw error;
    }
  }

  async analyzeFromZip(zipBuffer: Buffer, projectName: string): Promise<AnalysisResult> {
    const repoId = this.generateRepoId(projectName);
    this.repoPath = path.join(this.tempDir, repoId);

    try {
      // 1. ZIP展開
      await this.extractZip(zipBuffer);
      
      // 2. ファイルスキャン
      const files = await this.scanFiles();
      
      // 3. リポジトリ情報を生成
      const repository = this.generateRepositoryInfo(`local://${projectName}`);
      
      // 4. ディープ分析実行
      const analysis = await this.performAnalysis(repository, files);
      
      // 5. クリーンアップ
      await this.cleanup();
      
      return analysis;
      
    } catch (error) {
      await this.cleanup();
      this.reportProgress({
        stage: 'error',
        message: `ZIP分析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
      });
      throw error;
    }
  }

  private async cloneRepository(gitUrl: string): Promise<void> {
    this.reportProgress({
      stage: 'cloning',
      message: 'リポジトリをクローン中...',
      progress: 10,
    });

    return new Promise((resolve, reject) => {
      const gitProcess = spawn('git', ['clone', '--depth', '1', gitUrl, this.repoPath], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      gitProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });

      gitProcess.stderr?.on('data', (data) => {
        errorOutput += data.toString();
        // Git は進捗情報を stderr に出力する
        if (data.toString().includes('Receiving objects')) {
          this.reportProgress({
            stage: 'cloning',
            message: 'オブジェクトを受信中...',
            progress: 25,
          });
        }
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          this.reportProgress({
            stage: 'cloning',
            message: 'クローン完了',
            progress: 30,
          });
          resolve();
        } else {
          reject(new Error(`Git clone failed: ${errorOutput || output}`));
        }
      });

      gitProcess.on('error', (error) => {
        reject(new Error(`Git command failed: ${error.message}`));
      });
    });
  }

  private async extractZip(zipBuffer: Buffer): Promise<void> {
    this.reportProgress({
      stage: 'cloning',
      message: 'ZIPファイルを展開中...',
      progress: 10,
    });

    // Node.jsの標準的なZIP展開（実際にはライブラリが必要）
    // ここでは簡単な実装として、ZIPライブラリの使用を想定
    try {
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(zipBuffer);
      zip.extractAllTo(this.repoPath, true);
      
      this.reportProgress({
        stage: 'cloning',
        message: 'ZIP展開完了',
        progress: 30,
      });
    } catch (error) {
      // adm-zipが利用できない場合のフォールバック
      fs.mkdirSync(this.repoPath, { recursive: true });
      fs.writeFileSync(path.join(this.repoPath, 'extracted.zip'), zipBuffer);
      
      // 手動でunzipコマンドを実行
      try {
        execSync(`cd "${this.repoPath}" && unzip -q extracted.zip && rm extracted.zip`, { 
          timeout: 30000 
        });
      } catch (unzipError) {
        throw new Error('ZIP extraction failed. Please ensure unzip is available or upload individual files.');
      }
    }
  }

  private async scanFiles(): Promise<Record<string, string>> {
    this.reportProgress({
      stage: 'scanning',
      message: 'ファイルをスキャン中...',
      progress: 35,
    });

    const files: Record<string, string> = {};
    const sourceExtensions = [
      '.js', '.ts', '.jsx', '.tsx', 
      '.py', '.java', '.go', '.rs', 
      '.php', '.rb', '.cpp', '.c', 
      '.cs', '.kt', '.swift', '.dart',
      '.json', '.yaml', '.yml', '.toml',
      '.md', '.txt', '.env.example'
    ];

    const ignoreDirs = new Set([
      'node_modules', '.git', '.next', '.nuxt', 'build', 'dist', 'out',
      'vendor', 'target', 'bin', '__pycache__', '.pytest_cache',
      '.vscode', '.idea', 'coverage', '.nyc_output'
    ]);

    let fileCount = 0;
    const maxFiles = 500; // 最大ファイル数制限

    const scanDirectory = async (dirPath: string, relativePath = ''): Promise<void> => {
      if (fileCount >= maxFiles) return;

      const items = await readdir(dirPath);
      
      for (const item of items) {
        if (fileCount >= maxFiles) break;
        
        const fullPath = path.join(dirPath, item);
        const relativeFilePath = path.join(relativePath, item);
        
        try {
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            if (!ignoreDirs.has(item) && !item.startsWith('.')) {
              await scanDirectory(fullPath, relativeFilePath);
            }
          } else if (stats.isFile()) {
            const ext = path.extname(item).toLowerCase();
            const shouldInclude = sourceExtensions.includes(ext) || 
                                item === 'Dockerfile' || 
                                item === 'Makefile' ||
                                item.includes('requirements') ||
                                item.includes('package') ||
                                item.includes('composer') ||
                                item.includes('Cargo') ||
                                item.includes('pom.xml') ||
                                item.includes('build.gradle');
            
            if (shouldInclude && stats.size < 1024 * 1024) { // 1MB以下のファイルのみ
              try {
                const content = await readFile(fullPath, 'utf-8');
                files[relativeFilePath] = content;
                fileCount++;
                
                this.reportProgress({
                  stage: 'scanning',
                  message: `ファイルスキャン中... (${fileCount}/${maxFiles})`,
                  progress: 35 + (fileCount / maxFiles) * 20,
                  currentFile: relativeFilePath,
                });
              } catch (readError) {
                // バイナリファイルや読み取りエラーは無視
                console.warn(`Failed to read file ${relativeFilePath}:`, readError);
              }
            }
          }
        } catch (statError) {
          // stat エラーは無視
          console.warn(`Failed to stat ${relativeFilePath}:`, statError);
        }
      }
    };

    await scanDirectory(this.repoPath);
    
    this.reportProgress({
      stage: 'scanning',
      message: `ファイルスキャン完了 (${fileCount}ファイル)`,
      progress: 55,
    });

    return files;
  }

  private generateRepositoryInfo(url: string): GitHubRepository {
    const isLocalFile = url.startsWith('local://');
    const name = isLocalFile 
      ? url.replace('local://', '') 
      : url.split('/').pop()?.replace('.git', '') || 'unknown';
    
    return {
      id: Date.now(),
      name,
      full_name: isLocalFile ? `local/${name}` : url.replace('https://github.com/', ''),
      description: `Analyzed from ${isLocalFile ? 'uploaded files' : 'git repository'}`,
      html_url: isLocalFile ? '#' : url,
      language: null,
      stargazers_count: 0,
      forks_count: 0,
      updated_at: new Date().toISOString(),
      default_branch: 'main',
      owner: {
        login: isLocalFile ? 'local' : url.split('/')[3] || 'unknown',
        avatar_url: '',
        html_url: isLocalFile ? '#' : `https://github.com/${url.split('/')[3] || 'unknown'}`,
      },
    };
  }

  private async performAnalysis(repository: GitHubRepository, files: Record<string, string>): Promise<AnalysisResult> {
    this.reportProgress({
      stage: 'analyzing',
      message: 'ディープ分析を実行中...',
      progress: 60,
    });

    const deepAnalyzer = new DeepCodeAnalyzer(repository, files);
    const deepAnalysis = await deepAnalyzer.performDeepAnalysis();

    this.reportProgress({
      stage: 'analyzing',
      message: 'コード構造分析完了',
      progress: 75,
    });

    // README content extraction for practical summarizer
    let readmeContent = null;
    const readmeFile = Object.entries(files).find(([filePath, content]) => 
      filePath.toLowerCase().includes('readme') || 
      path.basename(filePath).toLowerCase().startsWith('readme')
    );
    if (readmeFile) {
      readmeContent = readmeFile[1]; // The content is the second element of the tuple
      console.log(`📄 Found README: ${readmeFile[0]} (${readmeContent.length} characters)`);
      
      // Update repository description with meaningful content from README
      const meaningfulDescription = this.extractMeaningfulDescription(readmeContent);
      if (meaningfulDescription) {
        repository.description = meaningfulDescription;
        console.log(`📝 Updated repository description: ${meaningfulDescription.substring(0, 100)}...`);
      }
    }

    // Narrative report generation
    this.reportProgress({
      stage: 'analyzing',
      message: '詳細レポート生成中...',
      progress: 85,
    });

    const { NarrativeReportGenerator } = await import('./narrative-report-generator');
    const narrativeGenerator = new NarrativeReportGenerator(deepAnalysis, {
      repository,
      techStack: [],
      structure: {
        type: this.inferProjectType(files),
        language: this.detectPrimaryLanguage(files),
        hasTests: this.hasTests(files),
        hasDocumentation: this.hasDocumentation(files),
        hasCI: this.hasCI(files),
      },
      detectedFiles: [],
      summary: ''
    });
    const narrativeReport = narrativeGenerator.generateReport();

    // 基本的な分析情報も生成
    const analysis: AnalysisResult = {
      repository,
      techStack: deepAnalysis.codeStructure.modules.map(module => ({
        name: module.name,
        category: 'ライブラリ' as const,
        description: module.purpose,
        confidence: 0.8,
      })),
      dependencies: [],
      structure: {
        type: this.inferProjectType(files),
        language: this.detectPrimaryLanguage(files),
        hasTests: this.hasTests(files),
        hasDocumentation: this.hasDocumentation(files),
        hasCI: this.hasCI(files),
      },
      detectedFiles: Object.keys(files).map(filePath => ({
        name: path.basename(filePath),
        path: filePath,
        type: this.getFileType(filePath),
        size: files[filePath].length,
        importance: this.calculateFileImportance(filePath),
      })),
      summary: this.generateSummary(deepAnalysis),
      deepAnalysis,
      narrativeReport,
      zipReadmeContent: readmeContent, // Add README content for practical summarizer
    };

    this.reportProgress({
      stage: 'completed',
      message: '分析完了',
      progress: 100,
    });

    return analysis;
  }

  private inferProjectType(files: Record<string, string>): 'web' | 'mobile' | 'desktop' | 'cli' | 'library' | 'unknown' {
    const fileNames = Object.keys(files);
    
    if (fileNames.some(f => f.includes('package.json'))) {
      const packageJson = files[fileNames.find(f => f.includes('package.json'))!];
      if (packageJson.includes('react') || packageJson.includes('vue') || packageJson.includes('angular')) {
        return 'web';
      }
    }
    
    if (fileNames.some(f => f.includes('pubspec.yaml') || f.includes('android') || f.includes('ios'))) {
      return 'mobile';
    }
    
    if (fileNames.some(f => f.includes('main.py') || f.includes('cli') || f.includes('bin/'))) {
      return 'cli';
    }
    
    return 'unknown';
  }

  private detectPrimaryLanguage(files: Record<string, string>): string {
    const languageCount: Record<string, number> = {};
    
    Object.keys(files).forEach(filePath => {
      const ext = path.extname(filePath).toLowerCase();
      const languages: Record<string, string> = {
        '.js': 'JavaScript',
        '.ts': 'TypeScript',
        '.jsx': 'JavaScript',
        '.tsx': 'TypeScript',
        '.py': 'Python',
        '.java': 'Java',
        '.go': 'Go',
        '.rs': 'Rust',
        '.php': 'PHP',
        '.rb': 'Ruby',
        '.cpp': 'C++',
        '.c': 'C',
        '.cs': 'C#',
        '.kt': 'Kotlin',
        '.swift': 'Swift',
        '.dart': 'Dart',
      };
      
      const language = languages[ext];
      if (language) {
        languageCount[language] = (languageCount[language] || 0) + 1;
      }
    });
    
    return Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  }

  private hasTests(files: Record<string, string>): boolean {
    return Object.keys(files).some(f => 
      f.includes('test') || f.includes('spec') || f.includes('__tests__')
    );
  }

  private hasDocumentation(files: Record<string, string>): boolean {
    return Object.keys(files).some(f => 
      f.toLowerCase().includes('readme') || f.includes('docs/')
    );
  }

  private hasCI(files: Record<string, string>): boolean {
    return Object.keys(files).some(f => 
      f.includes('.github/workflows') || f.includes('.gitlab-ci') || f.includes('Jenkinsfile')
    );
  }

  private getFileType(filePath: string): 'config' | 'package' | 'source' | 'test' | 'documentation' | 'ci' {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();
    
    if (fileName.includes('package.json') || fileName.includes('composer.json')) return 'package';
    if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs'].includes(ext)) return 'source';
    if (['.json', '.yaml', '.yml', '.toml'].includes(ext)) return 'config';
    if (['.md', '.txt'].includes(ext)) return 'documentation';
    if (filePath.includes('test') || filePath.includes('spec')) return 'test';
    if (filePath.includes('.github') || fileName.includes('dockerfile')) return 'ci';
    return 'config'; // デフォルト
  }

  private calculateFileImportance(filePath: string): number {
    const fileName = path.basename(filePath).toLowerCase();
    
    // 重要なファイルほど高スコア
    if (fileName === 'package.json' || fileName === 'composer.json') return 10;
    if (fileName === 'readme.md' || fileName === 'dockerfile') return 9;
    if (fileName.includes('index') || fileName.includes('main')) return 8;
    if (fileName.includes('config') || fileName.includes('setting')) return 7;
    if (filePath.includes('src/') || filePath.includes('lib/')) return 6;
    if (filePath.includes('test')) return 4;
    
    return 3;
  }

  private generateSummary(deepAnalysis: DeepAnalysisResult): string {
    const functionCount = deepAnalysis.codeStructure.functions.length;
    const classCount = deepAnalysis.codeStructure.classes.length;
    const issueCount = deepAnalysis.qualityIssues.codeSmells.length + 
                     deepAnalysis.qualityIssues.performanceIssues.length +
                     deepAnalysis.qualityIssues.securityVulnerabilities.length;
    
    return `${functionCount}個の関数、${classCount}個のクラスを解析。${issueCount}個の改善点を特定しました。`;
  }

  private generateRepoId(url: string): string {
    return `repo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async cleanup(): Promise<void> {
    if (this.repoPath && fs.existsSync(this.repoPath)) {
      try {
        // Windows互換性のため、rmコマンドを使用
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${this.repoPath}"`, { timeout: 10000 });
        } else {
          execSync(`rm -rf "${this.repoPath}"`, { timeout: 10000 });
        }
      } catch (error) {
        console.warn('Failed to cleanup temp directory:', error);
        // クリーンアップ失敗は無視（権限問題等）
      }
    }
  }

  private reportProgress(progress: LocalAnalysisProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
    console.log(`[${progress.stage}] ${progress.message} (${progress.progress}%)`);
  }

  /**
   * README内容から意味のある説明を抽出
   */
  private extractMeaningfulDescription(readmeContent: string): string | null {
    if (!readmeContent || readmeContent.length < 20) {
      return null;
    }

    // Markdownヘッダーを除去
    const cleanedContent = readmeContent.replace(/^#{1,6}\s+/gm, '').trim();
    
    // 行に分割して処理
    const lines = cleanedContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 有効な説明行かチェック
      if (trimmedLine.length > 30 && this.isValidDescriptionLine(trimmedLine)) {
        // 150文字以内に制限
        return trimmedLine.length > 150 
          ? trimmedLine.substring(0, 147) + '...'
          : trimmedLine;
      }
    }
    
    return null;
  }

  /**
   * 有効な説明行かどうかを判定
   */
  private isValidDescriptionLine(line: string): boolean {
    // 除外すべきパターン
    const excludePatterns = [
      /^\[.*\]\(.*\)/, // リンクのみ
      /^!\[.*\]/, // 画像のみ
      /^```/, // コードブロック
      /^\s*[-*+]\s/, // リスト項目
      /^\s*\d+\.\s/, // 番号付きリスト
      /^\s*\|/, // テーブル
      /^https?:\/\//, // URL
      /^#{1,6}\s/, // ヘッダー
    ];
    
    for (const pattern of excludePatterns) {
      if (pattern.test(line)) {
        return false;
      }
    }
    
    // 最低4単語以上
    const wordCount = line.split(/\s+/).length;
    return wordCount >= 4;
  }
}

// ZIP処理用のヘルパー関数
export function isValidGitUrl(url: string): boolean {
  const gitUrlPattern = /^https:\/\/github\.com\/[\w\-_]+\/[\w\-_]+(?:\.git)?$/;
  return gitUrlPattern.test(url);
}

export function sanitizeProjectName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\-_]/g, '_').toLowerCase();
}