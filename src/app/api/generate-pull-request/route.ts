import { NextRequest, NextResponse } from 'next/server';
import { PullRequestGenerator } from '@/lib/pull-request-generator';
import { RepositoryImprovement } from '@/lib/repository-improver';

export async function POST(request: NextRequest) {
  try {
    const { 
      improvements, 
      repositoryUrl, 
      githubToken,
      mode = 'preview' // 'preview' | 'create'
    }: { 
      improvements: RepositoryImprovement[];
      repositoryUrl: string;
      githubToken?: string;
      mode?: 'preview' | 'create';
    } = await request.json();

    if (!improvements || improvements.length === 0) {
      return NextResponse.json(
        { error: 'At least one improvement is required' },
        { status: 400 }
      );
    }

    if (!repositoryUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // GitHubリポジトリURLから owner/repo を抽出
    const repoMatch = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL' },
        { status: 400 }
      );
    }

    const [, owner, repo] = repoMatch;
    const repositoryName = `${owner}/${repo}`;

    console.log('🔧 Generating pull request for improvements:', improvements.length);

    const generator = new PullRequestGenerator(githubToken);

    if (improvements.length === 1) {
      // 単一の改善項目の場合
      const improvement = improvements[0];
      const pullRequestData = generator.generatePullRequestData(improvement, repositoryName);

      if (mode === 'preview') {
        const previewUrl = generator.generatePreviewUrl(owner, repo, pullRequestData);
        return NextResponse.json({
          success: true,
          mode: 'preview',
          pullRequestData,
          previewUrl
        });
      } else {
        if (!githubToken) {
          return NextResponse.json(
            { error: 'GitHub token is required to create pull requests' },
            { status: 400 }
          );
        }

        const pullRequest = await generator.createPullRequest(owner, repo, pullRequestData);
        return NextResponse.json({
          success: true,
          mode: 'create',
          pullRequest,
          pullRequestData
        });
      }
    } else {
      // 複数の改善項目の場合（バッチ）
      const pullRequestData = generator.generateBatchPullRequestData(improvements, repositoryName);

      if (mode === 'preview') {
        const previewUrl = generator.generatePreviewUrl(owner, repo, pullRequestData);
        return NextResponse.json({
          success: true,
          mode: 'preview',
          pullRequestData,
          previewUrl
        });
      } else {
        if (!githubToken) {
          return NextResponse.json(
            { error: 'GitHub token is required to create pull requests' },
            { status: 400 }
          );
        }

        const pullRequest = await generator.createPullRequest(owner, repo, pullRequestData);
        return NextResponse.json({
          success: true,
          mode: 'create',
          pullRequest,
          pullRequestData
        });
      }
    }

  } catch (error) {
    console.error('❌ Pull request generation failed:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to generate pull request',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while generating pull request' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Pull Request Generator API',
    description: 'Generate pull requests for repository improvements',
    endpoints: {
      'POST /api/generate-pull-request': 'Generate pull request for improvements'
    },
    parameters: {
      improvements: 'Array of RepositoryImprovement objects',
      repositoryUrl: 'GitHub repository URL',
      githubToken: 'GitHub personal access token (optional for preview)',
      mode: 'preview | create (default: preview)'
    }
  });
}