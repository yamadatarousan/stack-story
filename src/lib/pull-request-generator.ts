import { RepositoryImprovement, ImprovementPlan, FileChange } from './repository-improver';

interface PullRequestData {
  title: string;
  body: string;
  branch: string;
  fileChanges: Array<{
    path: string;
    content: string;
    mode: 'create' | 'update' | 'delete';
  }>;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: 'open' | 'closed' | 'merged';
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
}

export class PullRequestGenerator {
  private githubToken?: string;

  constructor(githubToken?: string) {
    this.githubToken = githubToken;
  }

  generatePullRequestData(
    improvement: RepositoryImprovement,
    repositoryName: string
  ): PullRequestData {
    const branchName = `improvement/${improvement.id}-${Date.now()}`;
    
    const title = `${this.getCategoryEmoji(improvement.category)} ${improvement.title}`;
    
    const body = this.generatePullRequestBody(improvement);
    
    const fileChanges = improvement.fileChanges.map(change => ({
      path: change.filePath,
      content: change.improvedContent,
      mode: this.getFileMode(change)
    }));

    return {
      title,
      body,
      branch: branchName,
      fileChanges
    };
  }

  generateBatchPullRequestData(
    improvements: RepositoryImprovement[],
    repositoryName: string,
    batchTitle?: string
  ): PullRequestData {
    const branchName = `improvements/batch-${Date.now()}`;
    
    const title = batchTitle || `🚀 Repository improvements (${improvements.length} changes)`;
    
    const body = this.generateBatchPullRequestBody(improvements);
    
    const allFileChanges = improvements
      .flatMap(imp => imp.fileChanges)
      .reduce((acc, change) => {
        const existing = acc.find(fc => fc.path === change.filePath);
        if (existing) {
          // 同じファイルの変更をマージ
          existing.content = change.improvedContent;
        } else {
          acc.push({
            path: change.filePath,
            content: change.improvedContent,
            mode: this.getFileMode(change)
          });
        }
        return acc;
      }, [] as Array<{ path: string; content: string; mode: 'create' | 'update' | 'delete' }>);

    return {
      title,
      body,
      branch: branchName,
      fileChanges: allFileChanges
    };
  }

  private generatePullRequestBody(improvement: RepositoryImprovement): string {
    return `## ${improvement.title}

### 📋 概要
${improvement.description}

### 🎯 改善効果
${improvement.impact}

### ⚡ 実装概要
${improvement.implementationSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

### 📁 変更ファイル
${improvement.fileChanges.map(change => 
  `- \`${change.filePath}\` - ${change.changeDescription}`
).join('\n')}

### 🏷️ メタデータ
- **カテゴリ**: ${improvement.category}
- **優先度**: ${improvement.priority}
- **工数**: ${improvement.effort}
- **推定時間**: ${improvement.estimatedTimeHours}時間

### 🧪 テスト
- [ ] ビルドが正常に完了することを確認
- [ ] 既存機能に影響がないことを確認
${improvement.testingGuidance?.map(guide => `- [ ] ${guide}`).join('\n') || ''}

### 🔄 ロールバック計画
${improvement.rollbackPlan || '変更を元に戻すには、このPRをrevertしてください。'}

---
🤖 この改善提案は[Stack Story](https://github.com/your-org/stack-story)のAI分析エンジンによって生成されました。`;
  }

  private generateBatchPullRequestBody(improvements: RepositoryImprovement[]): string {
    const categoryCounts = improvements.reduce((acc, imp) => {
      acc[imp.category] = (acc[imp.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalTime = improvements.reduce((sum, imp) => sum + imp.estimatedTimeHours, 0);

    return `## 🚀 Repository Improvements Batch

### 📊 概要
このPRは${improvements.length}個の改善項目をまとめて実装します。

**カテゴリ別内訳:**
${Object.entries(categoryCounts).map(([category, count]) => 
  `- ${this.getCategoryEmoji(category)} ${category}: ${count}個`
).join('\n')}

**総推定時間**: ${totalTime}時間

### 🎯 含まれる改善項目

${improvements.map((imp, index) => `
#### ${index + 1}. ${imp.title}
- **優先度**: ${imp.priority}
- **カテゴリ**: ${imp.category}
- **工数**: ${imp.effort}
- **説明**: ${imp.description}
`).join('\n')}

### 📁 変更ファイル一覧
${improvements.flatMap(imp => imp.fileChanges).map(change => 
  `- \`${change.filePath}\` - ${change.changeDescription}`
).join('\n')}

### 🧪 テスト計画
- [ ] すべての改善項目が正常に動作することを確認
- [ ] ビルドプロセスが成功することを確認
- [ ] 既存機能への影響がないことを確認
- [ ] パフォーマンステストの実行
- [ ] セキュリティチェックの実行

### ⚠️ 注意事項
- この改善は段階的にレビューすることを推奨します
- 必要に応じて個別の改善項目を別のPRに分割できます
- 本番環境への適用前に十分なテストを実施してください

### 🔄 ロールバック計画
改善に問題が発生した場合は、このPRをrevertすることで元の状態に戻すことができます。
個別の改善項目のみをロールバックしたい場合は、該当するファイルの変更のみをrevertしてください。

---
🤖 この改善提案は[Stack Story](https://github.com/your-org/stack-story)のAI分析エンジンによって生成されました。

### 🤝 コントリビューション
この自動生成されたPRについてフィードバックがある場合は、Stack Storyのリポジトリでissueを作成してください。`;
  }

  private getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      performance: '⚡',
      security: '🔒',
      quality: '✨',
      maintainability: '🔧',
      testing: '🧪',
      documentation: '📚',
      feature: '🎉',
      architecture: '🏗️'
    };
    return emojiMap[category] || '🔄';
  }

  private getFileMode(change: FileChange): 'create' | 'update' | 'delete' {
    switch (change.changeType) {
      case 'delete':
        return 'delete';
      case 'modify':
      case 'rename':
        return 'update';
      default:
        return 'create';
    }
  }

  async createPullRequest(
    owner: string,
    repo: string,
    pullRequestData: PullRequestData,
    baseBranch: string = 'main'
  ): Promise<GitHubPullRequest> {
    if (!this.githubToken) {
      throw new Error('GitHub token is required to create pull requests');
    }

    try {
      // 1. 現在のベースブランチの最新コミットを取得
      const baseRefResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${baseBranch}`,
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!baseRefResponse.ok) {
        throw new Error(`Failed to get base branch: ${baseRefResponse.statusText}`);
      }

      const baseRef = await baseRefResponse.json();
      const baseSha = baseRef.object.sha;

      // 2. 新しいブランチを作成
      const createBranchResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: `refs/heads/${pullRequestData.branch}`,
            sha: baseSha,
          }),
        }
      );

      if (!createBranchResponse.ok) {
        throw new Error(`Failed to create branch: ${createBranchResponse.statusText}`);
      }

      // 3. ファイル変更をコミット
      for (const fileChange of pullRequestData.fileChanges) {
        await this.updateFile(owner, repo, fileChange, pullRequestData.branch);
      }

      // 4. プルリクエストを作成
      const createPRResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: pullRequestData.title,
            body: pullRequestData.body,
            head: pullRequestData.branch,
            base: baseBranch,
          }),
        }
      );

      if (!createPRResponse.ok) {
        throw new Error(`Failed to create pull request: ${createPRResponse.statusText}`);
      }

      return await createPRResponse.json();

    } catch (error) {
      console.error('Failed to create pull request:', error);
      throw error;
    }
  }

  private async updateFile(
    owner: string,
    repo: string,
    fileChange: { path: string; content: string; mode: 'create' | 'update' | 'delete' },
    branch: string
  ): Promise<void> {
    if (!this.githubToken) {
      throw new Error('GitHub token is required');
    }

    if (fileChange.mode === 'delete') {
      // ファイル削除は別のAPIを使用
      const deleteResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${fileChange.path}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Delete ${fileChange.path}`,
            branch: branch,
          }),
        }
      );

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete file ${fileChange.path}: ${deleteResponse.statusText}`);
      }
      return;
    }

    // ファイルの作成または更新
    let sha: string | undefined;

    if (fileChange.mode === 'update') {
      // 既存ファイルのSHAを取得
      try {
        const getFileResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${fileChange.path}?ref=${branch}`,
          {
            headers: {
              'Authorization': `token ${this.githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );

        if (getFileResponse.ok) {
          const fileData = await getFileResponse.json();
          sha = fileData.sha;
        }
      } catch (error) {
        // ファイルが存在しない場合は新規作成として扱う
        console.warn(`File ${fileChange.path} not found, creating new file`);
      }
    }

    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${fileChange.path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update ${fileChange.path}`,
          content: Buffer.from(fileChange.content).toString('base64'),
          branch: branch,
          ...(sha && { sha }),
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update file ${fileChange.path}: ${updateResponse.statusText}`);
    }
  }

  generatePreviewUrl(
    owner: string,
    repo: string,
    pullRequestData: PullRequestData,
    baseBranch: string = 'main'
  ): string {
    const encodedTitle = encodeURIComponent(pullRequestData.title);
    const encodedBody = encodeURIComponent(pullRequestData.body);
    
    return `https://github.com/${owner}/${repo}/compare/${baseBranch}...${pullRequestData.branch}?quick_pull=1&title=${encodedTitle}&body=${encodedBody}`;
  }
}

export type { PullRequestData, GitHubPullRequest };