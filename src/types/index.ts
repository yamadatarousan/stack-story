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
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
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
  // 拡張分析結果
  projectOverview?: any;
  architectureInsights?: any;
  technologyChoices?: any;
  codeQualityAssessment?: any;
  maturityLevel?: any;
  deepAnalysis?: any;
  narrativeReport?: any;
  // 新しいリポジトリ要約
  repositorySummary?: RepositorySummary;
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
  name: string;
  path: string;
  type: 'config' | 'package' | 'source' | 'test' | 'documentation' | 'ci';
  size: number;
  importance: number; // 0-10
  analysis?: string;
}

// Repository Summary types
export interface RepositorySummary {
  // 基本概要
  description: string;              // 1-2文でのプロジェクト説明
  oneLineSummary: string;          // 一行要約
  purpose: string;                 // 主な目的・解決する問題
  category: ProjectCategory;       // プロジェクトカテゴリ
  
  // ターゲット・機能
  targetUsers: string[];           // ターゲットユーザー
  keyFeatures: string[];           // 主要機能・特徴
  useCases: string[];             // 使用場面・用途
  
  // 技術的評価
  technicalComplexity: TechnicalComplexity;
  maintainabilityScore: number;    // 0-100
  codeQuality: CodeQuality;
  
  // プロジェクト状態
  maturityLevel: MaturityLevel;
  developmentStatus: DevelopmentStatus;
  
  // アーキテクチャ理解
  architecturePattern: string[];   // 使用されているアーキテクチャパターン
  designPrinciples: string[];      // 設計原則
  scalabilityAssessment: ScalabilityAssessment;
  
  // 改善提案
  recommendations: Recommendation[];
  potentialIssues: string[];       // 潜在的な問題
  
  // メタデータ
  analysisConfidence: number;      // 0-100
  lastAnalyzed: string;
}

export type ProjectCategory = 
  | 'web-application'     // Webアプリケーション
  | 'mobile-application'  // モバイルアプリ
  | 'desktop-application' // デスクトップアプリ
  | 'library'            // ライブラリ・フレームワーク
  | 'cli-tool'           // コマンドラインツール
  | 'api-service'        // API・サービス
  | 'development-tool'   // 開発ツール
  | 'game'              // ゲーム
  | 'documentation'     // ドキュメント・サイト
  | 'template'          // テンプレート・ボイラープレート
  | 'plugin'            // プラグイン・拡張
  | 'educational'       // 学習・チュートリアル
  | 'experiment'        // 実験・プロトタイプ
  | 'unknown';          // 不明

export type TechnicalComplexity = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface CodeQuality {
  score: number;                   // 0-100
  testCoverage: 'none' | 'low' | 'medium' | 'high';
  documentation: 'none' | 'basic' | 'good' | 'excellent';
  codeStyle: 'inconsistent' | 'basic' | 'good' | 'excellent';
  errorHandling: 'none' | 'basic' | 'good' | 'excellent';
  modularity: 'monolithic' | 'basic' | 'good' | 'excellent';
}

export type MaturityLevel = 
  | 'prototype'     // プロトタイプ
  | 'alpha'        // アルファ版
  | 'beta'         // ベータ版
  | 'stable'       // 安定版
  | 'mature'       // 成熟版
  | 'legacy';      // レガシー

export type DevelopmentStatus = 
  | 'active'       // 活発な開発
  | 'maintained'   // 保守中
  | 'stagnant'     // 停滞
  | 'abandoned';   // 放棄

export interface ScalabilityAssessment {
  score: number;                   // 0-100
  horizontalScaling: 'poor' | 'fair' | 'good' | 'excellent';
  verticalScaling: 'poor' | 'fair' | 'good' | 'excellent';
  performanceOptimization: 'none' | 'basic' | 'good' | 'excellent';
  caching: 'none' | 'basic' | 'good' | 'excellent';
}

export interface Recommendation {
  type: 'security' | 'performance' | 'maintainability' | 'architecture' | 'tooling';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
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
  phase: 'github-fetch' | 'file-analysis' | 'dependency-resolution' | 'ai-processing' | 'validation' | 'git-clone' | 'zip-upload' | 'local-analysis';
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