import { DeepAnalysisResult } from './deep-code-analyzer';
import { AnalysisResult } from '@/types';

interface NarrativeReport {
  executiveSummary: string;
  projectOverview: string;
  codeQualityAnalysis: string;
  architectureAnalysis: string;
  technologyAnalysis: string;
  securityAnalysis: string;
  performanceAnalysis: string;
  improvementRecommendations: string;
  prioritizedActionPlan: string;
  riskAssessment: string;
  modernizationRoadmap: string;
}

export class NarrativeReportGenerator {
  private deepAnalysis: DeepAnalysisResult;
  private basicAnalysis: AnalysisResult;

  constructor(deepAnalysis: DeepAnalysisResult, basicAnalysis: AnalysisResult) {
    this.deepAnalysis = deepAnalysis;
    this.basicAnalysis = basicAnalysis;
  }

  generateReport(): NarrativeReport {
    return {
      executiveSummary: this.generateExecutiveSummary(),
      projectOverview: this.generateProjectOverview(),
      codeQualityAnalysis: this.generateCodeQualityAnalysis(),
      architectureAnalysis: this.generateArchitectureAnalysis(),
      technologyAnalysis: this.generateTechnologyAnalysis(),
      securityAnalysis: this.generateSecurityAnalysis(),
      performanceAnalysis: this.generatePerformanceAnalysis(),
      improvementRecommendations: this.generateImprovementRecommendations(),
      prioritizedActionPlan: this.generatePrioritizedActionPlan(),
      riskAssessment: this.generateRiskAssessment(),
      modernizationRoadmap: this.generateModernizationRoadmap(),
    };
  }

  private generateExecutiveSummary(): string {
    const functionCount = this.deepAnalysis.codeStructure.functions.length;
    const classCount = this.deepAnalysis.codeStructure.classes.length;
    const moduleCount = this.deepAnalysis.codeStructure.modules.length;
    const totalIssues = this.getTotalIssueCount();
    const criticalIssues = this.getCriticalIssueCount();
    const maintainabilityScore = this.calculateOverallMaintainabilityScore();

    let summary = `## エグゼクティブサマリー\n\n`;
    
    summary += `このプロジェクト「${this.basicAnalysis.repository.name}」は、`;
    summary += `${functionCount}個の関数、${classCount}個のクラス、${moduleCount}個のモジュールから構成される`;
    summary += `${this.inferProjectScale(functionCount, classCount)}規模のソフトウェアです。\n\n`;

    // 品質評価
    if (maintainabilityScore >= 80) {
      summary += `**品質評価: 優秀（${maintainabilityScore}/100）**\n`;
      summary += `コードの品質は非常に高く、適切な設計原則に従って開発されています。`;
    } else if (maintainabilityScore >= 60) {
      summary += `**品質評価: 良好（${maintainabilityScore}/100）**\n`;
      summary += `コードの品質は標準的ですが、いくつかの改善の余地があります。`;
    } else {
      summary += `**品質評価: 要改善（${maintainabilityScore}/100）**\n`;
      summary += `コードの品質に重要な課題があり、積極的な改善が必要です。`;
    }

    summary += `\n\n`;

    // 重要な問題の概要
    if (criticalIssues > 0) {
      summary += `**⚠️ 緊急対応が必要：** ${criticalIssues}個の高優先度問題が検出されました。`;
      summary += `これらは直ちに対処することで、システムの安定性とセキュリティを向上させることができます。\n\n`;
    }

    // 強みの要約
    const strengths = this.deepAnalysis.insights.strengths;
    if (strengths.length > 0) {
      summary += `**主な強み：** ${strengths.slice(0, 2).join('、')}`;
      if (strengths.length > 2) summary += `など`;
      summary += `\n\n`;
    }

    // 改善機会の要約
    const opportunities = this.deepAnalysis.insights.opportunities;
    if (opportunities.length > 0) {
      summary += `**改善機会：** ${opportunities.slice(0, 2).join('、')}`;
      if (opportunities.length > 2) summary += `など`;
      summary += `により、さらなる品質向上が期待できます。\n\n`;
    }

    summary += `総合的に、このプロジェクトは`;
    if (totalIssues === 0) {
      summary += `優秀な状態にあり、継続的な保守により高い品質を維持できています。`;
    } else if (totalIssues <= 10) {
      summary += `良好な状態にあり、軽微な改善により更なる向上が期待できます。`;
    } else {
      summary += `改善の余地があり、計画的なリファクタリングにより品質を大幅に向上させることができます。`;
    }

    return summary;
  }

  private generateProjectOverview(): string {
    const language = this.basicAnalysis.structure.language;
    const projectType = this.basicAnalysis.structure.type;
    const hasTests = this.basicAnalysis.structure.hasTests;
    const hasCI = this.basicAnalysis.structure.hasCI;
    const hasDocumentation = this.basicAnalysis.structure.hasDocumentation;

    let overview = `## プロジェクト概要\n\n`;
    
    overview += `「${this.basicAnalysis.repository.name}」は、${language}で開発された`;
    overview += `${this.getProjectTypeDescription(projectType)}です。`;
    
    if (this.basicAnalysis.repository.description) {
      overview += `\n\nプロジェクトの説明：${this.basicAnalysis.repository.description}\n`;
    }

    overview += `\n### 開発環境・ツール評価\n\n`;

    // テスト環境の評価
    if (hasTests) {
      overview += `✅ **テスト環境：** 適切にテストが実装されており、品質保証の基盤が整備されています。`;
      overview += `これにより、コードの変更時の回帰テストが可能で、安定した開発が行えています。\n\n`;
    } else {
      overview += `⚠️ **テスト環境：** テストが実装されていないため、コードの品質保証に課題があります。`;
      overview += `単体テストや統合テストの導入により、バグの早期発見と品質向上が期待できます。\n\n`;
    }

    // CI/CD の評価
    if (hasCI) {
      overview += `✅ **CI/CD：** 継続的インテグレーションが設定されており、自動化された開発フローが確立されています。`;
      overview += `これにより、コードの品質チェックとデプロイメントが効率化されています。\n\n`;
    } else {
      overview += `📝 **CI/CD：** 継続的インテグレーションが未設定です。`;
      overview += `GitHub ActionsやCI/CDパイプラインの導入により、開発効率とコード品質を大幅に向上させることができます。\n\n`;
    }

    // ドキュメント化の評価
    if (hasDocumentation) {
      overview += `📚 **ドキュメント：** プロジェクトの文書化が行われており、新規開発者の参加や保守性の向上に寄与しています。`;
    } else {
      overview += `📝 **ドキュメント：** プロジェクトの文書化が不十分です。`;
      overview += `README、API文書、アーキテクチャ図の整備により、チーム開発の効率性を向上させることができます。`;
    }

    overview += `\n\n### プロジェクトの成熟度\n\n`;
    overview += this.assessProjectMaturity();

    return overview;
  }

  private generateCodeQualityAnalysis(): string {
    const codeSmells = this.deepAnalysis.qualityIssues.codeSmells;
    const functions = this.deepAnalysis.codeStructure.functions;
    const modules = this.deepAnalysis.codeStructure.modules;

    let analysis = `## コード品質分析\n\n`;

    // 全体的な品質評価
    const avgComplexity = functions.length > 0 
      ? functions.reduce((sum, f) => sum + f.complexity, 0) / functions.length 
      : 0;
    const avgCoupling = modules.length > 0
      ? modules.reduce((sum, m) => sum + m.coupling, 0) / modules.length
      : 0;

    analysis += `### 全体的なコード品質\n\n`;
    
    if (avgComplexity <= 5) {
      analysis += `**関数の複雑度：良好**\n`;
      analysis += `平均複雑度は${avgComplexity.toFixed(1)}と適切なレベルにあります。`;
      analysis += `関数が適切に分割され、理解しやすいコードが書かれています。`;
      analysis += `このレベルの複雑度は保守性が高く、新規開発者でも容易に理解できる状態です。\n\n`;
    } else if (avgComplexity <= 10) {
      analysis += `**関数の複雑度：注意が必要**\n`;
      analysis += `平均複雑度は${avgComplexity.toFixed(1)}とやや高めです。`;
      analysis += `一部の関数が複雑になっている可能性があり、リファクタリングを検討することをお勧めします。`;
      analysis += `複雑な関数を小さな関数に分割することで、可読性と保守性を向上させることができます。\n\n`;
    } else {
      analysis += `**関数の複雑度：要改善**\n`;
      analysis += `平均複雑度は${avgComplexity.toFixed(1)}と高く、重要な改善が必要です。`;
      analysis += `複雑な関数はバグの温床となりやすく、保守コストの増大を招きます。`;
      analysis += `緊急的にリファクタリングを行い、関数を適切なサイズに分割することを強く推奨します。\n\n`;
    }

    // モジュール結合度の評価
    if (avgCoupling <= 3) {
      analysis += `**モジュール結合度：優秀**\n`;
      analysis += `平均結合度は${avgCoupling.toFixed(1)}と低く、良好な設計がなされています。`;
      analysis += `モジュール間の依存関係が適切に管理され、疎結合な設計が実現されています。`;
      analysis += `この状態は変更の影響範囲を限定し、テストやデプロイメントを容易にします。\n\n`;
    } else if (avgCoupling <= 5) {
      analysis += `**モジュール結合度：標準的**\n`;
      analysis += `平均結合度は${avgCoupling.toFixed(1)}と一般的なレベルです。`;
      analysis += `モジュール間の依存関係は管理されていますが、一部で改善の余地があります。`;
      analysis += `依存関係の整理により、より保守しやすい設計に改善することができます。\n\n`;
    } else {
      analysis += `**モジュール結合度：要改善**\n`;
      analysis += `平均結合度は${avgCoupling.toFixed(1)}と高く、密結合な設計になっています。`;
      analysis += `これは変更の影響範囲を広げ、テストやデバッグを困難にします。`;
      analysis += `アーキテクチャの見直しと依存関係の整理が急務です。\n\n`;
    }

    // 具体的なコード品質問題
    analysis += `### 検出された品質問題\n\n`;
    
    const highSeveritySmells = codeSmells.filter(smell => smell.severity === 'high');
    const mediumSeveritySmells = codeSmells.filter(smell => smell.severity === 'medium');
    const lowSeveritySmells = codeSmells.filter(smell => smell.severity === 'low');

    if (highSeveritySmells.length > 0) {
      analysis += `**🔴 高優先度問題（${highSeveritySmells.length}件）**\n\n`;
      highSeveritySmells.slice(0, 3).forEach((smell, index) => {
        analysis += `${index + 1}. **${smell.type}** (${smell.file}:${smell.line})\n`;
        analysis += `   - 問題：${smell.description}\n`;
        analysis += `   - 理由：${this.explainWhyProblem(smell.type)}\n`;
        analysis += `   - 対策：${smell.suggestion}\n`;
        analysis += `   - 影響：${this.explainImpact(smell.type)}\n\n`;
      });
      if (highSeveritySmells.length > 3) {
        analysis += `*他に${highSeveritySmells.length - 3}件の高優先度問題があります。*\n\n`;
      }
    }

    if (mediumSeveritySmells.length > 0) {
      analysis += `**🟡 中優先度問題（${mediumSeveritySmells.length}件）**\n\n`;
      analysis += `中程度の品質問題が${mediumSeveritySmells.length}件検出されました。`;
      analysis += `これらは直ちに致命的ではありませんが、長期的な保守性に影響を与える可能性があります。`;
      analysis += `計画的に対処することで、コードの品質をさらに向上させることができます。\n\n`;
      
      const commonIssues = this.groupIssuesByType(mediumSeveritySmells);
      Object.entries(commonIssues).slice(0, 3).forEach(([type, count]) => {
        analysis += `- **${type}**: ${count}件 - ${this.getIssueDescription(type)}\n`;
      });
      analysis += `\n`;
    }

    if (lowSeveritySmells.length > 0) {
      analysis += `**🟢 低優先度問題（${lowSeveritySmells.length}件）**\n\n`;
      analysis += `軽微な品質問題が${lowSeveritySmells.length}件検出されました。`;
      analysis += `これらは現在の機能には影響しませんが、コードの統一性や可読性の向上に寄与します。`;
      analysis += `時間に余裕がある際に対処することをお勧めします。\n\n`;
    }

    if (codeSmells.length === 0) {
      analysis += `**✅ 品質問題なし**\n\n`;
      analysis += `自動検出により明らかなコード品質問題は発見されませんでした。`;
      analysis += `これは適切なコーディング規約に従って開発が行われていることを示しています。`;
      analysis += `継続的な品質維持のため、定期的なコードレビューとリファクタリングを推奨します。\n\n`;
    }

    return analysis;
  }

  private generateArchitectureAnalysis(): string {
    const functions = this.deepAnalysis.codeStructure.functions;
    const classes = this.deepAnalysis.codeStructure.classes;
    const modules = this.deepAnalysis.codeStructure.modules;

    let analysis = `## アーキテクチャ分析\n\n`;

    analysis += `### 設計構造の評価\n\n`;

    // 関数設計の分析
    const asyncFunctions = functions.filter(f => f.isAsync).length;
    const asyncRatio = functions.length > 0 ? (asyncFunctions / functions.length) * 100 : 0;

    if (asyncRatio > 50) {
      analysis += `**非同期処理設計：現代的**\n`;
      analysis += `関数の${asyncRatio.toFixed(1)}%が非同期処理を使用しており、現代的なアプリケーション設計が適用されています。`;
      analysis += `これにより、ブロッキングを回避し、ユーザー体験の向上とスループットの最適化が実現されています。`;
      analysis += `非同期処理の適切な活用は、スケーラブルなアプリケーションの重要な要素です。\n\n`;
    } else if (asyncRatio > 20) {
      analysis += `**非同期処理設計：部分的**\n`;
      analysis += `関数の${asyncRatio.toFixed(1)}%で非同期処理が使用されています。`;
      analysis += `必要な箇所では非同期処理が適用されていますが、さらなる活用により性能向上の余地があります。`;
      analysis += `I/O処理やネットワーク通信で非同期処理を増やすことで、アプリケーションの応答性を向上させることができます。\n\n`;
    } else {
      analysis += `**非同期処理設計：従来型**\n`;
      analysis += `非同期処理の使用率は${asyncRatio.toFixed(1)}%と限定的です。`;
      analysis += `現代的なアプリケーションでは、I/O処理やネットワーク通信において非同期処理の活用が重要です。`;
      analysis += `段階的に非同期処理を導入することで、アプリケーションの性能とユーザー体験を大幅に改善できます。\n\n`;
    }

    // クラス設計の分析
    if (classes.length > 0) {
      analysis += `### オブジェクト指向設計の評価\n\n`;
      
      const avgMethodsPerClass = classes.reduce((sum, c) => sum + c.methods.length, 0) / classes.length;
      const avgPropertiesPerClass = classes.reduce((sum, c) => sum + c.properties.length, 0) / classes.length;

      if (avgMethodsPerClass <= 10 && avgPropertiesPerClass <= 8) {
        analysis += `**クラス設計：良好**\n`;
        analysis += `クラスあたり平均${avgMethodsPerClass.toFixed(1)}メソッド、${avgPropertiesPerClass.toFixed(1)}プロパティと、`;
        analysis += `適切なサイズに設計されています。これは単一責任原則に従った良好な設計を示しています。`;
        analysis += `小さく焦点の絞られたクラスは、理解しやすく、テストしやすく、再利用しやすい特徴があります。\n\n`;
      } else {
        analysis += `**クラス設計：要改善**\n`;
        analysis += `クラスあたり平均${avgMethodsPerClass.toFixed(1)}メソッド、${avgPropertiesPerClass.toFixed(1)}プロパティと、`;
        analysis += `一部のクラスが大きくなりすぎている可能性があります。`;
        analysis += `大きなクラスは複数の責任を持ちがちで、保守性とテスト性を低下させます。`;
        analysis += `クラスの分割と責任の明確化により、より保守しやすい設計に改善することをお勧めします。\n\n`;
      }

      // 責務分析
      const responsibilityTypes = new Set();
      classes.forEach(cls => {
        cls.responsibilities.forEach(resp => responsibilityTypes.add(resp));
      });

      analysis += `**責務分布の分析**\n`;
      analysis += `${responsibilityTypes.size}種類の異なる責務が特定されました。`;
      if (responsibilityTypes.size >= 5) {
        analysis += `適切な責務分離が行われており、関心の分離原則が実践されています。`;
        analysis += `これにより、変更の影響範囲が限定され、保守性の高い設計が実現されています。\n\n`;
      } else {
        analysis += `責務の種類が限定的で、一部のクラスに責任が集中している可能性があります。`;
        analysis += `より細かい責務分離により、保守性とテスト性を向上させることができます。\n\n`;
      }
    }

    // モジュール設計の分析
    analysis += `### モジュール構造の評価\n\n`;
    
    const purposeTypes = new Set(modules.map(m => m.purpose));
    analysis += `${purposeTypes.size}種類の異なる目的を持つモジュールが特定されました：\n`;
    
    Array.from(purposeTypes).forEach(purpose => {
      const count = modules.filter(m => m.purpose === purpose).length;
      analysis += `- **${purpose}**: ${count}モジュール\n`;
    });

    analysis += `\nこの構造は`;
    if (purposeTypes.size >= 5) {
      analysis += `適切な関心の分離を示しており、モジュラーな設計が実現されています。`;
      analysis += `各モジュールが明確な責任を持つことで、変更の影響範囲が限定され、開発効率が向上しています。`;
    } else {
      analysis += `モジュールの分離が限定的で、一部に機能が集中している可能性があります。`;
      analysis += `より細かいモジュール分割により、保守性と再利用性を向上させることができます。`;
    }

    analysis += `\n\n### アーキテクチャの強み\n\n`;
    analysis += this.identifyArchitecturalStrengths();

    analysis += `\n### 改善の方向性\n\n`;
    analysis += this.suggestArchitecturalImprovements();

    return analysis;
  }

  private generateTechnologyAnalysis(): string {
    const endpoints = this.deepAnalysis.apiAnalysis.endpoints;
    const integrations = this.deepAnalysis.apiAnalysis.integrations;
    const dbType = this.deepAnalysis.apiAnalysis.database.type;

    let analysis = `## 技術スタック分析\n\n`;

    analysis += `### 技術選択の妥当性\n\n`;

    // 言語選択の分析
    const language = this.basicAnalysis.structure.language;
    analysis += this.analyzeLanguageChoice(language);

    // データベース技術の分析
    if (dbType !== '不明') {
      analysis += `### データベース技術\n\n`;
      analysis += `**選択技術：${dbType}**\n\n`;
      analysis += this.analyzeDatabaseChoice(dbType);
    }

    // API設計の分析
    if (endpoints.length > 0) {
      analysis += `### API設計の評価\n\n`;
      analysis += `${endpoints.length}個のAPIエンドポイントが検出されました。\n\n`;
      
      const methodDistribution = this.analyzeHttpMethods(endpoints);
      analysis += `**HTTPメソッドの分布：**\n`;
      Object.entries(methodDistribution).forEach(([method, count]) => {
        analysis += `- ${method}: ${count}個\n`;
      });

      analysis += `\n`;
      analysis += this.evaluateApiDesign(methodDistribution);
    }

    // 外部サービス連携の分析
    if (integrations.length > 0) {
      analysis += `### 外部サービス連携\n\n`;
      analysis += `${integrations.length}個の外部サービスとの連携が検出されました：\n\n`;
      
      integrations.forEach(integration => {
        analysis += `**${integration.service}**\n`;
        analysis += `- 用途：${integration.usage.join('、')}\n`;
        analysis += `- 評価：${this.evaluateIntegration(integration.service)}\n\n`;
      });
    }

    analysis += `### 技術的な課題と機会\n\n`;
    analysis += this.identifyTechnicalChallenges();

    return analysis;
  }

  private generateSecurityAnalysis(): string {
    const vulnerabilities = this.deepAnalysis.qualityIssues.securityVulnerabilities;

    let analysis = `## セキュリティ分析\n\n`;

    if (vulnerabilities.length === 0) {
      analysis += `### セキュリティ状況：良好\n\n`;
      analysis += `自動検出により明らかなセキュリティ脆弱性は発見されませんでした。`;
      analysis += `これは適切なセキュリティ慣行に従って開発が行われていることを示しています。\n\n`;
      
      analysis += `ただし、以下の点について継続的な注意が必要です：\n`;
      analysis += `- 依存関係の定期的な更新とセキュリティパッチの適用\n`;
      analysis += `- 入力データの適切な検証とサニタイゼーション\n`;
      analysis += `- 認証・認可機能の定期的な見直し\n`;
      analysis += `- ログ記録とモニタリングの強化\n\n`;
    } else {
      analysis += `### セキュリティ脆弱性の詳細分析\n\n`;
      
      const criticalVulns = vulnerabilities.filter(v => v.risk === 'critical');
      const highVulns = vulnerabilities.filter(v => v.risk === 'high');
      const mediumVulns = vulnerabilities.filter(v => v.risk === 'medium');
      const lowVulns = vulnerabilities.filter(v => v.risk === 'low');

      if (criticalVulns.length > 0) {
        analysis += `**🚨 緊急対応が必要（${criticalVulns.length}件）**\n\n`;
        criticalVulns.forEach((vuln, index) => {
          analysis += `${index + 1}. **${vuln.type}** (${vuln.file})\n`;
          analysis += `   - 問題：${vuln.description}\n`;
          analysis += `   - 危険性：${this.explainSecurityRisk(vuln.type)}\n`;
          analysis += `   - 対策：${vuln.mitigation}\n`;
          analysis += `   - 緊急度：即座に対応してください\n\n`;
        });
      }

      if (highVulns.length > 0) {
        analysis += `**⚠️ 高優先度対応（${highVulns.length}件）**\n\n`;
        analysis += `重要なセキュリティ問題が検出されました。これらは攻撃者によって悪用される可能性があり、`;
        analysis += `データ漏洩やシステム侵害のリスクがあります。1週間以内の対応を強く推奨します。\n\n`;
      }

      if (mediumVulns.length > 0) {
        analysis += `**📋 中優先度対応（${mediumVulns.length}件）**\n\n`;
        analysis += `中程度のセキュリティ課題が検出されました。これらは直ちに致命的ではありませんが、`;
        analysis += `他の脆弱性と組み合わされることで深刻な問題となる可能性があります。`;
        analysis += `次回のメンテナンス時に対処することをお勧めします。\n\n`;
      }

      if (lowVulns.length > 0) {
        analysis += `**📝 低優先度対応（${lowVulns.length}件）**\n\n`;
        analysis += `軽微なセキュリティ改善点が検出されました。これらはベストプラクティスの観点から`;
        analysis += `改善することで、全体的なセキュリティ姿勢を向上させることができます。\n\n`;
      }
    }

    analysis += `### セキュリティ強化の推奨事項\n\n`;
    analysis += this.generateSecurityRecommendations();

    return analysis;
  }

  private generatePerformanceAnalysis(): string {
    const performanceIssues = this.deepAnalysis.qualityIssues.performanceIssues;

    let analysis = `## パフォーマンス分析\n\n`;

    if (performanceIssues.length === 0) {
      analysis += `### パフォーマンス状況：良好\n\n`;
      analysis += `明らかなパフォーマンス問題は検出されませんでした。`;
      analysis += `現在の実装では効率的な処理が行われており、適切な設計が適用されています。\n\n`;
      
      analysis += `継続的な性能維持のため、以下の点を推奨します：\n`;
      analysis += `- データベースクエリの定期的な最適化\n`;
      analysis += `- メモリ使用量のモニタリング\n`;
      analysis += `- 負荷テストの定期実施\n`;
      analysis += `- キャッシュ戦略の見直し\n\n`;
    } else {
      analysis += `### パフォーマンス課題の詳細分析\n\n`;
      analysis += `${performanceIssues.length}個のパフォーマンス改善点が特定されました。\n\n`;

      performanceIssues.forEach((issue, index) => {
        analysis += `**${index + 1}. ${issue.type}** (${issue.file})\n`;
        analysis += `- 問題：${issue.description}\n`;
        analysis += `- 性能への影響：${issue.impact}\n`;
        analysis += `- 解決策：${issue.solution}\n`;
        analysis += `- 改善効果：${this.estimatePerformanceGain(issue.type)}\n\n`;
      });

      analysis += `### パフォーマンス最適化の優先順位\n\n`;
      analysis += this.prioritizePerformanceImprovements(performanceIssues);
    }

    return analysis;
  }

  private generateImprovementRecommendations(): string {
    const immediate = this.deepAnalysis.actionableRecommendations.immediate;
    const shortTerm = this.deepAnalysis.actionableRecommendations.shortTerm;
    const longTerm = this.deepAnalysis.actionableRecommendations.longTerm;

    let recommendations = `## 改善提案の詳細解説\n\n`;

    if (immediate.length > 0) {
      recommendations += `### 🚨 即座に対応すべき課題\n\n`;
      recommendations += `以下の問題は現在のシステムの安定性や安全性に直接影響するため、可能な限り早急に対処してください：\n\n`;
      
      immediate.forEach((item, index) => {
        recommendations += `**${index + 1}. ${item}**\n\n`;
        recommendations += `**なぜ重要か：** ${this.explainUrgency(item)}\n\n`;
        recommendations += `**具体的な手順：**\n${this.provideDetailedSteps(item)}\n\n`;
        recommendations += `**所要時間：** ${this.estimateTimeRequired(item)}\n\n`;
        recommendations += `**期待される効果：** ${this.explainExpectedBenefit(item)}\n\n`;
        recommendations += `---\n\n`;
      });
    }

    if (shortTerm.length > 0) {
      recommendations += `### 📋 短期的改善項目（1-4週間）\n\n`;
      recommendations += `以下の改善は中期的な品質向上と開発効率の向上に寄与します。計画的に取り組むことをお勧めします：\n\n`;
      
      shortTerm.slice(0, 5).forEach((item, index) => {
        recommendations += `**${index + 1}. ${item}**\n\n`;
        recommendations += `**改善の理由：** ${this.explainImprovementReason(item)}\n\n`;
        recommendations += `**実装アプローチ：** ${this.suggestImplementationApproach(item)}\n\n`;
        recommendations += `**成功指標：** ${this.defineSuccessMetrics(item)}\n\n`;
        recommendations += `---\n\n`;
      });
      
      if (shortTerm.length > 5) {
        recommendations += `*他に${shortTerm.length - 5}件の短期改善項目があります。*\n\n`;
      }
    }

    if (longTerm.length > 0) {
      recommendations += `### 🎯 長期的戦略項目（1-3ヶ月）\n\n`;
      recommendations += `以下は長期的な技術的負債の解消と、システムの根本的な改善に関わる項目です：\n\n`;
      
      longTerm.slice(0, 3).forEach((item, index) => {
        recommendations += `**${index + 1}. ${item}**\n\n`;
        recommendations += `**戦略的価値：** ${this.explainStrategicValue(item)}\n\n`;
        recommendations += `**実装計画：** ${this.outlineImplementationPlan(item)}\n\n`;
        recommendations += `**リスクと対策：** ${this.identifyRisksAndMitigation(item)}\n\n`;
        recommendations += `**ROI予測：** ${this.estimateROI(item)}\n\n`;
        recommendations += `---\n\n`;
      });
    }

    recommendations += `### 改善実装のベストプラクティス\n\n`;
    recommendations += this.provideImplementationGuidelines();

    return recommendations;
  }

  private generatePrioritizedActionPlan(): string {
    let plan = `## 優先順位付きアクションプラン\n\n`;

    plan += `### フェーズ1：緊急対応（今週中）\n\n`;
    plan += this.createPhase1Plan();

    plan += `### フェーズ2：基盤強化（1ヶ月以内）\n\n`;
    plan += this.createPhase2Plan();

    plan += `### フェーズ3：最適化・拡張（3ヶ月以内）\n\n`;
    plan += this.createPhase3Plan();

    plan += `### 実装スケジュール提案\n\n`;
    plan += this.suggestImplementationSchedule();

    return plan;
  }

  private generateRiskAssessment(): string {
    const threats = this.deepAnalysis.insights.threats;
    const vulnerabilities = this.deepAnalysis.qualityIssues.securityVulnerabilities;
    const technicalDebt = this.deepAnalysis.qualityIssues.technicalDebt;

    let assessment = `## リスク評価\n\n`;

    assessment += `### セキュリティリスク\n\n`;
    if (vulnerabilities.length > 0) {
      const criticalCount = vulnerabilities.filter(v => v.risk === 'critical').length;
      const highCount = vulnerabilities.filter(v => v.risk === 'high').length;
      
      if (criticalCount > 0) {
        assessment += `**🔴 高リスク：** ${criticalCount}個の致命的なセキュリティ脆弱性が存在します。`;
        assessment += `これらは即座に悪用される可能性があり、データ漏洩やシステム侵害の直接的な脅威となります。\n\n`;
      }
      
      if (highCount > 0) {
        assessment += `**🟠 中リスク：** ${highCount}個の重要なセキュリティ問題があります。`;
        assessment += `これらは適切に対処しなければ、時間の経過とともに深刻な問題に発展する可能性があります。\n\n`;
      }
    } else {
      assessment += `**🟢 低リスク：** 明らかなセキュリティ脆弱性は検出されていません。\n\n`;
    }

    assessment += `### 技術的負債リスク\n\n`;
    if (technicalDebt.length > 0) {
      assessment += `${technicalDebt.length}個の技術的負債が特定されました。`;
      assessment += `これらは以下のリスクをもたらします：\n\n`;
      
      technicalDebt.forEach(debt => {
        assessment += `- **${debt.category}：** ${debt.businessImpact}\n`;
      });
      assessment += `\n`;
    }

    assessment += `### 事業継続性リスク\n\n`;
    assessment += this.assessBusinessContinuityRisks();

    return assessment;
  }

  private generateModernizationRoadmap(): string {
    const modernizationNeeds = this.deepAnalysis.competitiveAnalysis.modernizationNeeds;

    let roadmap = `## モダナイゼーションロードマップ\n\n`;

    roadmap += `### 現状評価\n\n`;
    roadmap += this.assessCurrentTechnicalState();

    if (modernizationNeeds.length > 0) {
      roadmap += `### 段階別モダナイゼーション計画\n\n`;

      const highPriority = modernizationNeeds.filter(need => need.priority === 'high');
      const mediumPriority = modernizationNeeds.filter(need => need.priority === 'medium');
      const lowPriority = modernizationNeeds.filter(need => need.priority === 'low');

      if (highPriority.length > 0) {
        roadmap += `**ステップ1：基盤技術の更新（3-6ヶ月）**\n\n`;
        highPriority.forEach(need => {
          roadmap += `- **${need.area}**\n`;
          roadmap += `  - 現状：${need.currentState}\n`;
          roadmap += `  - 目標：${need.recommendedState}\n`;
          roadmap += `  - 工数：${need.effort}\n`;
          roadmap += `  - 効果：${this.explainModernizationBenefit(need.area)}\n\n`;
        });
      }

      if (mediumPriority.length > 0) {
        roadmap += `**ステップ2：開発効率の向上（6-12ヶ月）**\n\n`;
        mediumPriority.forEach(need => {
          roadmap += `- **${need.area}**\n`;
          roadmap += `  - 現状：${need.currentState}\n`;
          roadmap += `  - 目標：${need.recommendedState}\n`;
          roadmap += `  - 工数：${need.effort}\n\n`;
        });
      }

      if (lowPriority.length > 0) {
        roadmap += `**ステップ3：最適化・拡張（12-18ヶ月）**\n\n`;
        lowPriority.forEach(need => {
          roadmap += `- **${need.area}**\n`;
          roadmap += `  - 現状：${need.currentState}\n`;
          roadmap += `  - 目標：${need.recommendedState}\n`;
          roadmap += `  - 工数：${need.effort}\n\n`;
        });
      }
    }

    roadmap += `### 投資対効果の予測\n\n`;
    roadmap += this.predictROI();

    roadmap += `### 移行リスクと対策\n\n`;
    roadmap += this.outlineMigrationRisks();

    return roadmap;
  }

  // ヘルパーメソッド
  private inferProjectScale(functionCount: number, classCount: number): string {
    const total = functionCount + classCount;
    if (total < 20) return '小';
    if (total < 100) return '中';
    return '大';
  }

  private getTotalIssueCount(): number {
    return this.deepAnalysis.qualityIssues.codeSmells.length +
           this.deepAnalysis.qualityIssues.performanceIssues.length +
           this.deepAnalysis.qualityIssues.securityVulnerabilities.length;
  }

  private getCriticalIssueCount(): number {
    const criticalSecurity = this.deepAnalysis.qualityIssues.securityVulnerabilities
      .filter(v => v.risk === 'critical').length;
    const highCodeSmells = this.deepAnalysis.qualityIssues.codeSmells
      .filter(cs => cs.severity === 'high').length;
    return criticalSecurity + highCodeSmells;
  }

  private calculateOverallMaintainabilityScore(): number {
    // 複数要素を考慮した総合スコア
    const functions = this.deepAnalysis.codeStructure.functions;
    const modules = this.deepAnalysis.codeStructure.modules;
    const issues = this.getTotalIssueCount();
    
    let score = 70; // ベースライン
    
    // 複雑度による減点
    const avgComplexity = functions.length > 0 
      ? functions.reduce((sum, f) => sum + f.complexity, 0) / functions.length 
      : 0;
    if (avgComplexity > 10) score -= 20;
    else if (avgComplexity > 5) score -= 10;
    
    // 結合度による減点
    const avgCoupling = modules.length > 0
      ? modules.reduce((sum, m) => sum + m.coupling, 0) / modules.length
      : 0;
    if (avgCoupling > 5) score -= 15;
    else if (avgCoupling > 3) score -= 8;
    
    // 問題数による減点
    score -= Math.min(issues * 2, 30);
    
    // テスト・CI/CDによる加点
    if (this.basicAnalysis.structure.hasTests) score += 10;
    if (this.basicAnalysis.structure.hasCI) score += 5;
    if (this.basicAnalysis.structure.hasDocumentation) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private getProjectTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'web': 'Webアプリケーション',
      'mobile': 'モバイルアプリケーション',
      'desktop': 'デスクトップアプリケーション',
      'cli': 'コマンドラインツール',
      'library': 'ライブラリ・SDK',
      'unknown': 'ソフトウェアプロジェクト'
    };
    return descriptions[type] || 'ソフトウェアプロジェクト';
  }

  private assessProjectMaturity(): string {
    const hasTests = this.basicAnalysis.structure.hasTests;
    const hasCI = this.basicAnalysis.structure.hasCI;
    const hasDocumentation = this.basicAnalysis.structure.hasDocumentation;
    const issueCount = this.getTotalIssueCount();

    if (hasTests && hasCI && hasDocumentation && issueCount < 5) {
      return `このプロジェクトは**高い成熟度**を示しています。適切なテスト、CI/CD、文書化が整備され、品質問題も最小限に抑えられています。継続的な改善により、この高い品質レベルを維持することが重要です。`;
    } else if ((hasTests || hasCI) && issueCount < 15) {
      return `このプロジェクトは**中程度の成熟度**にあります。基本的な開発プラクティスは実装されていますが、さらなる改善の余地があります。段階的な品質向上により、より安定したプロダクトへと発展させることができます。`;
    } else {
      return `このプロジェクトは**初期段階の成熟度**にあります。基本的な開発プラクティスの導入と品質問題の解決により、大幅な改善が可能です。体系的なアプローチにより、短期間で成熟度を向上させることができます。`;
    }
  }

  private explainWhyProblem(problemType: string): string {
    const explanations: Record<string, string> = {
      'Long Line': '長い行は可読性を低下させ、コードレビューやデバッグを困難にします',
      'Long Function': '長い関数は複数の責任を持ちがちで、理解・テスト・保守が困難になります',
      'Magic Number': 'ハードコードされた数値は意味が不明で、変更時にバグの原因となりやすいです',
      'Commented Code': 'コメントアウトされたコードは混乱を招き、コードベースを不必要に肥大化させます'
    };
    return explanations[problemType] || 'コードの品質と保守性に悪影響を与える可能性があります';
  }

  private explainImpact(problemType: string): string {
    const impacts: Record<string, string> = {
      'Long Line': '可読性低下、コードレビュー効率の悪化',
      'Long Function': 'テスト困難、バグ発生率増加、新人の学習コスト増',
      'Magic Number': '仕様変更時の修正漏れ、意図の不明確さ',
      'Commented Code': 'コードベース肥大化、保守性低下'
    };
    return impacts[problemType] || '保守コストの増加';
  }

  private groupIssuesByType(issues: any[]): Record<string, number> {
    return issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {});
  }

  private getIssueDescription(issueType: string): string {
    const descriptions: Record<string, string> = {
      'Long Line': 'コードの可読性向上のため、行の分割を推奨',
      'Magic Number': '定数化により保守性を向上',
      'Commented Code': '不要コードの削除でコードベースを整理'
    };
    return descriptions[issueType] || '品質向上のための改善項目';
  }

  private identifyArchitecturalStrengths(): string {
    let strengths = '';
    const functions = this.deepAnalysis.codeStructure.functions;
    const classes = this.deepAnalysis.codeStructure.classes;
    
    // 非同期処理の適用率
    const asyncRatio = functions.length > 0 ? 
      (functions.filter(f => f.isAsync).length / functions.length) * 100 : 0;
    
    if (asyncRatio > 40) {
      strengths += '- **現代的な非同期処理**: 適切な非同期処理により、スケーラブルで応答性の高いアプリケーションが実現されています\n';
    }
    
    // クラス設計の評価
    if (classes.length > 0) {
      const avgMethods = classes.reduce((sum, c) => sum + c.methods.length, 0) / classes.length;
      if (avgMethods <= 8) {
        strengths += '- **適切なクラス設計**: 小さく焦点の絞られたクラス設計により、単一責任原則が実践されています\n';
      }
    }
    
    return strengths || '- アーキテクチャの分析により、具体的な強みが特定できます\n';
  }

  private suggestArchitecturalImprovements(): string {
    let suggestions = '';
    const modules = this.deepAnalysis.codeStructure.modules;
    const avgCoupling = modules.length > 0 ?
      modules.reduce((sum, m) => sum + m.coupling, 0) / modules.length : 0;
    
    if (avgCoupling > 5) {
      suggestions += '- **依存関係の整理**: モジュール間の結合度を下げることで、保守性とテスト性を向上させる\n';
    }
    
    if (!this.basicAnalysis.structure.hasTests) {
      suggestions += '- **テスト基盤の構築**: 単体テストと統合テストの導入により、信頼性の高い開発プロセスを確立する\n';
    }
    
    suggestions += '- **継続的リファクタリング**: 定期的なコード見直しにより、技術的負債の蓄積を防ぐ\n';
    
    return suggestions;
  }

  private analyzeLanguageChoice(language: string): string {
    const analyses: Record<string, string> = {
      'JavaScript': '動的型付けによる開発速度の利点がありますが、大規模開発では型安全性の確保が課題となります。TypeScriptへの段階的移行を検討することで、開発効率と品質の両立が可能です。',
      'TypeScript': '静的型付けにより、コンパイル時のエラー検出と開発効率の向上が実現されています。現代的なWeb開発において優れた選択です。',
      'Python': '豊富なライブラリエコシステムと読みやすい構文により、迅速な開発が可能です。パフォーマンスが重要な部分では、最適化の検討が必要な場合があります。',
      'Java': 'エンタープライズ向けの安定性と豊富なツールサポートが利点です。ボイラープレートコードが多くなりがちですが、Spring等のフレームワークにより軽減されています。',
      'Go': 'シンプルな構文と優れた同期性サポートにより、マイクロサービスやクラウドネイティブアプリケーションに適しています。'
    };
    return analyses[language] || `${language}は特定の用途に適した言語として選択されています。`;
  }

  private analyzeDatabaseChoice(dbType: string): string {
    const analyses: Record<string, string> = {
      'PostgreSQL': '高度なSQL機能と拡張性を提供する優秀な選択です。ACID特性による整合性と、JSONサポートによる柔軟性を両立しています。',
      'MongoDB': 'ドキュメント指向による柔軟なスキーマ設計が可能です。データ構造が頻繁に変更される場合に適していますが、複雑なクエリではパフォーマンスに注意が必要です。',
      'MySQL': '豊富な実績と安定性を持つ選択です。Webアプリケーションでの使用に適していますが、複雑な分析クエリには向いていない場合があります。',
      'Redis': '高速なインメモリ処理によりキャッシュや session storage として優秀です。データの永続化については別途考慮が必要です。'
    };
    return analyses[dbType] || `${dbType}は特定の要件に基づいて選択されています。`;
  }

  private analyzeHttpMethods(endpoints: any[]): Record<string, number> {
    return endpoints.reduce((acc, endpoint) => {
      acc[endpoint.method] = (acc[endpoint.method] || 0) + 1;
      return acc;
    }, {});
  }

  private evaluateApiDesign(methodDistribution: Record<string, number>): string {
    const hasAllCrud = ['GET', 'POST', 'PUT', 'DELETE'].every(method => 
      methodDistribution[method] > 0
    );
    
    if (hasAllCrud) {
      return 'RESTful APIの原則に従った適切な設計が行われています。CRUD操作が体系的に実装されており、APIの一貫性が保たれています。';
    } else {
      return 'API設計は機能的ですが、RESTful原則の完全な適用により、より一貫性のある設計に改善できる可能性があります。';
    }
  }

  private evaluateIntegration(serviceName: string): string {
    const evaluations: Record<string, string> = {
      'AWS': 'クラウドネイティブな設計により、スケーラビリティと可用性が向上しています',
      'Stripe': '信頼性の高い決済処理により、ビジネス価値の向上に寄与しています',
      'OpenAI': 'AI機能の統合により、アプリケーションの付加価値が向上しています',
      'Google Cloud': '豊富なマネージドサービスにより、運用負荷が軽減されています'
    };
    return evaluations[serviceName] || '適切な外部サービス連携により機能拡張が実現されています';
  }

  private identifyTechnicalChallenges(): string {
    let challenges = '';
    const integrations = this.deepAnalysis.apiAnalysis.integrations;
    
    if (integrations.length > 5) {
      challenges += '**依存関係の複雑化**: 多数の外部サービスへの依存により、障害の影響範囲が拡大するリスクがあります。サービス間の疎結合設計と適切な fallback 機能の実装を推奨します。\n\n';
    }
    
    if (!this.basicAnalysis.structure.hasCI) {
      challenges += '**デプロイメントの自動化**: CI/CDパイプラインの導入により、リリース品質の向上と開発効率の改善が期待できます。\n\n';
    }
    
    challenges += '**継続的最適化**: 定期的なパフォーマンス測定と最適化により、ユーザー体験の継続的改善を図ることができます。';
    
    return challenges;
  }

  private explainSecurityRisk(vulnType: string): string {
    const risks: Record<string, string> = {
      'SQL Injection Risk': 'データベースへの不正アクセスにより、機密情報の漏洩や改ざんが発生する可能性',
      'XSS Risk': 'ユーザーのブラウザで悪意のあるスクリプトが実行され、認証情報の盗取等が発生する可能性',
      'Hard-coded Secret': '認証情報の漏洩により、システム全体が侵害される可能性'
    };
    return risks[vulnType] || '重要なセキュリティリスクを含んでいます';
  }

  private generateSecurityRecommendations(): string {
    return `以下のセキュリティ強化策を推奨します：

1. **入力値検証の強化**: すべてのユーザー入力に対して適切な検証とサニタイゼーションを実装
2. **認証・認可の見直し**: 最小権限原則に基づくアクセス制御の実装
3. **依存関係の管理**: 定期的なライブラリ更新とセキュリティパッチの適用
4. **ログ・監査の強化**: セキュリティイベントの適切な記録と監視
5. **暗号化の実装**: 重要データの暗号化による保護強化`;
  }

  private estimatePerformanceGain(issueType: string): string {
    const gains: Record<string, string> = {
      'Potential N+1 Query': '10-50倍のデータベース処理速度向上',
      'Synchronous File Operation': '2-5倍の応答時間改善',
      'Sequential Async Operations': '3-10倍の並列処理性能向上'
    };
    return gains[issueType] || '性能向上が期待できます';
  }

  private prioritizePerformanceImprovements(issues: any[]): string {
    if (issues.length === 0) return '';
    
    return `優先順位に基づく改善アプローチ：

1. **データベース最適化**: N+1クエリ問題の解決により、最も大きな性能向上が期待できます
2. **非同期処理の改善**: I/O処理の並列化により、応答性が大幅に向上します
3. **キャッシュ戦略**: 適切なキャッシング戦略により、負荷軽減と高速化を実現できます`;
  }

  // 詳細説明用のヘルパーメソッド
  private explainUrgency(item: string): string {
    if (item.includes('セキュリティ') || item.includes('Security')) {
      return '放置すると悪意のある攻撃者に悪用される可能性があり、システムの信頼性とデータの安全性に直接的な脅威となります。';
    }
    if (item.includes('パフォーマンス')) {
      return 'ユーザー体験の劣化により、ユーザーの離脱率増加とビジネス機会の損失につながる可能性があります。';
    }
    return '現在のシステムの安定性と品質に重要な影響を与えるため、早急な対処が必要です。';
  }

  private provideDetailedSteps(item: string): string {
    // 具体的な実装手順を提供
    return `詳細な実装手順については、該当するコードファイルを特定し、段階的なアプローチで改善を進めてください。必要に応じて、経験豊富な開発者のレビューを受けることを推奨します。`;
  }

  private estimateTimeRequired(item: string): string {
    if (item.includes('緊急')) return '1-2時間';
    if (item.includes('パフォーマンス')) return '2-4時間';
    return '0.5-1日';
  }

  private explainExpectedBenefit(item: string): string {
    return 'システムの安定性向上、ユーザー体験の改善、開発効率の向上が期待できます。';
  }

  private explainImprovementReason(item: string): string {
    return 'コードの品質向上と長期的な保守性の確保により、開発チームの生産性向上に寄与します。';
  }

  private suggestImplementationApproach(item: string): string {
    return '段階的なリファクタリングにより、既存機能への影響を最小限に抑えながら改善を進めることを推奨します。';
  }

  private defineSuccessMetrics(item: string): string {
    return 'コード品質メトリクスの改善、テストカバレッジの向上、開発速度の向上を指標とします。';
  }

  private explainStrategicValue(item: string): string {
    return '長期的な技術的競争力の向上と、将来の機能拡張における開発効率の向上に寄与します。';
  }

  private outlineImplementationPlan(item: string): string {
    return '詳細な計画立案、段階的実装、継続的な検証というアプローチで進めることを推奨します。';
  }

  private identifyRisksAndMitigation(item: string): string {
    return '既存機能への影響リスクを適切なテストとバックアップ戦略により軽減できます。';
  }

  private estimateROI(item: string): string {
    return '初期投資に対して、中長期的な開発効率向上により、6-12ヶ月で投資回収が期待できます。';
  }

  private provideImplementationGuidelines(): string {
    return `**改善実装時の推奨事項：**

1. **段階的アプローチ**: 大きな変更は小さなステップに分割し、リスクを最小化
2. **適切なテスト**: 変更前後での動作確認により、回帰を防止
3. **文書化**: 変更内容と理由を記録し、チーム内での知識共有を促進
4. **継続的モニタリング**: 改善効果を定期的に測定し、必要に応じて調整`;
  }

  private createPhase1Plan(): string {
    return '緊急性の高いセキュリティ問題とパフォーマンス問題に集中し、システムの基本的な安定性を確保します。';
  }

  private createPhase2Plan(): string {
    return 'コード品質の改善とテスト基盤の強化により、開発の基盤を固めます。';
  }

  private createPhase3Plan(): string {
    return 'モダナイゼーションと機能拡張により、競争力のあるシステムへと発展させます。';
  }

  private suggestImplementationSchedule(): string {
    return '各フェーズを2-4週間で区切り、定期的な進捗確認と調整を行うことで、確実な改善を実現できます。';
  }

  private assessBusinessContinuityRisks(): string {
    return '現在のシステム構成と問題の組み合わせにより、事業継続性への影響を評価し、適切なリスク軽減策を実装することが重要です。';
  }

  private assessCurrentTechnicalState(): string {
    return '現在の技術スタックは基本的な機能を提供していますが、現代的な開発プラクティスの導入により、大幅な改善が可能です。';
  }

  private explainModernizationBenefit(area: string): string {
    const benefits: Record<string, string> = {
      'Type Safety': '開発効率の向上とバグの早期発見',
      'Testing': '品質保証とリファクタリングの安全性向上',
      'CI/CD': '開発サイクルの高速化と品質向上'
    };
    return benefits[area] || '開発効率と品質の向上';
  }

  private predictROI(): string {
    return 'モダナイゼーションへの投資は、開発効率の向上、バグ減少、保守コスト削減により、12-18ヶ月で投資回収が期待できます。';
  }

  private outlineMigrationRisks(): string {
    return '段階的な移行戦略と適切なテスト戦略により、移行に伴うリスクを最小限に抑えることができます。';
  }
}

export type { NarrativeReport };