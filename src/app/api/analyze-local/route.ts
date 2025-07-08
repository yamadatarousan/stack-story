import { NextRequest, NextResponse } from 'next/server';
import { LocalRepoAnalyzer, isValidGitUrl, sanitizeProjectName } from '@/lib/local-repo-analyzer';
import { EnhancedLocalAnalyzer } from '@/lib/enhanced-local-analyzer';
import { zipBasedAnalyzer } from '@/lib/zip-based-analyzer';
import { practicalRepositorySummarizer } from '@/lib/practical-repository-summarizer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const analysisType = formData.get('type') as string;

    if (analysisType === 'git') {
      // Git URLからの分析 - ZIP-based approach
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

      // Extract owner and repo from Git URL
      const urlMatch = gitUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);
      if (!urlMatch) {
        return NextResponse.json(
          { error: 'Could not parse GitHub URL. Please use a valid GitHub repository URL.' },
          { status: 400 }
        );
      }

      const [, owner, repo] = urlMatch;

      console.log(`🚀 Starting ZIP-based local analysis for ${owner}/${repo}`);
      const startTime = Date.now();

      try {
        // ZIP-based analysis (same as /api/analyze)
        const zipAnalysis = await zipBasedAnalyzer.analyzeRepository(owner, repo);
        const zipTime = Date.now() - startTime;

        // Convert to standard AnalysisResult format
        const analysisResult = {
          repository: zipAnalysis.repository,
          techStack: zipAnalysis.techStack,
          dependencies: zipAnalysis.dependencies,
          structure: zipAnalysis.structure,
          summary: zipAnalysis.summary,
          detectedFiles: zipAnalysis.detectedFiles.map(fileName => ({
            name: fileName.split('/').pop() || fileName,
            path: fileName,
            type: 'source' as const,
            size: 0,
            importance: 5
          })),
          zipReadmeContent: zipAnalysis.readmeContent
        };

        // Generate enhanced practical summary
        let practicalSummary;
        try {
          practicalSummary = await practicalRepositorySummarizer.generatePracticalSummary(analysisResult);
        } catch (error) {
          console.warn('⚠️ Practical summary generation failed, using basic analysis:', error);
          practicalSummary = null;
        }

        const totalTime = Date.now() - startTime;

        // Create frontend-compatible projectOverview from practical summary
        const projectOverview = practicalSummary ? {
          purpose: practicalSummary.whatAndHow.purpose || analysisResult.repository.description || `${analysisResult.repository.name} project`,
          mainTechnology: practicalSummary.technicalApproach.mainTechnology || zipAnalysis.techStack[0]?.name || 'Unknown technology',
          category: practicalSummary.whatAndHow.category || 'Software Tool',
          businessDomain: practicalSummary.technicalApproach.domainFocus || 'Development',
          targetAudience: practicalSummary.understandingGuidance?.targetAudience?.[0] || 'Developers',
          architecturalPattern: practicalSummary.technicalApproach.architecturalChoices?.[0] || 'Standard architecture',
          problemSolved: practicalSummary.whatAndHow.coreFunction?.substring(0, 200) || 'Software functionality',
          keyFeatures: practicalSummary.whatAndHow.practicalExamples?.map(ex => ex.scenario) || ['Core functionality'],
          useCases: practicalSummary.whatAndHow.practicalExamples?.map(ex => ex.implementation) || ['General use case'],
          innovationLevel: 'Intermediate',
          marketPosition: 'Open Source Tool'
        } : {
          purpose: analysisResult.repository.description || `${analysisResult.repository.name} project`,
          mainTechnology: zipAnalysis.techStack[0]?.name || 'Unknown technology',
          category: 'Software Tool',
          businessDomain: 'Development',
          targetAudience: 'Developers',
          architecturalPattern: 'Standard architecture',
          problemSolved: zipAnalysis.summary || 'Software functionality',
          keyFeatures: ['Core functionality'],
          useCases: ['General use case'],
          innovationLevel: 'Intermediate',
          marketPosition: 'Open Source Tool'
        };

        const analysis = {
          ...analysisResult,
          practicalSummary,
          projectOverview,
          analysisMetadata: {
            method: 'ZIP-based-local',
            zipAnalysisTime: zipTime,
            totalAnalysisTime: totalTime,
            filesAnalyzed: zipAnalysis.detectedFiles.length,
            apiIndependent: true,
            readmeAnalyzed: !!zipAnalysis.readmeContent,
            qualityImprovement: zipAnalysis.techStack.length > 0 ? 'HIGH' : 'MEDIUM'
          }
        };
          
        return NextResponse.json({
          success: true,
          analysis,
          metadata: {
            analyzedAt: new Date().toISOString(),
            method: 'ZIP-based-local',
            gitUrl,
            apiIndependent: true,
            performance: {
              zipAnalysisTime: zipTime,
              totalTime,
              filesAnalyzed: zipAnalysis.detectedFiles.length
            }
          }
        });
      } catch (zipError) {
        console.error('ZIP-based analysis failed:', zipError);
        
        return NextResponse.json({
          error: 'ZIP-based analysis failed',
          details: zipError instanceof Error ? zipError.message : 'Unknown error'
        }, { status: 500 });
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

      console.log(`🚀 Starting ZIP-based file analysis for ${sanitizedName}`);
      const startTime = Date.now();

      try {
        // Use the existing LocalRepoAnalyzer (now includes README content extraction)
        const analyzer = new LocalRepoAnalyzer();
        const analysisResult = await analyzer.analyzeFromZip(zipBuffer, sanitizedName);

        // Generate enhanced practical summary
        let practicalSummary;
        try {
          practicalSummary = await practicalRepositorySummarizer.generatePracticalSummary(analysisResult);
        } catch (error) {
          console.warn('⚠️ Practical summary generation failed, using basic analysis:', error);
          practicalSummary = null;
        }

        const totalTime = Date.now() - startTime;

        // Create frontend-compatible projectOverview from practical summary
        const projectOverview = practicalSummary ? {
          purpose: practicalSummary.whatAndHow.purpose || analysisResult.repository.description || `${analysisResult.repository.name} project`,
          mainTechnology: practicalSummary.technicalApproach.mainTechnology || analysisResult.techStack[0]?.name || 'Unknown technology',
          category: practicalSummary.whatAndHow.category || 'Software Tool',
          businessDomain: practicalSummary.technicalApproach.domainFocus || 'Development',
          targetAudience: practicalSummary.understandingGuidance?.targetAudience?.[0] || 'Developers',
          architecturalPattern: practicalSummary.technicalApproach.architecturalChoices?.[0] || 'Standard architecture',
          problemSolved: practicalSummary.whatAndHow.coreFunction?.substring(0, 200) || 'Software functionality',
          keyFeatures: practicalSummary.whatAndHow.practicalExamples?.map(ex => ex.scenario) || ['Core functionality'],
          useCases: practicalSummary.whatAndHow.practicalExamples?.map(ex => ex.implementation) || ['General use case'],
          innovationLevel: 'Intermediate',
          marketPosition: 'Open Source Tool'
        } : {
          purpose: analysisResult.repository.description || `${analysisResult.repository.name} project`,
          mainTechnology: analysisResult.techStack[0]?.name || 'Unknown technology',
          category: 'Software Tool',
          businessDomain: 'Development',
          targetAudience: 'Developers',
          architecturalPattern: 'Standard architecture',
          problemSolved: analysisResult.summary || 'Software functionality',
          keyFeatures: ['Core functionality'],
          useCases: ['General use case'],
          innovationLevel: 'Intermediate',
          marketPosition: 'Open Source Tool'
        };

        const analysis = {
          ...analysisResult,
          practicalSummary,
          projectOverview,
          analysisMetadata: {
            method: 'ZIP-file-enhanced',
            zipAnalysisTime: totalTime,
            totalAnalysisTime: totalTime,
            filesAnalyzed: analysisResult.detectedFiles?.length || 0,
            apiIndependent: true,
            readmeAnalyzed: !!(analysisResult as any).zipReadmeContent,
            qualityImprovement: analysisResult.techStack.length > 0 ? 'HIGH' : 'MEDIUM'
          }
        };
        
        return NextResponse.json({
          success: true,
          analysis,
          metadata: {
            analyzedAt: new Date().toISOString(),
            method: 'ZIP-file-enhanced',
            projectName: sanitizedName,
            fileSize: zipFile.size,
            apiIndependent: true,
            performance: {
              analysisTime: totalTime,
              filesAnalyzed: analysisResult.detectedFiles?.length || 0
            }
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