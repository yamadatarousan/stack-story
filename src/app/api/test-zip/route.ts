import { NextRequest, NextResponse } from 'next/server';
import { gitHubZipFetcher } from '@/lib/github-zip-fetcher';

/**
 * ZIP分析機能のテストエンドポイント
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing ZIP fetcher...');
    
    // URLパラメータから owner/repo を取得（デフォルトはoctocat/Hello-World）
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner') || 'octocat';
    const repo = searchParams.get('repo') || 'Hello-World';
    
    console.log(`📁 Testing with: ${owner}/${repo}`);
    
    const startTime = Date.now();
    const result = await gitHubZipFetcher.fetchRepositoryAsZip(owner, repo);
    const endTime = Date.now();
    
    // 基本統計
    const stats = {
      processing_time_ms: endTime - startTime,
      files_total: result.allFiles.length,
      files_config: result.configFiles.length,
      files_source: result.sourceFiles.length,
      files_docs: result.documentationFiles.length,
      files_tests: result.testFiles.length
    };
    
    // サンプルファイル情報
    const sampleFiles = result.allFiles.slice(0, 10).map(file => ({
      name: file.fileName,
      size: file.size,
      content_preview: file.content.substring(0, 200) + (file.content.length > 200 ? '...' : '')
    }));
    
    // 設定ファイル詳細
    const configDetails = result.configFiles.map(file => ({
      name: file.fileName,
      size: file.size,
      content_preview: file.content.substring(0, 500) + (file.content.length > 500 ? '...' : '')
    }));
    
    console.log('✅ ZIP test successful:', stats);
    
    return NextResponse.json({
      success: true,
      repository: `${owner}/${repo}`,
      stats,
      sample_files: sampleFiles,
      config_files: configDetails,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ ZIP test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POSTで特定のリポジトリをテスト
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, branch } = body;
    
    if (!owner || !repo) {
      return NextResponse.json({
        success: false,
        error: 'owner and repo are required'
      }, { status: 400 });
    }
    
    console.log(`🧪 Testing ZIP for: ${owner}/${repo}@${branch || 'main'}`);
    
    const startTime = Date.now();
    const result = await gitHubZipFetcher.fetchRepositoryAsZip(owner, repo, branch);
    const endTime = Date.now();
    
    return NextResponse.json({
      success: true,
      repository: `${owner}/${repo}`,
      branch: branch || 'main',
      stats: {
        processing_time_ms: endTime - startTime,
        files_total: result.allFiles.length,
        files_config: result.configFiles.length,
        files_source: result.sourceFiles.length,
        files_docs: result.documentationFiles.length,
        files_tests: result.testFiles.length
      },
      config_files: result.configFiles.map(f => ({
        name: f.fileName,
        size: f.size
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ ZIP POST test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}