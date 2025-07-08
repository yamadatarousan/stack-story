import { NextResponse } from 'next/server';
import { zipBasedAnalyzer } from '@/lib/zip-based-analyzer';
import { practicalRepositorySummarizer } from '@/lib/practical-repository-summarizer';

export async function POST(request: Request) {
  try {
    const { owner, repo } = await request.json();
    
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'owner and repo are required' },
        { status: 400 }
      );
    }
    
    console.log(`🚀 Starting ZIP-based integration test for ${owner}/${repo}`);
    
    const startTime = Date.now();
    
    // 1. ZIP-based analysis
    console.log('📦 Phase 1: ZIP-based repository analysis');
    const zipAnalysis = await zipBasedAnalyzer.analyzeRepository(owner, repo);
    const zipTime = Date.now() - startTime;
    
    console.log(`✅ ZIP analysis complete in ${zipTime}ms`);
    
    // 2. Convert to practical summarizer format
    console.log('🔄 Phase 2: Converting to practical summarizer format');
    const mockAnalysisResult = {
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
    
    // 3. Generate practical summary
    console.log('📝 Phase 3: Generating practical summary');
    const summary = await practicalRepositorySummarizer.generatePracticalSummary(mockAnalysisResult);
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Integration test complete in ${totalTime}ms`);
    
    return NextResponse.json({
      success: true,
      performance: {
        zipAnalysisTime: zipTime,
        totalTime,
        filesAnalyzed: zipAnalysis.detectedFiles.length,
        techStackDetected: zipAnalysis.techStack.length,
        dependenciesFound: zipAnalysis.dependencies.length,
        method: 'ZIP-based'
      },
      zipAnalysis: {
        repository: zipAnalysis.repository,
        techStack: zipAnalysis.techStack,
        dependencies: zipAnalysis.dependencies.slice(0, 10), // 最初の10個のみ
        structure: zipAnalysis.structure,
        fileCount: zipAnalysis.detectedFiles.length,
        summary: zipAnalysis.summary
      },
      practicalSummary: summary,
      comparisonResults: {
        zipBasedTechStack: zipAnalysis.techStack.map(t => t.name),
        zipBasedPrimaryLanguage: zipAnalysis.structure.language,
        zipBasedFramework: zipAnalysis.structure.framework,
        summaryPurpose: summary.whatAndHow.purpose,
        summaryCoreFunction: summary.whatAndHow.coreFunction,
        summaryMainTechnology: summary.technicalApproach.mainTechnology,
        qualityImprovement: summary.technicalApproach.mainTechnology !== '不明な技術' ? 'SUCCESS' : 'NEEDS_IMPROVEMENT'
      }
    });
    
  } catch (error) {
    console.error('❌ ZIP integration test failed:', error);
    
    return NextResponse.json(
      { 
        error: 'ZIP integration test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'ZIP-based integration test endpoint',
    usage: 'POST with { "owner": "owner", "repo": "repo" }',
    examples: [
      { owner: 'octocat', repo: 'Hello-World' },
      { owner: 'expressjs', repo: 'express' },
      { owner: 'facebook', repo: 'react' },
      { owner: 'microsoft', repo: 'typescript' }
    ]
  });
}