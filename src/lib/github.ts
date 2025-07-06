import { Octokit } from 'octokit';
import { GitHubRepository, GitHubFile } from '@/types';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * GitHub URLからowner/repoを抽出
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);
  
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''), // .git拡張子を削除
  };
}

/**
 * リポジトリ情報を取得
 */
export async function getRepository(owner: string, repo: string): Promise<GitHubRepository> {
  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      html_url: data.html_url,
      language: data.language,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      updated_at: data.updated_at,
      default_branch: data.default_branch,
    };
  } catch (error) {
    console.error('Error fetching repository:', error);
    throw new Error(`Failed to fetch repository: ${owner}/${repo}`);
  }
}

/**
 * ファイルの内容を取得
 */
export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (Array.isArray(data) || data.type !== 'file') {
      return null;
    }

    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }

    return data.content || null;
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error);
    return null;
  }
}

/**
 * ディレクトリの内容を取得
 */
export async function getDirectoryContents(
  owner: string,
  repo: string,
  path: string = '',
  ref?: string
): Promise<GitHubFile[]> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      url: item.url,
      html_url: item.html_url,
      git_url: item.git_url,
      download_url: item.download_url,
      type: item.type as 'file' | 'dir',
    }));
  } catch (error) {
    console.error(`Error fetching directory ${path}:`, error);
    return [];
  }
}

/**
 * 複数のファイルを並行して取得
 */
export async function getMultipleFiles(
  owner: string,
  repo: string,
  paths: string[],
  ref?: string
): Promise<Record<string, string | null>> {
  const results = await Promise.allSettled(
    paths.map(async (path) => {
      const content = await getFileContent(owner, repo, path, ref);
      return { path, content };
    })
  );

  const files: Record<string, string | null> = {};
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      files[result.value.path] = result.value.content;
    } else {
      files[paths[index]] = null;
    }
  });

  return files;
}

/**
 * package.jsonとその他の設定ファイルを取得
 */
export async function getConfigFiles(
  owner: string,
  repo: string,
  ref?: string
): Promise<Record<string, string | null>> {
  const configFiles = [
    'package.json',
    'requirements.txt',
    'pyproject.toml',
    'Gemfile',
    'Cargo.toml',
    'go.mod',
    'composer.json',
    'pom.xml',
    'build.gradle',
    'build.gradle.kts',
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.yaml',
    '.env.example',
    'tsconfig.json',
    'tailwind.config.js',
    'tailwind.config.ts',
    'next.config.js',
    'next.config.ts',
    'nuxt.config.js',
    'nuxt.config.ts',
    'vue.config.js',
    'angular.json',
    'nest-cli.json',
    'deno.json',
    'bun.lockb',
    'yarn.lock',
    'package-lock.json',
    'poetry.lock',
    'Pipfile',
    'Pipfile.lock',
  ];

  return getMultipleFiles(owner, repo, configFiles, ref);
}

/**
 * ファイル構造を再帰的に取得（最大深度制限付き）
 */
export async function getFileStructure(
  owner: string,
  repo: string,
  path: string = '',
  maxDepth: number = 3,
  currentDepth: number = 0
): Promise<GitHubFile[]> {
  if (currentDepth >= maxDepth) {
    return [];
  }

  const contents = await getDirectoryContents(owner, repo, path);
  const allFiles: GitHubFile[] = [];

  for (const item of contents) {
    allFiles.push(item);
    
    if (item.type === 'dir' && !shouldIgnoreDirectory(item.name)) {
      const subFiles = await getFileStructure(
        owner,
        repo,
        item.path,
        maxDepth,
        currentDepth + 1
      );
      allFiles.push(...subFiles);
    }
  }

  return allFiles;
}

/**
 * 無視すべきディレクトリかどうか判定
 */
function shouldIgnoreDirectory(name: string): boolean {
  const ignoreDirs = [
    'node_modules',
    '.git',
    '.next',
    '.nuxt',
    'build',
    'dist',
    'out',
    'public',
    'static',
    'coverage',
    '.nyc_output',
    'logs',
    '*.log',
    'tmp',
    'temp',
    '.cache',
    '.parcel-cache',
    '.DS_Store',
    'Thumbs.db',
    '.vscode',
    '.idea',
    '__pycache__',
    '.pytest_cache',
    '.mypy_cache',
    '.tox',
    '.venv',
    'env',
    'venv',
    '.env',
    'vendor',
    'target',
    'bin',
    'obj',
  ];

  return ignoreDirs.includes(name) || name.startsWith('.');
}

/**
 * レート制限情報を取得
 */
export async function getRateLimit() {
  try {
    const { data } = await octokit.rest.rateLimit.get();
    return data;
  } catch (error) {
    console.error('Error fetching rate limit:', error);
    return null;
  }
}