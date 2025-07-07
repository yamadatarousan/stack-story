import { NextRequest, NextResponse } from 'next/server';
import { practicalRepositorySummarizer } from '@/lib/practical-repository-summarizer';
import { analysisDebugger } from '@/lib/debug-analyzer';
import { AnalysisResult, TechStackItem } from '@/types';

/**
 * テスト用リポジトリ要約エンドポイント
 * 実際のアウトプットを把握するためのデバッグAPI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testData } = body;
    
    console.log('🧪 Testing repository summary with test data...');
    
    // テスト用の模擬データ
    const mockAnalysisResult = {
      repository: {
        id: 123456,
        name: testData?.repoName || 'test-repo',
        full_name: `test-user/${testData?.repoName || 'test-repo'}`,
        description: testData?.description || 'A test repository for analysis',
        html_url: testData?.url || 'https://github.com/test/test-repo',
        language: testData?.language || 'JavaScript',
        stargazers_count: testData?.stars || 10,
        forks_count: 5,
        updated_at: new Date().toISOString(),
        default_branch: 'main',
        owner: {
          login: 'test-user',
          avatar_url: 'https://github.com/test.png',
          html_url: 'https://github.com/test-user'
        }
      },
      techStack: testData?.techStack || [
        { name: 'JavaScript', category: '言語', confidence: 0.9 } as TechStackItem,
        { name: 'React', category: 'フレームワーク', confidence: 0.8 } as TechStackItem,
        { name: 'npm', category: 'ツール', confidence: 0.9 } as TechStackItem
      ],
      structure: {
        type: 'web' as const,
        framework: 'React',
        language: 'JavaScript',
        packageManager: 'npm',
        hasTests: testData?.hasTests || false,
        hasDocumentation: testData?.hasDocumentation || false,
        hasCI: false,
        hasLinting: true,
        hasTypeScript: testData?.hasTypeScript || false
      },
      dependencies: [],
      summary: 'Test repository summary',
      detectedFiles: []
    };
    
    // 実際の要約生成を実行
    const practicalSummary = await practicalRepositorySummarizer.generatePracticalSummary(mockAnalysisResult);
    
    // デバッグ情報の生成
    const debugInfo = analysisDebugger.generateDebugInfo(
      mockAnalysisResult.repository,
      {}, // README analysis will be empty for test
      mockAnalysisResult.techStack,
      practicalSummary
    );
    
    // 要約品質のスコア計算
    const qualityScore = analysisDebugger.calculateSummaryScore(
      practicalSummary.practicalSummary,
      mockAnalysisResult.repository
    );
    
    return NextResponse.json({
      success: true,
      data: {
        practicalSummary,
        debugInfo,
        qualityScore,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Test summary generation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * 複数のテストケースで要約品質をテスト
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Running comprehensive summary quality tests...');
    
    const testCases = [
      {
        name: 'React App',
        repoName: 'my-react-app',
        description: 'A modern React application with TypeScript',
        techStack: [
          { name: 'TypeScript', category: '言語', confidence: 0.9 } as TechStackItem,
          { name: 'React', category: 'フレームワーク', confidence: 0.9 } as TechStackItem,
          { name: 'Vite', category: 'ビルドツール', confidence: 0.8 } as TechStackItem
        ],
        hasTypeScript: true,
        hasTests: true
      },
      {
        name: 'Python CLI Tool',
        repoName: 'data-processor-cli',
        description: 'Command line tool for data processing',
        techStack: [
          { name: 'Python', category: '言語', confidence: 0.9 } as TechStackItem,
          { name: 'Click', category: 'フレームワーク', confidence: 0.8 } as TechStackItem,
          { name: 'pandas', category: 'ライブラリ', confidence: 0.7 } as TechStackItem
        ],
        hasTests: true,
        hasDocumentation: true
      },
      {
        name: 'Generic Project',
        repoName: 'project',
        description: null,
        techStack: [
          { name: 'JavaScript', category: '言語', confidence: 0.5 } as TechStackItem
        ],
        hasTests: false,
        hasDocumentation: false
      },
      {
        name: 'Real CLI Tool',
        repoName: 'awesome-cli-tool',
        description: 'A command-line tool for automating development workflows',
        techStack: [
          { name: 'Go', category: '言語', confidence: 0.9 } as TechStackItem,
          { name: 'Cobra', category: 'CLI', confidence: 0.8 } as TechStackItem,
          { name: 'Docker', category: 'ツール', confidence: 0.7 } as TechStackItem
        ],
        hasTests: true,
        hasDocumentation: true,
        mockReadme: {
          title: 'Awesome CLI Tool',
          description: 'A powerful command-line interface designed to automate common development workflows and boost productivity for software engineers.',
          features: [
            'Automated project scaffolding with customizable templates',
            'Git workflow automation and branch management',
            'Docker container management and deployment',
            'CI/CD pipeline configuration and monitoring'
          ],
          installation: {
            go: 'go install github.com/user/awesome-cli-tool@latest',
            homebrew: 'brew install awesome-cli-tool',
            manual: 'Download from releases page'
          },
          usage: {
            basicUsage: 'awesome-cli-tool [command] [flags]'
          },
          examples: [
            {
              title: 'Create new project',
              code: 'awesome-cli-tool create --template react-ts myapp',
              language: 'bash'
            }
          ]
        }
      },
      {
        name: 'API Service',
        repoName: 'microservice-api',
        description: 'RESTful API microservice for user management',
        techStack: [
          { name: 'Node.js', category: '言語', confidence: 0.9 } as TechStackItem,
          { name: 'Express', category: 'フレームワーク', confidence: 0.9 } as TechStackItem,
          { name: 'MongoDB', category: 'データベース', confidence: 0.8 } as TechStackItem,
          { name: 'Jest', category: 'テスト', confidence: 0.7 } as TechStackItem
        ],
        hasTests: true,
        hasDocumentation: true,
        mockReadme: {
          title: 'Microservice API',
          description: 'A robust RESTful API microservice built with Node.js and Express, providing user management, authentication, and authorization capabilities for modern web applications.',
          features: [
            'JWT-based authentication and authorization',
            'CRUD operations for user management',
            'Rate limiting and request validation',
            'Comprehensive API documentation with Swagger',
            'MongoDB integration with Mongoose ODM',
            'Docker containerization support'
          ],
          installation: {
            npm: 'npm install',
            docker: 'docker-compose up -d'
          },
          usage: {
            basicUsage: 'Start the server: npm start',
            apiReference: 'API endpoints available at /api/docs'
          },
          examples: [
            {
              title: 'User registration',
              code: 'curl -X POST /api/users -H "Content-Type: application/json" -d \'{"email":"user@example.com","password":"secure123"}\'',
              language: 'bash'
            }
          ]
        }
      }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      try {
        const mockAnalysisResult = {
          repository: {
            id: Math.floor(Math.random() * 1000000),
            name: testCase.repoName,
            full_name: `test-user/${testCase.repoName}`,
            description: testCase.description,
            html_url: `https://github.com/test/${testCase.repoName}`,
            language: testCase.techStack[0]?.name || 'Unknown',
            stargazers_count: Math.floor(Math.random() * 100),
            forks_count: Math.floor(Math.random() * 20),
            updated_at: new Date().toISOString(),
            default_branch: 'main',
            owner: { login: 'test-user', avatar_url: '', html_url: '' }
          },
          techStack: testCase.techStack,
          structure: {
            type: 'web' as const,
            framework: testCase.techStack.find(t => t.category === 'フレームワーク')?.name,
            language: testCase.techStack[0]?.name || 'Unknown',
            packageManager: 'npm',
            hasTests: testCase.hasTests || false,
            hasDocumentation: testCase.hasDocumentation || false,
            hasCI: false,
            hasLinting: true,
            hasTypeScript: testCase.hasTypeScript || false
          },
          dependencies: [],
          summary: `Test summary for ${testCase.name}`,
          detectedFiles: [],
          // Pass mock README data if available
          mockReadme: (testCase as any).mockReadme
        };
        
        const practicalSummary = await practicalRepositorySummarizer.generatePracticalSummary(mockAnalysisResult);
        
        const debugInfo = analysisDebugger.generateDebugInfo(
          mockAnalysisResult.repository,
          {},
          mockAnalysisResult.techStack,
          practicalSummary
        );
        
        const qualityScore = analysisDebugger.calculateSummaryScore(
          practicalSummary.practicalSummary,
          mockAnalysisResult.repository
        );
        
        results.push({
          testCase: testCase.name,
          qualityScore,
          overallScore: debugInfo.qualityAssessment.overallScore,
          isGeneric: debugInfo.qualityAssessment.isGeneric,
          hasSpecificDetails: debugInfo.qualityAssessment.hasSpecificDetails,
          purposeGenerated: practicalSummary.whatAndHow.purpose.substring(0, 100),
          coreFunctionGenerated: practicalSummary.whatAndHow.coreFunction.substring(0, 100)
        });
        
      } catch (error) {
        results.push({
          testCase: testCase.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // 結果の分析
    const totalTests = results.length;
    const successfulTests = results.filter(r => !r.error).length;
    const highQualityTests = results.filter(r => r.qualityScore && r.qualityScore > 50).length;
    const genericTests = results.filter(r => r.isGeneric).length;
    
    console.log(`📊 Test Results Summary:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Successful: ${successfulTests}`);
    console.log(`  High Quality (>60): ${highQualityTests}`);
    console.log(`  Generic: ${genericTests}`);
    
    return NextResponse.json({
      success: true,
      summary: {
        totalTests,
        successfulTests,
        highQualityTests,
        genericTests,
        successRate: (successfulTests / totalTests) * 100,
        qualityRate: (highQualityTests / successfulTests) * 100
      },
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}