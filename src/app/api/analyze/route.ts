import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubUrl } from '@/lib/github';
import { zipBasedAnalyzer } from '@/lib/zip-based-analyzer';
import { practicalRepositorySummarizer } from '@/lib/practical-repository-summarizer';
import { AnalysisError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // GitHub URLをパース
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    console.log(`🚀 Starting ZIP-based analysis for ${owner}/${repo} (bypassing GitHub API limits)`);
    const startTime = Date.now();

    // ZIP-based analysis (完全にGitHub API制限を回避)
    let zipAnalysis;
    try {
      zipAnalysis = await zipBasedAnalyzer.analyzeRepository(owner, repo);
    } catch (error) {
      const analysisError: AnalysisError = {
        message: 'Failed to perform ZIP-based analysis',
        status: 500,
        phase: 'zip-upload',
        repository: `${owner}/${repo}`,
        details: error,
      };
      return NextResponse.json({ error: analysisError }, { status: 500 });
    }

    const zipTime = Date.now() - startTime;
    console.log(`✅ ZIP analysis complete in ${zipTime}ms`);

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

    // Enhanced analysis result with ZIP-based improvements
    const analysis = {
      ...analysisResult,
      // Add practical summary if available
      practicalSummary,
      // Add frontend-compatible projectOverview
      projectOverview,
      // Enhanced metadata
      analysisMetadata: {
        method: 'ZIP-based',
        zipAnalysisTime: zipTime,
        totalAnalysisTime: totalTime,
        filesAnalyzed: zipAnalysis.detectedFiles.length,
        apiIndependent: true,
        readmeAnalyzed: !!zipAnalysis.readmeContent,
        qualityImprovement: zipAnalysis.techStack.length > 0 ? 'HIGH' : 'MEDIUM'
      }
    };

    // データベースに保存（オプション）
    let savedData;
    try {
      // データベースが利用可能な場合のみ保存を試行
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('dummy')) {
        const { saveAnalysisResult } = await import('@/lib/database-service');
        savedData = await saveAnalysisResult(analysis);
      }
    } catch (error) {
      console.error('Failed to save analysis to database:', error);
      // データベース保存に失敗してもレスポンスは返す
    }

    console.log(`🎯 ZIP-based analysis completed successfully for ${owner}/${repo}`);
    console.log(`📊 Results: ${zipAnalysis.techStack.length} technologies, ${zipAnalysis.dependencies.length} dependencies, ${zipAnalysis.detectedFiles.length} files`);

    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        owner,
        repo,
        analysisVersion: '2.0.0-zip',
        method: 'ZIP-based',
        apiIndependent: true,
        saved: !!savedData,
        analysisId: savedData?.analysis?.id,
        performance: {
          zipAnalysisTime: zipTime,
          totalTime,
          filesAnalyzed: zipAnalysis.detectedFiles.length
        }
      },
    });

  } catch (error) {
    console.error('Unexpected error in analysis:', error);
    
    const analysisError: AnalysisError = {
      message: 'An unexpected error occurred during analysis',
      status: 500,
      phase: 'ai-processing',
      details: error,
    };

    return NextResponse.json({ error: analysisError }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stack Story Analysis API',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze - Analyze a GitHub repository',
    },
    example: {
      method: 'POST',
      body: {
        url: 'https://github.com/owner/repo',
      },
    },
  });
}