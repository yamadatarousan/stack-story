// 簡単なZIPフェッチャーテスト  
import fetch from 'node-fetch';
import * as yauzl from 'yauzl';

// Inline test implementation (avoiding TS compilation issues)

async function testZipFetcher() {
  try {
    console.log('🧪 Testing ZIP fetcher with a small repository...');
    
    // 小さなリポジトリでテスト（例: Hello World系）
    const result = await gitHubZipFetcher.fetchRepositoryAsZip('octocat', 'Hello-World');
    
    console.log('✅ Test successful!');
    console.log('Files found:', {
      config: result.configFiles.length,
      source: result.sourceFiles.length,
      docs: result.documentationFiles.length,
      total: result.allFiles.length
    });
    
    // 内容確認
    if (result.allFiles.length > 0) {
      console.log('\n📁 Sample files:');
      result.allFiles.slice(0, 5).forEach(file => {
        console.log(`  ${file.fileName} (${file.size} bytes)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testZipFetcher();