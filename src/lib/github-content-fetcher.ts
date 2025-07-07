import { Octokit } from 'octokit';

interface GitHubFile {
  name: string;
  path: string;
  content: string;
  size: number;
  type: 'file' | 'dir';
}

interface RepositoryContent {
  readme?: GitHubFile;
  packageJson?: GitHubFile;
  license?: GitHubFile;
  contributing?: GitHubFile;
  changelog?: GitHubFile;
  dockerfile?: GitHubFile;
  dockerCompose?: GitHubFile;
  configFiles: GitHubFile[];
  sourceFiles: GitHubFile[];
  testFiles: GitHubFile[];
  documentationFiles: GitHubFile[];
}

export class GitHubContentFetcher {
  private octokit: Octokit;

  constructor(authToken?: string) {
    this.octokit = new Octokit({
      auth: authToken || process.env.GITHUB_TOKEN,
    });
  }

  /**
   * リポジトリの重要なファイルコンテンツを取得
   */
  async fetchRepositoryContent(owner: string, repo: string): Promise<RepositoryContent> {
    const content: RepositoryContent = {
      configFiles: [],
      sourceFiles: [],
      testFiles: [],
      documentationFiles: []
    };

    try {
      // ルートディレクトリのファイル一覧を取得
      const { data: rootFiles } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: ''
      });

      if (!Array.isArray(rootFiles)) {
        return content;
      }

      // 重要なファイルを特定して取得
      for (const file of rootFiles) {
        if (file.type === 'file') {
          await this.categorizeAndFetchFile(owner, repo, file, content);
        }
      }

      // サブディレクトリから重要なファイルをサンプリング
      await this.fetchSampleSourceFiles(owner, repo, content);

    } catch (error) {
      console.warn('Failed to fetch some repository content:', error);
    }

    return content;
  }

  /**
   * ファイルを分類して取得
   */
  private async categorizeAndFetchFile(
    owner: string, 
    repo: string, 
    file: any, 
    content: RepositoryContent
  ): Promise<void> {
    const fileName = file.name.toLowerCase();
    const filePath = file.path;

    try {
      // README ファイル
      if (this.isReadmeFile(fileName)) {
        const file = await this.fetchFileContent(owner, repo, filePath);
        if (file) content.readme = file;
      }
      // package.json
      else if (fileName === 'package.json') {
        const file = await this.fetchFileContent(owner, repo, filePath);
        if (file) content.packageJson = file;
      }
      // LICENSE
      else if (this.isLicenseFile(fileName)) {
        const file = await this.fetchFileContent(owner, repo, filePath);
        if (file) content.license = file;
      }
      // CONTRIBUTING
      else if (this.isContributingFile(fileName)) {
        const file = await this.fetchFileContent(owner, repo, filePath);
        if (file) content.contributing = file;
      }
      // CHANGELOG
      else if (this.isChangelogFile(fileName)) {
        const file = await this.fetchFileContent(owner, repo, filePath);
        if (file) content.changelog = file;
      }
      // Dockerfile
      else if (fileName === 'dockerfile') {
        const file = await this.fetchFileContent(owner, repo, filePath);
        if (file) content.dockerfile = file;
      }
      // docker-compose
      else if (fileName.includes('docker-compose')) {
        const file = await this.fetchFileContent(owner, repo, filePath);
        if (file) content.dockerCompose = file;
      }
      // 設定ファイル
      else if (this.isConfigFile(fileName)) {
        const fileContent = await this.fetchFileContent(owner, repo, filePath);
        if (fileContent) content.configFiles.push(fileContent);
      }
    } catch (error) {
      console.warn(`Failed to fetch file ${filePath}:`, error);
    }
  }

  /**
   * ソースファイルのサンプルを取得
   */
  private async fetchSampleSourceFiles(
    owner: string, 
    repo: string, 
    content: RepositoryContent
  ): Promise<void> {
    const commonSourceDirs = ['src', 'lib', 'app', 'pages', 'components'];
    const commonTestDirs = ['test', 'tests', '__tests__', 'spec'];
    const commonDocDirs = ['docs', 'documentation', 'doc'];

    for (const dir of commonSourceDirs) {
      await this.fetchDirectoryFiles(owner, repo, dir, content.sourceFiles, 5);
    }

    for (const dir of commonTestDirs) {
      await this.fetchDirectoryFiles(owner, repo, dir, content.testFiles, 3);
    }

    for (const dir of commonDocDirs) {
      await this.fetchDirectoryFiles(owner, repo, dir, content.documentationFiles, 3);
    }
  }

  /**
   * ディレクトリからファイルを取得
   */
  private async fetchDirectoryFiles(
    owner: string, 
    repo: string, 
    dirPath: string, 
    targetArray: GitHubFile[], 
    maxFiles: number
  ): Promise<void> {
    try {
      const { data: dirFiles } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: dirPath
      });

      if (!Array.isArray(dirFiles)) return;

      let fetchedCount = 0;
      for (const file of dirFiles) {
        if (fetchedCount >= maxFiles) break;
        
        if (file.type === 'file' && this.isSourceFile(file.name)) {
          const fileContent = await this.fetchFileContent(owner, repo, file.path);
          if (fileContent) {
            targetArray.push(fileContent);
            fetchedCount++;
          }
        }
      }
    } catch (error) {
      // ディレクトリが存在しない場合は無視
    }
  }

  /**
   * 個別ファイルのコンテンツを取得
   */
  private async fetchFileContent(owner: string, repo: string, path: string): Promise<GitHubFile | null> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });

      if ('content' in data && data.type === 'file') {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        
        return {
          name: data.name,
          path: data.path,
          content: content,
          size: data.size,
          type: 'file'
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch file content for ${path}:`, error);
    }

    return null;
  }

  // ファイル分類ヘルパーメソッド
  private isReadmeFile(fileName: string): boolean {
    return fileName.startsWith('readme') && 
           (fileName.endsWith('.md') || fileName.endsWith('.txt') || !fileName.includes('.'));
  }

  private isLicenseFile(fileName: string): boolean {
    return fileName.startsWith('license') || fileName.startsWith('licence') ||
           fileName === 'copying' || fileName === 'copyright';
  }

  private isContributingFile(fileName: string): boolean {
    return fileName.startsWith('contributing') || fileName.startsWith('contribute');
  }

  private isChangelogFile(fileName: string): boolean {
    return fileName.startsWith('changelog') || fileName.startsWith('history') ||
           fileName.startsWith('releases') || fileName.startsWith('news');
  }

  private isConfigFile(fileName: string): boolean {
    const configExtensions = [
      '.json', '.yaml', '.yml', '.toml', '.ini', '.conf', '.config',
      '.env', '.properties', '.xml'
    ];
    
    const configFiles = [
      'tsconfig.json', 'jsconfig.json', 'webpack.config.js', 'vite.config.js',
      'rollup.config.js', 'babel.config.js', '.babelrc', '.eslintrc',
      'prettier.config.js', '.prettierrc', 'jest.config.js', 'vitest.config.js',
      'tailwind.config.js', 'postcss.config.js', 'next.config.js',
      'svelte.config.js', 'nuxt.config.js', 'gatsby.config.js',
      'cargo.toml', 'pyproject.toml', 'setup.py', 'requirements.txt',
      'pom.xml', 'build.gradle', 'composer.json', 'go.mod'
    ];

    return configFiles.includes(fileName) || 
           configExtensions.some(ext => fileName.endsWith(ext)) ||
           fileName.startsWith('.') && fileName.includes('rc');
  }

  private isSourceFile(fileName: string): boolean {
    const sourceExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
      '.py', '.java', '.kt', '.scala', '.go', '.rs',
      '.c', '.cpp', '.h', '.hpp', '.cs', '.php',
      '.rb', '.swift', '.dart', '.elm', '.clj'
    ];

    return sourceExtensions.some(ext => fileName.endsWith(ext)) ||
           fileName.endsWith('.test.js') || fileName.endsWith('.spec.js') ||
           fileName.endsWith('.test.ts') || fileName.endsWith('.spec.ts');
  }

  /**
   * READMEファイルからプロジェクト概要を抽出
   */
  extractProjectOverviewFromReadme(readmeContent: string): {
    title?: string;
    description?: string;
    features?: string[];
    installation?: string;
    usage?: string;
  } {
    const lines = readmeContent.split('\n');
    const overview: any = {};

    let currentSection = '';
    let inFeaturesList = false;
    const features: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // タイトル抽出（最初のH1）
      if (trimmed.startsWith('# ') && !overview.title) {
        overview.title = trimmed.replace(/^# /, '');
        continue;
      }

      // セクション検出
      if (trimmed.startsWith('#')) {
        currentSection = trimmed.toLowerCase();
        inFeaturesList = currentSection.includes('feature') || 
                        currentSection.includes('機能') ||
                        currentSection.includes('what');
        continue;
      }

      // 説明抽出（最初の段落）
      if (!overview.description && trimmed && !trimmed.startsWith('#') && 
          !trimmed.startsWith('[![') && !trimmed.startsWith('[')) {
        overview.description = trimmed;
        continue;
      }

      // 機能リスト抽出
      if (inFeaturesList && (trimmed.startsWith('- ') || trimmed.startsWith('* '))) {
        features.push(trimmed.replace(/^[- *] /, ''));
      }

      // インストール手順
      if (currentSection.includes('install') && trimmed && !trimmed.startsWith('#')) {
        if (!overview.installation) overview.installation = trimmed;
      }

      // 使用方法
      if (currentSection.includes('usage') && trimmed && !trimmed.startsWith('#')) {
        if (!overview.usage) overview.usage = trimmed;
      }
    }

    if (features.length > 0) {
      overview.features = features;
    }

    return overview;
  }
}

// シングルトンインスタンスをエクスポート
export const githubContentFetcher = new GitHubContentFetcher();