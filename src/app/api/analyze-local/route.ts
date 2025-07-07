import { NextRequest, NextResponse } from 'next/server';
import { LocalRepoAnalyzer, isValidGitUrl, sanitizeProjectName } from '@/lib/local-repo-analyzer';
import { EnhancedLocalAnalyzer } from '@/lib/enhanced-local-analyzer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const analysisType = formData.get('type') as string;

    if (analysisType === 'git') {
      // Git URLからの分析
      const gitUrl = formData.get('gitUrl') as string;
      
      if (!gitUrl) {
        return NextResponse.json(
          { error: 'Git URL is required' },
          { status: 400 }
        );
      }

      if (!isValidGitUrl(gitUrl)) {
        return NextResponse.json(
          { error: 'Invalid Git URL format' },
          { status: 400 }
        );
      }

      const analyzer = new LocalRepoAnalyzer();
      const basicAnalysis = await analyzer.analyzeFromGitUrl(gitUrl);
      
      // Enhanced analysis with deep content analysis
      // Extract repository path from git URL or use temp directory
      const repoName = gitUrl.split('/').pop()?.replace('.git', '') || 'repository';
      const repositoryPath = `/tmp/${repoName}`; // Simplified path - in real implementation would track actual clone path
      
      try {
        const enhancedAnalyzer = new EnhancedLocalAnalyzer();
        const enhancedAnalysis = await enhancedAnalyzer.analyzeLocalRepository(repositoryPath);
        
        const analysis = {
          ...basicAnalysis,
          ...enhancedAnalysis,
          enhancedAnalysis: enhancedAnalysis.enhancedAnalysis,
        };
        
        return NextResponse.json({
          success: true,
          analysis,
          metadata: {
            analyzedAt: new Date().toISOString(),
            method: 'git-clone-enhanced',
            gitUrl,
            enhancedAnalysis: true,
          },
        });
      } catch (enhancedError) {
        console.warn('Enhanced analysis failed, falling back to basic:', enhancedError);
        
        return NextResponse.json({
          success: true,
          analysis: basicAnalysis,
          metadata: {
            analyzedAt: new Date().toISOString(),
            method: 'git-clone-basic',
            gitUrl,
            enhancedAnalysis: false,
            enhancedError: enhancedError instanceof Error ? enhancedError.message : 'Unknown error',
          },
        });
      }

    } else if (analysisType === 'zip') {
      // ZIPファイルからの分析
      const zipFile = formData.get('zipFile') as File;
      const projectName = formData.get('projectName') as string;
      
      if (!zipFile) {
        return NextResponse.json(
          { error: 'ZIP file is required' },
          { status: 400 }
        );
      }

      if (!projectName) {
        return NextResponse.json(
          { error: 'Project name is required' },
          { status: 400 }
        );
      }

      // ファイルサイズ制限 (50MB)
      if (zipFile.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size too large. Maximum 50MB allowed.' },
          { status: 413 }
        );
      }

      const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
      const sanitizedName = sanitizeProjectName(projectName);
      
      const analyzer = new LocalRepoAnalyzer();
      const basicAnalysis = await analyzer.analyzeFromZip(zipBuffer, sanitizedName);
      
      // Enhanced analysis with deep content analysis
      // Extract repository path from project name
      const repositoryPath = `/tmp/${sanitizedName}`; // Simplified path - in real implementation would track actual extract path
      
      try {
        const enhancedAnalyzer = new EnhancedLocalAnalyzer();
        const enhancedAnalysis = await enhancedAnalyzer.analyzeLocalRepository(repositoryPath);
        
        const analysis = {
          ...basicAnalysis,
          ...enhancedAnalysis,
          enhancedAnalysis: enhancedAnalysis.enhancedAnalysis,
        };
        
        return NextResponse.json({
          success: true,
          analysis,
          metadata: {
            analyzedAt: new Date().toISOString(),
            method: 'zip-upload-enhanced',
            projectName: sanitizedName,
            fileSize: zipFile.size,
            enhancedAnalysis: true,
          },
        });
      } catch (enhancedError) {
        console.warn('Enhanced analysis failed, falling back to basic:', enhancedError);
        
        return NextResponse.json({
          success: true,
          analysis: basicAnalysis,
          metadata: {
            analyzedAt: new Date().toISOString(),
            method: 'zip-upload-basic',
            projectName: sanitizedName,
            fileSize: zipFile.size,
            enhancedAnalysis: false,
            enhancedError: enhancedError instanceof Error ? enhancedError.message : 'Unknown error',
          },
        });
      }

    } else {
      return NextResponse.json(
        { error: 'Invalid analysis type. Use "git" or "zip".' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Local analysis error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Local analysis failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          type: 'local-analysis-error',
        },
      },
      { status: 500 }
    );
  }
}

// WebSocket接続用のリアルタイム進捗更新
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required for progress tracking' },
      { status: 400 }
    );
  }

  // 実際の実装では、WebSocketまたはServer-Sent Eventsを使用
  // ここでは簡単なポーリング用のエンドポイントとして実装
  return NextResponse.json({
    message: 'Progress tracking endpoint. Use WebSocket for real-time updates.',
    sessionId,
  });
}