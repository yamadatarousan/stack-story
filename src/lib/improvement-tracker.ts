import { AutoImplementationResult, ImplementedChange } from './safe-auto-improver';
import { AIImprovementPlan } from './ai-improvement-engine';
import type { SelfAnalysisResult } from './self-analyzer';
import fs from 'fs/promises';
import path from 'path';

interface ImprovementMetrics {
  id: string;
  timestamp: Date;
  category: 'performance' | 'security' | 'ux' | 'code-quality' | 'feature' | 'architecture';
  
  // 実装前メトリクス
  beforeMetrics: {
    buildTime?: number; // seconds
    bundleSize?: number; // bytes
    testCoverage?: number; // percentage
    lintErrors?: number;
    typeErrors?: number;
    securityIssues?: number;
    performanceScore?: number; // lighthouse score
    maintainabilityIndex?: number; // 0-100
  };
  
  // 実装後メトリクス
  afterMetrics: {
    buildTime?: number;
    bundleSize?: number;
    testCoverage?: number;
    lintErrors?: number;
    typeErrors?: number;
    securityIssues?: number;
    performanceScore?: number;
    maintainabilityIndex?: number;
  };
  
  // 改善効果
  improvements: {
    [key: string]: {
      absolute: number;
      percentage: number;
      significance: 'low' | 'medium' | 'high';
    };
  };
  
  implementationResult: AutoImplementationResult;
  userFeedback?: UserFeedback;
}

interface UserFeedback {
  rating: 1 | 2 | 3 | 4 | 5; // 1=poor, 5=excellent
  comments: string;
  helpfulness: 1 | 2 | 3 | 4 | 5;
  wouldRecommend: boolean;
  specificIssues?: string[];
  timestamp: Date;
}

interface ImprovementTrend {
  metric: string;
  dataPoints: Array<{
    timestamp: Date;
    value: number;
    improvement: boolean;
  }>;
  trend: 'improving' | 'stable' | 'declining';
  averageImprovement: number; // percentage per month
}

interface AISelfLearning {
  patternId: string;
  pattern: string;
  successRate: number;
  averageImpact: number;
  contexts: Array<{
    projectType: string;
    techStack: string[];
    outcome: 'success' | 'failure' | 'mixed';
  }>;
  recommendations: string[];
  confidence: number; // 0-1
}

export class ImprovementTracker {
  private dataDir: string;
  private metricsFile: string;
  private trendsFile: string;
  private learningFile: string;

  constructor(projectRoot: string = process.cwd()) {
    this.dataDir = path.join(projectRoot, '.improvement-data');
    this.metricsFile = path.join(this.dataDir, 'metrics.json');
    this.trendsFile = path.join(this.dataDir, 'trends.json');
    this.learningFile = path.join(this.dataDir, 'ai-learning.json');
  }

  async trackImprovement(
    plan: AIImprovementPlan,
    result: AutoImplementationResult,
    beforeAnalysis: SelfAnalysisResult,
    afterAnalysis?: SelfAnalysisResult
  ): Promise<string> {
    console.log('📊 改善効果の測定を開始...');

    const metricsId = `metrics-${Date.now()}`;
    
    // 実装前メトリクスの収集
    const beforeMetrics = await this.collectCurrentMetrics();
    
    // 実装後メトリクスの収集（実装が成功した場合のみ）
    let afterMetrics = beforeMetrics;
    if (result.success && afterAnalysis) {
      afterMetrics = await this.collectCurrentMetrics();
    }

    // 改善効果の計算
    const improvements = this.calculateImprovements(beforeMetrics, afterMetrics);

    const metrics: ImprovementMetrics = {
      id: metricsId,
      timestamp: new Date(),
      category: this.extractCategory(plan),
      beforeMetrics,
      afterMetrics,
      improvements,
      implementationResult: result
    };

    // メトリクスの保存
    await this.saveMetrics(metrics);

    // トレンドデータの更新
    await this.updateTrends(metrics);

    // AI学習データの更新
    await this.updateAILearning(plan, result, improvements);

    console.log('✅ 改善効果の測定完了');
    return metricsId;
  }

  private async collectCurrentMetrics(): Promise<ImprovementMetrics['beforeMetrics']> {
    const metrics: ImprovementMetrics['beforeMetrics'] = {};

    try {
      // ビルド時間の測定
      const buildStart = Date.now();
      const { execSync } = require('child_process');
      execSync('npm run build', { stdio: 'pipe' });
      metrics.buildTime = (Date.now() - buildStart) / 1000;
    } catch (error) {
      console.warn('Build time measurement failed');
    }

    try {
      // バンドルサイズの測定
      const nextDir = path.join(process.cwd(), '.next');
      const stats = await fs.stat(path.join(nextDir, 'static'));
      metrics.bundleSize = await this.calculateDirectorySize(path.join(nextDir, 'static'));
    } catch (error) {
      console.warn('Bundle size measurement failed');
    }

    try {
      // TypeScriptエラーの数
      const { execSync } = require('child_process');
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      metrics.typeErrors = 0;
    } catch (error: any) {
      const errorOutput = error.stdout?.toString() || '';
      const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
      metrics.typeErrors = errorCount;
    }

    try {
      // ESLintエラーの数
      const { execSync } = require('child_process');
      const lintOutput = execSync('npm run lint', { encoding: 'utf8' });
      metrics.lintErrors = 0; // no errors if successful
    } catch (error: any) {
      const errorOutput = error.stdout?.toString() || '';
      const errorCount = (errorOutput.match(/✖/g) || []).length;
      metrics.lintErrors = errorCount;
    }

    // 保守性指標の計算（簡略化）
    metrics.maintainabilityIndex = await this.calculateMaintainabilityIndex();

    return metrics;
  }

  private calculateImprovements(
    before: ImprovementMetrics['beforeMetrics'],
    after: ImprovementMetrics['afterMetrics']
  ): ImprovementMetrics['improvements'] {
    const improvements: ImprovementMetrics['improvements'] = {};

    const metrics = ['buildTime', 'bundleSize', 'typeErrors', 'lintErrors'] as const;
    
    metrics.forEach(metric => {
      const beforeValue = before[metric];
      const afterValue = after[metric];
      
      if (typeof beforeValue === 'number' && typeof afterValue === 'number') {
        const absolute = beforeValue - afterValue; // 正の値が改善
        const percentage = beforeValue !== 0 ? (absolute / beforeValue) * 100 : 0;
        
        let significance: 'low' | 'medium' | 'high' = 'low';
        if (Math.abs(percentage) > 20) significance = 'high';
        else if (Math.abs(percentage) > 10) significance = 'medium';

        improvements[metric] = {
          absolute,
          percentage,
          significance
        };
      }
    });

    return improvements;
  }

  private async calculateDirectorySize(dirPath: string): Promise<number> {
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          totalSize += await this.calculateDirectorySize(filePath);
        } else {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  private async calculateMaintainabilityIndex(): Promise<number> {
    // 簡略化された保守性指標
    // 実際にはコードの複雑度、結合度、テストカバレッジなどを総合的に評価
    try {
      const srcDir = path.join(process.cwd(), 'src');
      const files = await this.getSourceFiles(srcDir);
      
      let totalComplexity = 0;
      let totalFiles = 0;

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const complexity = this.calculateCyclomaticComplexity(content);
        totalComplexity += complexity;
        totalFiles++;
      }

      const averageComplexity = totalFiles > 0 ? totalComplexity / totalFiles : 0;
      
      // 複雑度を0-100のスケールに変換（低い複雑度 = 高い保守性）
      return Math.max(0, 100 - (averageComplexity * 10));
    } catch (error) {
      return 50; // デフォルト値
    }
  }

  private async getSourceFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.startsWith('.')) {
          files.push(...await this.getSourceFiles(fullPath));
        } else if (item.isFile() && /\.(ts|tsx|js|jsx)$/.test(item.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // ディレクトリアクセスエラーを無視
    }
    return files;
  }

  private calculateCyclomaticComplexity(code: string): number {
    // 簡略化されたサイクロマティック複雑度計算
    const complexityKeywords = [
      'if', 'else', 'for', 'while', 'do', 'switch', 'case',
      'catch', 'try', '&&', '||', '?'
    ];
    
    let complexity = 1; // ベース複雑度
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  private extractCategory(plan: AIImprovementPlan): ImprovementMetrics['category'] {
    // プラン内容から主要カテゴリを推定
    const title = plan.title.toLowerCase();
    
    if (title.includes('performance') || title.includes('パフォーマンス')) return 'performance';
    if (title.includes('security') || title.includes('セキュリティ')) return 'security';
    if (title.includes('ux') || title.includes('ユーザー')) return 'ux';
    if (title.includes('quality') || title.includes('品質')) return 'code-quality';
    if (title.includes('architecture') || title.includes('アーキテクチャ')) return 'architecture';
    
    return 'feature';
  }

  private async saveMetrics(metrics: ImprovementMetrics): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    
    // 既存メトリクスの読み込み
    let existingMetrics: ImprovementMetrics[] = [];
    try {
      const data = await fs.readFile(this.metricsFile, 'utf-8');
      existingMetrics = JSON.parse(data);
    } catch (error) {
      // ファイルが存在しない場合は新規作成
    }

    // 新しいメトリクスを追加
    existingMetrics.push(metrics);
    
    // 古いデータの削除（100件まで保持）
    if (existingMetrics.length > 100) {
      existingMetrics = existingMetrics.slice(-100);
    }

    await fs.writeFile(this.metricsFile, JSON.stringify(existingMetrics, null, 2));
  }

  private async updateTrends(metrics: ImprovementMetrics): Promise<void> {
    let trends: ImprovementTrend[] = [];
    
    try {
      const data = await fs.readFile(this.trendsFile, 'utf-8');
      trends = JSON.parse(data);
    } catch (error) {
      // ファイルが存在しない場合は新規作成
    }

    // 各メトリクスのトレンドを更新
    Object.keys(metrics.afterMetrics).forEach(metricName => {
      const value = metrics.afterMetrics[metricName as keyof typeof metrics.afterMetrics];
      if (typeof value === 'number') {
        let trend = trends.find(t => t.metric === metricName);
        
        if (!trend) {
          trend = {
            metric: metricName,
            dataPoints: [],
            trend: 'stable',
            averageImprovement: 0
          };
          trends.push(trend);
        }

        // データポイントを追加
        const improvement = this.isImprovementMetric(metricName, metrics.improvements[metricName]);
        trend.dataPoints.push({
          timestamp: metrics.timestamp,
          value,
          improvement
        });

        // 最新30データポイントのみ保持
        if (trend.dataPoints.length > 30) {
          trend.dataPoints = trend.dataPoints.slice(-30);
        }

        // トレンドの計算
        trend.trend = this.calculateTrend(trend.dataPoints);
        trend.averageImprovement = this.calculateAverageImprovement(trend.dataPoints);
      }
    });

    await fs.writeFile(this.trendsFile, JSON.stringify(trends, null, 2));
  }

  private isImprovementMetric(metricName: string, improvementData?: any): boolean {
    if (!improvementData) return false;
    
    // 減少が改善とされるメトリクス
    const decreaseIsGood = ['buildTime', 'bundleSize', 'typeErrors', 'lintErrors', 'securityIssues'];
    
    if (decreaseIsGood.includes(metricName)) {
      return improvementData.absolute > 0; // 減少 = 改善
    } else {
      return improvementData.absolute > 0; // 増加 = 改善
    }
  }

  private calculateTrend(dataPoints: Array<{ timestamp: Date; value: number; improvement: boolean }>): 'improving' | 'stable' | 'declining' {
    if (dataPoints.length < 3) return 'stable';

    const recentPoints = dataPoints.slice(-5); // 最新5ポイント
    const improvements = recentPoints.filter(p => p.improvement).length;
    const declines = recentPoints.length - improvements;

    if (improvements > declines * 1.5) return 'improving';
    if (declines > improvements * 1.5) return 'declining';
    return 'stable';
  }

  private calculateAverageImprovement(dataPoints: Array<{ timestamp: Date; value: number }>): number {
    if (dataPoints.length < 2) return 0;

    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];
    const timeDiffMonths = (last.timestamp.getTime() - first.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (timeDiffMonths === 0) return 0;
    
    const valueChange = ((last.value - first.value) / first.value) * 100;
    return valueChange / timeDiffMonths;
  }

  private async updateAILearning(
    plan: AIImprovementPlan,
    result: AutoImplementationResult,
    improvements: ImprovementMetrics['improvements']
  ): Promise<void> {
    let learningData: AISelfLearning[] = [];
    
    try {
      const data = await fs.readFile(this.learningFile, 'utf-8');
      learningData = JSON.parse(data);
    } catch (error) {
      // ファイルが存在しない場合は新規作成
    }

    // パターンの特定
    const patternId = this.extractPattern(plan);
    let learning = learningData.find(l => l.patternId === patternId);
    
    if (!learning) {
      learning = {
        patternId,
        pattern: plan.description,
        successRate: 0,
        averageImpact: 0,
        contexts: [],
        recommendations: [],
        confidence: 0
      };
      learningData.push(learning);
    }

    // 成功率の更新
    const totalContexts = learning.contexts.length + 1;
    const successCount = learning.contexts.filter(c => c.outcome === 'success').length + 
                         (result.success ? 1 : 0);
    learning.successRate = successCount / totalContexts;

    // 影響度の更新
    const currentImpact = this.calculateOverallImpact(improvements);
    learning.averageImpact = ((learning.averageImpact * learning.contexts.length) + currentImpact) / totalContexts;

    // コンテキストの追加
    learning.contexts.push({
      projectType: 'web-app', // 実際にはプロジェクト分析から取得
      techStack: ['Next.js', 'TypeScript', 'React'], // 実際には分析結果から取得
      outcome: result.success ? 'success' : 'failure'
    });

    // 最新20コンテキストのみ保持
    if (learning.contexts.length > 20) {
      learning.contexts = learning.contexts.slice(-20);
    }

    // 信頼度の計算
    learning.confidence = Math.min(1, learning.contexts.length / 10) * learning.successRate;

    // 推奨事項の更新
    learning.recommendations = this.generateLearningBasedRecommendations(learning);

    await fs.writeFile(this.learningFile, JSON.stringify(learningData, null, 2));
  }

  private extractPattern(plan: AIImprovementPlan): string {
    // プランの内容からパターンIDを生成
    const title = plan.title.toLowerCase();
    if (title.includes('performance')) return 'perf-optimization';
    if (title.includes('security')) return 'security-hardening';
    if (title.includes('component')) return 'component-refactor';
    if (title.includes('bundle')) return 'bundle-optimization';
    if (title.includes('typescript')) return 'type-safety';
    return 'generic-improvement';
  }

  private calculateOverallImpact(improvements: ImprovementMetrics['improvements']): number {
    const impacts = Object.values(improvements).map(imp => Math.abs(imp.percentage));
    return impacts.length > 0 ? impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length : 0;
  }

  private generateLearningBasedRecommendations(learning: AISelfLearning): string[] {
    const recommendations: string[] = [];
    
    if (learning.successRate > 0.8) {
      recommendations.push('このパターンは高い成功率を示しています。積極的に適用できます。');
    } else if (learning.successRate < 0.5) {
      recommendations.push('このパターンの成功率が低いため、慎重な検討が必要です。');
    }

    if (learning.averageImpact > 20) {
      recommendations.push('大きな改善効果が期待できるパターンです。');
    } else if (learning.averageImpact < 5) {
      recommendations.push('改善効果は限定的です。他の改善手法も検討してください。');
    }

    if (learning.confidence < 0.3) {
      recommendations.push('データが不足しています。慎重に実行し、結果を記録してください。');
    }

    return recommendations;
  }

  async addUserFeedback(metricsId: string, feedback: UserFeedback): Promise<void> {
    try {
      const data = await fs.readFile(this.metricsFile, 'utf-8');
      const metrics: ImprovementMetrics[] = JSON.parse(data);
      
      const metric = metrics.find(m => m.id === metricsId);
      if (metric) {
        metric.userFeedback = feedback;
        await fs.writeFile(this.metricsFile, JSON.stringify(metrics, null, 2));
      }
    } catch (error) {
      console.error('Failed to add user feedback:', error);
    }
  }

  async getMetricsSummary(): Promise<{
    totalImprovements: number;
    successRate: number;
    averageImpact: number;
    topCategories: Array<{ category: string; count: number; avgImpact: number }>;
    recentTrends: ImprovementTrend[];
  }> {
    try {
      const metricsData = await fs.readFile(this.metricsFile, 'utf-8');
      const metrics: ImprovementMetrics[] = JSON.parse(metricsData);
      
      const trendsData = await fs.readFile(this.trendsFile, 'utf-8');
      const trends: ImprovementTrend[] = JSON.parse(trendsData);

      const totalImprovements = metrics.length;
      const successfulImprovements = metrics.filter(m => m.implementationResult.success).length;
      const successRate = totalImprovements > 0 ? successfulImprovements / totalImprovements : 0;

      const impacts = metrics.map(m => this.calculateOverallImpact(m.improvements));
      const averageImpact = impacts.length > 0 ? impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length : 0;

      // カテゴリ別統計
      const categoryStats = new Map();
      metrics.forEach(m => {
        if (!categoryStats.has(m.category)) {
          categoryStats.set(m.category, { count: 0, totalImpact: 0 });
        }
        const stats = categoryStats.get(m.category);
        stats.count++;
        stats.totalImpact += this.calculateOverallImpact(m.improvements);
      });

      const topCategories = Array.from(categoryStats.entries()).map(([category, stats]) => ({
        category,
        count: stats.count,
        avgImpact: stats.count > 0 ? stats.totalImpact / stats.count : 0
      })).sort((a, b) => b.avgImpact - a.avgImpact);

      return {
        totalImprovements,
        successRate,
        averageImpact,
        topCategories,
        recentTrends: trends.slice(-10) // 最新10トレンド
      };
    } catch (error) {
      return {
        totalImprovements: 0,
        successRate: 0,
        averageImpact: 0,
        topCategories: [],
        recentTrends: []
      };
    }
  }
}

export type { 
  ImprovementMetrics, 
  UserFeedback, 
  ImprovementTrend, 
  AISelfLearning 
};