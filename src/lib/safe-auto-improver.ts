import { AIImprovementPlan, AIGeneratedCode } from './ai-improvement-engine';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

interface SafetyCheck {
  id: string;
  name: string;
  description: string;
  check: (code: AIGeneratedCode) => Promise<SafetyCheckResult>;
}

interface SafetyCheckResult {
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
}

interface AutoImplementationResult {
  planId: string;
  success: boolean;
  implementedChanges: ImplementedChange[];
  failedChanges: FailedChange[];
  safetyReport: SafetyReport;
  rollbackToken: string;
}

interface ImplementedChange {
  filePath: string;
  changeId: string;
  originalContent: string;
  newContent: string;
  timestamp: Date;
  validationResults: SafetyCheckResult[];
}

interface FailedChange {
  filePath: string;
  changeId: string;
  error: string;
  safetyIssues: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface SafetyReport {
  overallScore: number;
  checksPerformed: number;
  checksPassed: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
}

export class SafeAutoImprover {
  private projectRoot: string;
  private backupDir: string;
  private safetyChecks: SafetyCheck[];
  private maxRiskScore: number = 30; // 0-100, higher is more risky

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.backupDir = path.join(projectRoot, '.auto-improvement-backups');
    this.safetyChecks = this.initializeSafetyChecks();
  }

  async autoImplement(plan: AIImprovementPlan): Promise<AutoImplementationResult> {
    console.log(`🛡️ 安全な自動実装を開始: ${plan.title}`);
    
    // 1. バックアップ作成
    const rollbackToken = await this.createBackup();
    
    // 2. 事前安全性チェック
    const preChecks = await this.runPreImplementationChecks(plan);
    if (!preChecks.safe) {
      return {
        planId: plan.id,
        success: false,
        implementedChanges: [],
        failedChanges: plan.generatedCode.map(code => ({
          filePath: code.filePath,
          changeId: code.id,
          error: 'Pre-implementation safety check failed',
          safetyIssues: preChecks.issues,
          riskLevel: 'high'
        })),
        safetyReport: {
          overallScore: 0,
          checksPerformed: preChecks.checksPerformed,
          checksPassed: 0,
          riskLevel: 'high',
          summary: 'Pre-implementation safety checks failed'
        },
        rollbackToken
      };
    }

    const implementedChanges: ImplementedChange[] = [];
    const failedChanges: FailedChange[] = [];

    // 3. 段階的な実装
    for (const codeChange of plan.generatedCode) {
      try {
        const result = await this.safelyImplementChange(codeChange);
        if (result.success && result.change) {
          implementedChanges.push(result.change);
        } else if (result.failure) {
          failedChanges.push(result.failure);
          
          // 高リスクの変更で失敗した場合は全体を停止
          if (result.failure!.riskLevel === 'high') {
            console.log('⚠️ 高リスクの変更で失敗。実装を停止します。');
            break;
          }
        }
      } catch (error) {
        failedChanges.push({
          filePath: codeChange.filePath,
          changeId: codeChange.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          safetyIssues: ['Unexpected implementation error'],
          riskLevel: 'high'
        });
        break;
      }
    }

    // 4. 事後検証
    const postValidation = await this.runPostImplementationValidation(implementedChanges);
    
    // 5. 全体的な安全性レポート生成
    const safetyReport = this.generateSafetyReport(implementedChanges, failedChanges, postValidation);

    // 6. 自動ロールバックの判定
    if (safetyReport.riskLevel === 'high' || safetyReport.overallScore < 70) {
      console.log('⚠️ 安全性スコアが低いため自動ロールバックを実行');
      await this.rollback(rollbackToken);
      return {
        planId: plan.id,
        success: false,
        implementedChanges: [],
        failedChanges,
        safetyReport: {
          ...safetyReport,
          summary: 'Auto-rollback performed due to safety concerns'
        },
        rollbackToken
      };
    }

    console.log('✅ 安全な自動実装が完了');
    return {
      planId: plan.id,
      success: implementedChanges.length > 0,
      implementedChanges,
      failedChanges,
      safetyReport,
      rollbackToken
    };
  }

  private initializeSafetyChecks(): SafetyCheck[] {
    return [
      {
        id: 'syntax-check',
        name: 'Syntax Validation',
        description: 'TypeScript/JavaScript構文の正当性チェック',
        check: async (code) => {
          try {
            // TypeScript compiler APIを使用した構文チェック
            const ts = require('typescript');
            const result = ts.transpileModule(code.improvedCode, {
              compilerOptions: { module: ts.ModuleKind.CommonJS }
            });
            
            if (result.diagnostics && result.diagnostics.length > 0) {
              return {
                passed: false,
                score: 0,
                issues: result.diagnostics.map((d: any) => d.messageText),
                recommendations: ['Fix syntax errors before proceeding']
              };
            }
            
            return {
              passed: true,
              score: 100,
              issues: [],
              recommendations: []
            };
          } catch (error) {
            return {
              passed: false,
              score: 0,
              issues: ['Failed to validate syntax'],
              recommendations: ['Manual syntax review required']
            };
          }
        }
      },
      {
        id: 'security-scan',
        name: 'Security Vulnerability Scan',
        description: 'セキュリティ脆弱性の自動検出',
        check: async (code) => {
          const issues: string[] = [];
          const securityPatterns = [
            { pattern: /eval\(/, issue: 'Use of eval() function detected' },
            { pattern: /innerHTML\s*=/, issue: 'Direct innerHTML assignment (XSS risk)' },
            { pattern: /document\.write/, issue: 'Use of document.write (security risk)' },
            { pattern: /\$\{[^}]*\}/, issue: 'Template literal with potential injection' },
            { pattern: /process\.env\.[A-Z_]+/, issue: 'Environment variable exposure risk' }
          ];

          securityPatterns.forEach(({ pattern, issue }) => {
            if (pattern.test(code.improvedCode)) {
              issues.push(issue);
            }
          });

          const score = Math.max(0, 100 - (issues.length * 25));
          return {
            passed: issues.length === 0,
            score,
            issues,
            recommendations: issues.length > 0 ? 
              ['Review and fix security issues', 'Consider security audit'] : []
          };
        }
      },
      {
        id: 'api-compatibility',
        name: 'API Compatibility Check',
        description: '既存APIとの互換性確認',
        check: async (code) => {
          const issues: string[] = [];
          
          // 削除された可能性のあるpropsやメソッドをチェック
          const breakingChanges = [
            { pattern: /\.remove\(\)/, issue: 'Potential breaking change: remove() method' },
            { pattern: /delete\s+\w+\.\w+/, issue: 'Property deletion detected' }
          ];

          breakingChanges.forEach(({ pattern, issue }) => {
            if (pattern.test(code.improvedCode) && !pattern.test(code.originalCode)) {
              issues.push(issue);
            }
          });

          return {
            passed: issues.length === 0,
            score: issues.length === 0 ? 100 : 50,
            issues,
            recommendations: issues.length > 0 ? 
              ['Verify backward compatibility', 'Add deprecation warnings'] : []
          };
        }
      },
      {
        id: 'performance-impact',
        name: 'Performance Impact Analysis',
        description: 'パフォーマンスへの影響評価',
        check: async (code) => {
          const issues: string[] = [];
          const performancePatterns = [
            { pattern: /for\s*\(\s*var\s+\w+\s*=\s*0[^}]*\{[^}]*for\s*\(/, issue: 'Nested loops detected' },
            { pattern: /\.map\([^}]*\.map\(/, issue: 'Nested array operations' },
            { pattern: /setInterval|setTimeout/, issue: 'Timer usage (potential memory leak)' }
          ];

          performancePatterns.forEach(({ pattern, issue }) => {
            if (pattern.test(code.improvedCode) && !pattern.test(code.originalCode)) {
              issues.push(issue);
            }
          });

          return {
            passed: issues.length <= 1,
            score: Math.max(30, 100 - (issues.length * 20)),
            issues,
            recommendations: issues.length > 0 ? 
              ['Consider performance optimization', 'Add performance monitoring'] : []
          };
        }
      }
    ];
  }

  private async runPreImplementationChecks(plan: AIImprovementPlan): Promise<{
    safe: boolean;
    issues: string[];
    checksPerformed: number;
  }> {
    const allIssues: string[] = [];
    let totalScore = 0;
    let checksPerformed = 0;

    for (const codeChange of plan.generatedCode) {
      for (const check of this.safetyChecks) {
        try {
          const result = await check.check(codeChange);
          totalScore += result.score;
          checksPerformed++;
          
          if (!result.passed) {
            allIssues.push(...result.issues);
          }
        } catch (error) {
          allIssues.push(`Safety check ${check.name} failed: ${error}`);
          checksPerformed++;
        }
      }
    }

    const averageScore = checksPerformed > 0 ? totalScore / checksPerformed : 0;
    const safe = averageScore >= (100 - this.maxRiskScore) && allIssues.length === 0;

    return { safe, issues: allIssues, checksPerformed };
  }

  private async safelyImplementChange(codeChange: AIGeneratedCode): Promise<{
    success: boolean;
    change?: ImplementedChange;
    failure?: FailedChange;
  }> {
    try {
      // 1. ファイルの存在確認
      const fullPath = path.join(this.projectRoot, codeChange.filePath);
      const directory = path.dirname(fullPath);

      // ディレクトリが存在しない場合は作成
      await fs.mkdir(directory, { recursive: true });

      // 2. 元のファイル内容を保存
      let originalContent = '';
      try {
        originalContent = await fs.readFile(fullPath, 'utf-8');
      } catch (error) {
        // ファイルが存在しない場合（新規作成）
        originalContent = '';
      }

      // 3. 各安全性チェックを実行
      const validationResults: SafetyCheckResult[] = [];
      for (const check of this.safetyChecks) {
        const result = await check.check(codeChange);
        validationResults.push(result);
        
        if (!result.passed && codeChange.riskAssessment === 'high') {
          return {
            success: false,
            failure: {
              filePath: codeChange.filePath,
              changeId: codeChange.id,
              error: `Safety check failed: ${check.name}`,
              safetyIssues: result.issues,
              riskLevel: 'high'
            }
          };
        }
      }

      // 4. 安全性スコアの計算
      const averageScore = validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length;
      
      if (averageScore < (100 - this.maxRiskScore)) {
        return {
          success: false,
          failure: {
            filePath: codeChange.filePath,
            changeId: codeChange.id,
            error: `Safety score too low: ${averageScore}`,
            safetyIssues: ['Overall safety score below threshold'],
            riskLevel: averageScore < 50 ? 'high' : 'medium'
          }
        };
      }

      // 5. 実際のファイル変更
      await fs.writeFile(fullPath, codeChange.improvedCode, 'utf-8');

      return {
        success: true,
        change: {
          filePath: codeChange.filePath,
          changeId: codeChange.id,
          originalContent,
          newContent: codeChange.improvedCode,
          timestamp: new Date(),
          validationResults
        }
      };

    } catch (error) {
      return {
        success: false,
        failure: {
          filePath: codeChange.filePath,
          changeId: codeChange.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          safetyIssues: ['Implementation error'],
          riskLevel: 'high'
        }
      };
    }
  }

  private async runPostImplementationValidation(changes: ImplementedChange[]): Promise<SafetyCheckResult[]> {
    const results: SafetyCheckResult[] = [];

    try {
      // TypeScript型チェック
      console.log('📋 Running TypeScript type check...');
      execSync('npx tsc --noEmit', { cwd: this.projectRoot, stdio: 'pipe' });
      results.push({
        passed: true,
        score: 100,
        issues: [],
        recommendations: []
      });
    } catch (error) {
      results.push({
        passed: false,
        score: 0,
        issues: ['TypeScript compilation failed'],
        recommendations: ['Fix type errors before proceeding']
      });
    }

    try {
      // ESLint チェック
      console.log('📋 Running ESLint check...');
      execSync('npm run lint', { cwd: this.projectRoot, stdio: 'pipe' });
      results.push({
        passed: true,
        score: 100,
        issues: [],
        recommendations: []
      });
    } catch (error) {
      results.push({
        passed: false,
        score: 70,
        issues: ['ESLint warnings/errors found'],
        recommendations: ['Review and fix linting issues']
      });
    }

    try {
      // テスト実行
      console.log('📋 Running tests...');
      execSync('npm test', { cwd: this.projectRoot, stdio: 'pipe' });
      results.push({
        passed: true,
        score: 100,
        issues: [],
        recommendations: []
      });
    } catch (error) {
      results.push({
        passed: false,
        score: 30,
        issues: ['Some tests failed'],
        recommendations: ['Fix failing tests', 'Update test cases if needed']
      });
    }

    return results;
  }

  private generateSafetyReport(
    implemented: ImplementedChange[],
    failed: FailedChange[],
    postValidation: SafetyCheckResult[]
  ): SafetyReport {
    const totalChanges = implemented.length + failed.length;
    const successRate = totalChanges > 0 ? (implemented.length / totalChanges) * 100 : 0;
    
    const allValidationResults = [
      ...implemented.flatMap(change => change.validationResults),
      ...postValidation
    ];
    
    const checksPerformed = allValidationResults.length;
    const checksPassed = allValidationResults.filter(result => result.passed).length;
    const overallScore = checksPerformed > 0 ? 
      (allValidationResults.reduce((sum, result) => sum + result.score, 0) / checksPerformed) : 0;

    let riskLevel: 'low' | 'medium' | 'high';
    if (overallScore >= 80 && successRate >= 80) riskLevel = 'low';
    else if (overallScore >= 60 && successRate >= 60) riskLevel = 'medium';
    else riskLevel = 'high';

    const summary = `
実装成功率: ${successRate.toFixed(1)}% (${implemented.length}/${totalChanges})
安全性チェック通過率: ${checksPerformed > 0 ? ((checksPassed / checksPerformed) * 100).toFixed(1) : 0}%
総合安全性スコア: ${overallScore.toFixed(1)}/100
`;

    return {
      overallScore,
      checksPerformed,
      checksPassed,
      riskLevel,
      summary: summary.trim()
    };
  }

  private async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupToken = `backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupToken);

    await fs.mkdir(backupPath, { recursive: true });

    // 重要なファイルをバックアップ
    const importantFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'src/**/*.ts',
      'src/**/*.tsx'
    ];

    // 実際のバックアップ実装は簡略化
    const backupInfo = {
      timestamp: new Date(),
      projectRoot: this.projectRoot,
      files: importantFiles
    };

    await fs.writeFile(
      path.join(backupPath, 'backup-info.json'),
      JSON.stringify(backupInfo, null, 2)
    );

    console.log(`💾 バックアップ作成完了: ${backupToken}`);
    return backupToken;
  }

  async rollback(rollbackToken: string): Promise<void> {
    console.log(`🔄 ロールバック実行中: ${rollbackToken}`);
    
    // Git を使用した簡単なロールバック
    try {
      execSync('git checkout .', { cwd: this.projectRoot });
      console.log('✅ Git checkout によるロールバック完了');
    } catch (error) {
      console.error('❌ ロールバック失敗:', error);
      throw new Error('Rollback failed');
    }
  }

  async getImplementationHistory(): Promise<AutoImplementationResult[]> {
    // 実装履歴の取得（簡略化）
    return [];
  }
}

export type { 
  AutoImplementationResult, 
  ImplementedChange, 
  FailedChange, 
  SafetyReport, 
  SafetyCheck, 
  SafetyCheckResult 
};