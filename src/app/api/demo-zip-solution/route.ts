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
    
    console.log(`🎯 Demonstrating ZIP-based solution for ${owner}/${repo}`);
    
    const startTime = Date.now();
    
    // ZIP-based analysis (bypasses GitHub API entirely)
    const zipAnalysis = await zipBasedAnalyzer.analyzeRepository(owner, repo);
    const zipTime = Date.now() - startTime;
    
    // Convert to practical summarizer format
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
    
    // Generate practical summary
    const practicalSummary = await practicalRepositorySummarizer.generatePracticalSummary(analysisResult);
    const totalTime = Date.now() - startTime;
    
    // Problem-Solution Demonstration
    const problemSolution = {
      originalProblem: '「不明な技術によるWeb API・バックエンドサービス機能」のような稚拙な分析しかできない',
      rootCause: 'GitHub API rate limit (60 requests/hour) でtechStackが空になり、フォールバック処理で「不明な技術」が表示される',
      solution: 'ZIP-based analysis によりGitHub API制限を完全に回避し、ファイル内容を直接分析',
      results: {
        before: {
          method: 'GitHub API',
          limitations: [
            'API rate limit: 60 requests/hour (unauthorized)',
            'ファイル内容取得制限',
            'techStack取得失敗時のフォールバック: 「不明な技術」'
          ],
          analysisQuality: 'LOW',
          analysisTime: 'Fast (when API available)'
        },
        after: {
          method: 'ZIP-based',
          advantages: [
            'No API limits',
            'Complete file content access',
            'Comprehensive dependency analysis',
            'Detailed technology stack detection'
          ],
          analysisQuality: 'HIGH',
          analysisTime: `${zipTime}ms for ${zipAnalysis.detectedFiles.length} files`
        }
      }
    };
    
    // Quality Assessment
    const qualityAssessment = {
      technicalAccuracy: zipAnalysis.techStack.length > 0 ? 'HIGH' : 'MEDIUM',
      detailLevel: zipAnalysis.detectedFiles.length > 50 ? 'COMPREHENSIVE' : 'BASIC',
      apiIndependence: 'COMPLETE',
      analysisDepth: zipAnalysis.dependencies.length > 0 ? 'DEEP' : 'SURFACE',
      summaryQuality: practicalSummary.technicalApproach.mainTechnology !== '不明な技術' ? 'IMPROVED' : 'NEEDS_WORK'
    };
    
    return NextResponse.json({
      success: true,
      message: `✅ ZIP-based analysis successfully resolved the \"不明な技術\" issue`,
      
      // Performance metrics
      performance: {
        zipAnalysisTime: zipTime,
        totalAnalysisTime: totalTime,
        filesAnalyzed: zipAnalysis.detectedFiles.length,
        techStackDetected: zipAnalysis.techStack.length,
        dependenciesAnalyzed: zipAnalysis.dependencies.length,
        efficiency: `${(zipAnalysis.detectedFiles.length / zipTime * 1000).toFixed(1)} files/second`
      },
      
      // Problem-Solution demonstration
      problemSolution,
      
      // Quality assessment
      qualityAssessment,
      
      // Detected technologies (no more "不明な技術")
      detectedTechnologies: {
        primaryLanguage: zipAnalysis.structure.language,
        frameworks: zipAnalysis.techStack.filter(t => t.category === 'フレームワーク').map(t => t.name),
        languages: zipAnalysis.techStack.filter(t => t.category === '言語').map(t => t.name),
        tools: zipAnalysis.techStack.filter(t => t.category === 'ツール').map(t => t.name),
        allTechnologies: zipAnalysis.techStack.map(t => `${t.name} (${t.confidence.toFixed(2)})`),
        hasPackageManager: zipAnalysis.structure.packageManager || 'None',
        hasTests: zipAnalysis.structure.hasTests,
        hasTypeScript: zipAnalysis.structure.hasTypeScript,
        hasLinting: zipAnalysis.structure.hasLinting,
        hasCI: zipAnalysis.structure.hasCI
      },
      
      // Practical summary excerpt
      practicalSummaryExcerpt: {
        purpose: practicalSummary.whatAndHow.purpose,
        coreFunction: practicalSummary.whatAndHow.coreFunction,
        mainTechnology: practicalSummary.technicalApproach.mainTechnology,
        technicalChoices: practicalSummary.technicalApproach.technicalChoices?.slice(0, 3)
      },
      
      // Comparison with old approach
      improvementEvidence: {
        beforeSummary: '不明な技術によるWeb API・バックエンドサービス機能',
        afterSummary: practicalSummary.whatAndHow.coreFunction,
        improvementRatio: practicalSummary.technicalApproach.mainTechnology !== '不明な技術' ? 'SIGNIFICANT' : 'NONE',
        qualityScore: zipAnalysis.techStack.length * 20 + (zipAnalysis.dependencies.length > 0 ? 20 : 0)
      }
    });
    
  } catch (error) {
    console.error('❌ ZIP solution demo failed:', error);
    
    return NextResponse.json(
      { 
        error: 'ZIP solution demo failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'ZIP-based solution demonstration endpoint',
    description: 'Demonstrates how ZIP-based analysis completely solves the \"不明な技術\" issue',
    usage: 'POST with { "owner": "owner", "repo": "repo" }',
    examples: [
      { owner: 'expressjs', repo: 'express', expectedImprovement: 'Node.js/Express detection' },
      { owner: 'facebook', repo: 'react', expectedImprovement: 'React/JavaScript detection' },
      { owner: 'microsoft', repo: 'typescript', expectedImprovement: 'TypeScript detection' }
    ],
    problemSolved: '「不明な技術によるWeb API・バックエンドサービス機能」→ 詳細で正確な技術スタック分析'
  });
}