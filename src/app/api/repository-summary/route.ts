import { NextRequest, NextResponse } from 'next/server';
import { repositorySummaryEngine } from '@/lib/repository-summary-engine';
import { practicalRepositorySummarizer } from '@/lib/practical-repository-summarizer';
import { AnalysisResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const analysisResult: AnalysisResult = await request.json();
    
    if (!analysisResult || !analysisResult.repository) {
      console.error('Invalid analysis result:', { hasAnalysisResult: !!analysisResult, hasRepository: !!analysisResult?.repository });
      return NextResponse.json(
        { error: 'Invalid analysis result provided' },
        { status: 400 }
      );
    }

    console.log('🔍 Enhanced repository summary generation started for:', analysisResult.repository.name);
    console.log('📊 Analysis data:', {
      techStack: analysisResult.techStack?.length || 0,
      dependencies: analysisResult.dependencies?.length || 0,
      structure: Object.keys(analysisResult.structure || {}).length,
      hasZipReadme: !!(analysisResult as any).zipReadmeContent,
      hasPracticalSummary: !!(analysisResult as any).practicalSummary
    });

    let summary;
    
    // 1st Priority: Use practical summary if available (from ZIP-based analysis)
    if ((analysisResult as any).practicalSummary) {
      console.log('📦 Using enhanced practical summary from ZIP-based analysis');
      const practicalSummary = (analysisResult as any).practicalSummary;
      
      // Convert practical summary to RepositorySummary format
      summary = {
        description: practicalSummary.whatAndHow.purpose || analysisResult.repository.description || '',
        oneLineSummary: practicalSummary.whatAndHow.coreFunction?.substring(0, 100) || `${analysisResult.repository.name} project`,
        purpose: practicalSummary.whatAndHow.purpose || 'Software development tool',
        category: 'development-tool' as const,
        targetUsers: practicalSummary.understandingGuidance?.targetAudience || ['developers'],
        keyFeatures: practicalSummary.whatAndHow.practicalExamples?.map(ex => ex.scenario) || [],
        useCases: practicalSummary.whatAndHow.practicalExamples?.map(ex => ex.implementation) || [],
        technicalComplexity: 'intermediate' as const,
        maintainabilityScore: 75,
        codeQuality: {
          score: 75,
          testCoverage: analysisResult.structure?.hasTests ? 'medium' : 'low',
          documentation: 'good',
          codeStyle: 'good',
          errorHandling: 'good',
          modularity: 'good'
        } as const,
        maturityLevel: 'stable' as const,
        developmentStatus: 'active' as const,
        architecturePattern: practicalSummary.technicalApproach?.architecturalChoices || [],
        designPrinciples: practicalSummary.technicalApproach?.designDecisions?.map(d => d.decision) || [],
        scalabilityAssessment: {
          score: 70,
          horizontalScaling: 'good',
          verticalScaling: 'good',
          performanceOptimization: 'basic',
          caching: 'basic'
        } as const,
        recommendations: [],
        potentialIssues: [],
        analysisConfidence: 85,
        lastAnalyzed: new Date().toISOString()
      };
    } else {
      // 2nd Priority: Enhanced practical summary generation with ZIP README
      if ((analysisResult as any).zipReadmeContent) {
        console.log('📝 Generating enhanced practical summary with ZIP README content');
        try {
          const enhancedAnalysisResult = {
            ...analysisResult,
            zipReadmeContent: (analysisResult as any).zipReadmeContent
          };
          const practicalSummary = await practicalRepositorySummarizer.generatePracticalSummary(enhancedAnalysisResult);
          
          // Convert to RepositorySummary format
          summary = {
            description: practicalSummary.whatAndHow.purpose || analysisResult.repository.description || '',
            oneLineSummary: practicalSummary.whatAndHow.coreFunction?.substring(0, 100) || `${analysisResult.repository.name} project`,
            purpose: practicalSummary.whatAndHow.purpose || 'Software development tool',
            category: 'development-tool' as const,
            targetUsers: ['developers'],
            keyFeatures: practicalSummary.whatAndHow.practicalExamples?.map(ex => ex.scenario) || [],
            useCases: practicalSummary.whatAndHow.practicalExamples?.map(ex => ex.implementation) || [],
            technicalComplexity: 'intermediate' as const,
            maintainabilityScore: 75,
            codeQuality: {
              score: 75,
              testCoverage: analysisResult.structure?.hasTests ? 'medium' : 'low',
              documentation: 'good',
              codeStyle: 'good',
              errorHandling: 'good',
              modularity: 'good'
            } as const,
            maturityLevel: 'stable' as const,
            developmentStatus: 'active' as const,
            architecturePattern: [],
            designPrinciples: [],
            scalabilityAssessment: {
              score: 70,
              horizontalScaling: 'good',
              verticalScaling: 'good',
              performanceOptimization: 'basic',
              caching: 'basic'
            } as const,
            recommendations: [],
            potentialIssues: [],
            analysisConfidence: 80,
            lastAnalyzed: new Date().toISOString()
          };
        } catch (error) {
          console.warn('⚠️ Enhanced practical summary failed, falling back to repository summary engine:', error);
          summary = await repositorySummaryEngine.generateRepositorySummary(analysisResult);
        }
      } else {
        // 3rd Priority: Fallback to repository summary engine
        console.log('🔄 Using repository summary engine (fallback)');
        summary = await repositorySummaryEngine.generateRepositorySummary(analysisResult);
      }
    }
    
    console.log('✅ Enhanced repository summary generated successfully');
    console.log('📋 Summary details:', {
      category: summary.category,
      complexity: summary.technicalComplexity,
      confidence: summary.analysisConfidence,
      enhancementLevel: (analysisResult as any).practicalSummary ? 'PRACTICAL_SUMMARY' : 
                        (analysisResult as any).zipReadmeContent ? 'ZIP_README' : 'BASIC'
    });
    
    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Repository summary generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Repository summary generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET エンドポイント（テスト用）
export async function GET() {
  return NextResponse.json({
    message: 'Repository Summary API',
    endpoints: {
      'POST /': 'Generate repository summary from analysis result'
    }
  });
}