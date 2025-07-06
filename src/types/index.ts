// GitHub API types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string | null;
  git_url: string | null;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

// Tech Stack Analysis types
export interface TechStackItem {
  name: string;
  version?: string;
  category: 'framework' | 'library' | 'tool' | 'language' | 'database' | 'service' | 'build' | 'testing' | 'styling' | 'backend' | 'frontend' | 'infrastructure' | 'cicd' | 'deployment' | 'security' | 'monitoring' | 'analytics' | 'フレームワーク' | 'ライブラリ' | 'ツール' | '言語' | 'データベース' | 'サービス' | 'ビルドツール' | 'テスト' | 'スタイリング' | 'バックエンド' | 'フロントエンド' | 'インフラ' | 'CI/CD' | 'デプロイ' | 'セキュリティ' | 'モニタリング' | 'アナリティクス';
  description?: string;
  confidence: number; // 0-1
  usage?: string; // 使用パターンの詳細
}

export interface DependencyInfo {
  name: string;
  version: string;
  isDev: boolean;
  isOptional: boolean;
  description?: string;
}

export interface AnalysisResult {
  repository: GitHubRepository;
  techStack: TechStackItem[];
  dependencies?: DependencyInfo[];
  structure: ProjectStructure;
  detectedFiles?: DetectedFile[];
  summary: string;
  languages?: any;
  analysisId?: string;
  createdAt?: string;
}

export interface ProjectStructure {
  type: 'web' | 'mobile' | 'desktop' | 'cli' | 'library' | 'unknown';
  framework?: string | null;
  language: string;
  buildTool?: string | null;
  packageManager?: string | null;
  hasTests: boolean;
  hasDocumentation: boolean;
  hasCI: boolean;
  hasLinting?: boolean;
  hasTypeScript?: boolean;
  architecture?: string[];
  codeQuality?: any;
  cicd?: any;
  security?: any;
  performance?: any;
}

export interface DetectedFile {
  path: string;
  type: 'config' | 'package' | 'source' | 'test' | 'documentation' | 'ci';
  importance: number; // 0-1
  analysis?: string;
}

// Article Generation types
export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  sections: ArticleSection[];
}

export interface ArticleSection {
  title: string;
  type: 'introduction' | 'tech-overview' | 'architecture' | 'features' | 'conclusion';
  prompt: string;
  order: number;
}

export interface GeneratedArticle {
  title: string;
  content: string;
  markdown: string;
  metadata: {
    wordCount: number;
    readingTime: number;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

// React Flow types
export interface FlowNode {
  id: string;
  type: 'tech' | 'category' | 'connection';
  position: { x: number; y: number };
  hidden?: boolean;
  data: {
    label: string;
    description?: string;
    category?: string;
    version?: string;
    confidence?: number;
    color?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  label?: string;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface AnalysisError extends ApiError {
  phase: 'github-fetch' | 'file-analysis' | 'dependency-resolution' | 'ai-processing';
  repository?: string;
}

// Form types
export interface RepositoryForm {
  url: string;
  includePrivate: boolean;
  deepAnalysis: boolean;
  generateArticle: boolean;
  articleTemplate?: string;
}

export interface AnalysisFilters {
  categories: string[];
  confidence: number;
  showDevDependencies: boolean;
  groupByCategory: boolean;
}