import * as yauzl from 'yauzl';
import { Readable } from 'stream';
import { promisify } from 'util';

interface ZipEntry {
  fileName: string;
  content: string;
  size: number;
  isDirectory: boolean;
}

interface RepositoryFiles {
  configFiles: ZipEntry[];
  sourceFiles: ZipEntry[];
  documentationFiles: ZipEntry[];
  testFiles: ZipEntry[];
  allFiles: ZipEntry[];
}

export class GitHubZipFetcher {
  
  /**
   * アップロードされたZIPファイルを解析（ZIPファイル分析用）
   */
  async processZipBuffer(zipBuffer: Buffer, projectName: string): Promise<RepositoryFiles> {
    console.log(`🔍 Processing uploaded ZIP: ${projectName} (${zipBuffer.length} bytes)`);
    
    try {
      return await this.parseZipBuffer(zipBuffer);
    } catch (error) {
      console.error(`❌ Failed to process ZIP buffer:`, error);
      throw new Error(`ZIP processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * GitHubリポジトリのZIPファイルをダウンロードして解析
   */
  async fetchRepositoryAsZip(owner: string, repo: string, branch: string = 'main'): Promise<RepositoryFiles> {
    console.log(`🔽 Downloading ZIP: ${owner}/${repo}@${branch}`);
    
    try {
      // GitHub ZIP URL構築（複数ブランチ対応）
      const zipUrls = [
        `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`,
        `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`,
        `https://github.com/${owner}/${repo}/archive/main.zip`,
        `https://github.com/${owner}/${repo}/archive/master.zip`
      ];
      
      let zipBuffer: Buffer | null = null;
      let successUrl = '';
      
      // 複数URLを試行（ブランチ名が不明な場合の対応）
      for (const url of zipUrls) {
        try {
          console.log(`📥 Trying: ${url}`);
          const response = await fetch(url);
          
          if (response.ok) {
            zipBuffer = Buffer.from(await response.arrayBuffer());
            successUrl = url;
            console.log(`✅ Successfully downloaded: ${url} (${zipBuffer.length} bytes)`);
            break;
          } else {
            console.log(`❌ Failed: ${url} - ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ Error with ${url}:`, error);
        }
      }
      
      if (!zipBuffer) {
        throw new Error(`Failed to download ZIP from any URL for ${owner}/${repo}`);
      }
      
      // ZIP解析
      const files = await this.extractZipContents(zipBuffer);
      console.log(`📁 Extracted ${files.allFiles.length} files from ${successUrl}`);
      
      return files;
      
    } catch (error) {
      console.error(`Failed to fetch repository ZIP for ${owner}/${repo}:`, error);
      throw error;
    }
  }
  
  /**
   * ZIPファイルの内容を抽出・分類
   */
  private async extractZipContents(zipBuffer: Buffer): Promise<RepositoryFiles> {
    return new Promise((resolve, reject) => {
      yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!zipfile) {
          reject(new Error('Failed to parse ZIP file'));
          return;
        }
        
        const files: RepositoryFiles = {
          configFiles: [],
          sourceFiles: [],
          documentationFiles: [],
          testFiles: [],
          allFiles: []
        };
        
        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          const fileName = entry.fileName;
          
          // ディレクトリは無視
          if (fileName.endsWith('/')) {
            zipfile.readEntry();
            return;
          }
          
          // ファイルサイズ制限（10MB以上は無視）
          if (entry.uncompressedSize > 10 * 1024 * 1024) {
            console.log(`⚠️ Skipping large file: ${fileName} (${entry.uncompressedSize} bytes)`);
            zipfile.readEntry();
            return;
          }
          
          // バイナリファイルやnode_modulesを除外
          if (this.shouldSkipFile(fileName)) {
            zipfile.readEntry();
            return;
          }
          
          // ファイル内容を読み取り
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              console.error(`Error reading ${fileName}:`, err);
              zipfile.readEntry();
              return;
            }
            
            if (!readStream) {
              zipfile.readEntry();
              return;
            }
            
            const chunks: Buffer[] = [];
            
            readStream.on('data', (chunk: Buffer) => {
              chunks.push(chunk);
            });
            
            readStream.on('end', () => {
              try {
                const content = Buffer.concat(chunks).toString('utf-8');
                
                // テキストファイルかチェック（バイナリ除外）
                if (this.isTextFile(content)) {
                  const zipEntry: ZipEntry = {
                    fileName: this.normalizeFileName(fileName),
                    content,
                    size: entry.uncompressedSize,
                    isDirectory: false
                  };
                  
                  // ファイル分類
                  this.categorizeFile(zipEntry, files);
                  files.allFiles.push(zipEntry);
                }
                
                zipfile.readEntry();
              } catch (error) {
                console.error(`Error processing ${fileName}:`, error);
                zipfile.readEntry();
              }
            });
            
            readStream.on('error', (error) => {
              console.error(`Stream error for ${fileName}:`, error);
              zipfile.readEntry();
            });
          });
        });
        
        zipfile.on('end', () => {
          console.log(`📊 File categorization complete:
  Config: ${files.configFiles.length}
  Source: ${files.sourceFiles.length}
  Docs: ${files.documentationFiles.length}
  Tests: ${files.testFiles.length}
  Total: ${files.allFiles.length}`);
          resolve(files);
        });
        
        zipfile.on('error', (err) => {
          reject(err);
        });
      });
    });
  }
  
  /**
   * ファイルをスキップすべきかチェック
   */
  private shouldSkipFile(fileName: string): boolean {
    const skipPatterns = [
      /node_modules\//,
      /\.git\//,
      /build\//,
      /dist\//,
      /coverage\//,
      /\.next\//,
      /\.nuxt\//,
      /vendor\//,
      /target\//,
      /bin\//,
      /obj\//,
      /\.vscode\//,
      /\.idea\//,
      /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp4|mp3|avi|mov|pdf)$/i,
      /\.(zip|tar|gz|rar|7z|exe|dmg|pkg)$/i,
      /\.min\.(js|css)$/,
      /\.(lock|log)$/
    ];
    
    return skipPatterns.some(pattern => pattern.test(fileName));
  }
  
  /**
   * テキストファイルかチェック（バイナリ除外）
   */
  private isTextFile(content: string): boolean {
    // 最初の1000文字をチェック
    const sample = content.slice(0, 1000);
    
    // null文字があるとバイナリ
    if (sample.includes('\0')) {
      return false;
    }
    
    // 制御文字の割合をチェック
    const controlChars = sample.match(/[\x00-\x08\x0E-\x1F]/g);
    const controlRatio = controlChars ? controlChars.length / sample.length : 0;
    
    return controlRatio < 0.05; // 5%未満なら多分テキスト
  }
  
  /**
   * ファイル名正規化（ZIPのルートディレクトリ削除）
   */
  private normalizeFileName(fileName: string): string {
    // GitHub ZIPのルートディレクトリ（repo-branch/）を削除
    const parts = fileName.split('/');
    if (parts.length > 1) {
      return parts.slice(1).join('/');
    }
    return fileName;
  }
  
  /**
   * ファイル分類
   */
  private categorizeFile(file: ZipEntry, files: RepositoryFiles): void {
    const fileName = file.fileName.toLowerCase();
    const baseName = fileName.split('/').pop() || '';
    
    // 設定ファイル
    if (this.isConfigFile(baseName)) {
      files.configFiles.push(file);
    }
    
    // ソースコードファイル
    else if (this.isSourceFile(baseName)) {
      files.sourceFiles.push(file);
    }
    
    // ドキュメントファイル
    else if (this.isDocumentationFile(baseName)) {
      files.documentationFiles.push(file);
    }
    
    // テストファイル
    else if (this.isTestFile(fileName)) {
      files.testFiles.push(file);
    }
  }
  
  /**
   * 設定ファイル判定
   */
  private isConfigFile(fileName: string): boolean {
    const configFiles = [
      'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
      'tsconfig.json', 'jsconfig.json', 'webpack.config.js', 'vite.config.js',
      'rollup.config.js', 'babel.config.js', '.babelrc', '.eslintrc.json', '.eslintrc.js',
      'prettier.config.js', '.prettierrc', 'jest.config.js', 'vitest.config.js',
      'tailwind.config.js', 'postcss.config.js', 'next.config.js',
      'cargo.toml', 'cargo.lock', 'pyproject.toml', 'setup.py', 'requirements.txt',
      'pom.xml', 'build.gradle', 'composer.json', 'go.mod', 'go.sum',
      'dockerfile', '.dockerignore', 'docker-compose.yml',
      '.gitignore', '.gitattributes', '.editorconfig'
    ];
    
    const configExtensions = ['.json', '.yaml', '.yml', '.toml', '.ini', '.conf', '.env'];
    
    return configFiles.includes(fileName) || 
           configExtensions.some(ext => fileName.endsWith(ext)) ||
           fileName.startsWith('.') && fileName.includes('rc');
  }
  
  /**
   * ソースファイル判定
   */
  private isSourceFile(fileName: string): boolean {
    const sourceExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
      '.py', '.java', '.kt', '.scala', '.go', '.rs',
      '.c', '.cpp', '.h', '.hpp', '.cs', '.php',
      '.rb', '.swift', '.dart', '.elm', '.clj', '.cljs',
      '.html', '.css', '.scss', '.sass', '.less'
    ];
    
    return sourceExtensions.some(ext => fileName.endsWith(ext));
  }
  
  /**
   * ドキュメントファイル判定
   */
  private isDocumentationFile(fileName: string): boolean {
    const docPatterns = [
      /^readme/i, /^changelog/i, /^contributing/i, /^license/i,
      /^install/i, /^usage/i, /^api/i, /^docs/i
    ];
    
    const docExtensions = ['.md', '.txt', '.rst', '.adoc'];
    
    return docPatterns.some(pattern => pattern.test(fileName)) ||
           docExtensions.some(ext => fileName.endsWith(ext));
  }
  
  /**
   * テストファイル判定
   */
  private isTestFile(filePath: string): boolean {
    const testPatterns = [
      /test\//i, /tests\//i, /__test__\//i, /spec\//i,
      /\.test\./i, /\.spec\./i, /_test\./i
    ];
    
    return testPatterns.some(pattern => pattern.test(filePath));
  }
}

export const gitHubZipFetcher = new GitHubZipFetcher();