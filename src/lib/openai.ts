import { OpenAI } from 'openai';
import { AnalysisResult, GeneratedArticle, ArticleTemplate, TechStackItem } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 分析結果から技術記事を生成
 */
export async function generateTechArticle(
  analysisResult: AnalysisResult,
  template?: ArticleTemplate
): Promise<GeneratedArticle> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const { repository, techStack, structure, summary } = analysisResult;

  // プロンプトの構築
  const prompt = buildArticlePrompt(repository, techStack, structure, summary, template);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたは技術ブログライターです。GitHubリポジトリの分析結果から、技術者向けの質の高い解説記事を作成してください。

記事の要件：
- 日本語で執筆
- Markdown形式で出力
- 2000-3000文字程度
- 技術的に正確で実用的な内容
- 読みやすい構成と適切な見出し
- コード例やサンプルを含める（必要に応じて）
- SEOを意識したタイトルと構成`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    // タイトルを抽出（最初のh1タグまたは最初の行）
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `${repository.name} の技術スタック解説`;

    // メタデータの生成
    const wordCount = content.length;
    const readingTime = Math.ceil(wordCount / 500); // 1分500文字と仮定
    const tags = extractTags(techStack);
    const difficulty = determineDifficulty(techStack, structure);

    return {
      title,
      content,
      markdown: content,
      metadata: {
        wordCount,
        readingTime,
        tags,
        difficulty,
      },
    };
  } catch (error) {
    console.error('Error generating article:', error);
    throw new Error('Failed to generate article with OpenAI');
  }
}

/**
 * 記事生成用のプロンプトを構築
 */
function buildArticlePrompt(
  repository: any,
  techStack: TechStackItem[],
  structure: any,
  summary: string,
  template?: ArticleTemplate
): string {
  const basePrompt = `
以下のGitHubリポジトリの分析結果を基に技術記事を作成してください：

## リポジトリ情報
- 名前: ${repository.name}
- フルネーム: ${repository.full_name}
- 説明: ${repository.description || 'なし'}
- 主要言語: ${repository.language || '不明'}
- スター数: ${repository.stargazers_count}
- フォーク数: ${repository.forks_count}
- URL: ${repository.html_url}

## プロジェクト概要
${summary}

## 技術スタック
${techStack.map(tech => 
  `- **${tech.name}** (${tech.category}): ${tech.description || '技術解説'}`
).join('\n')}

## プロジェクト構造
- タイプ: ${structure.type}
- 言語: ${structure.language}
- フレームワーク: ${structure.framework || 'なし'}
- ビルドツール: ${structure.buildTool || 'なし'}
- パッケージマネージャー: ${structure.packageManager || 'なし'}
- テスト: ${structure.hasTests ? 'あり' : 'なし'}
- ドキュメント: ${structure.hasDocumentation ? 'あり' : 'なし'}
- CI/CD: ${structure.hasCI ? 'あり' : 'なし'}

記事の構成：
1. プロジェクトの概要
2. 技術スタックの詳細解説
3. アーキテクチャの分析
4. 注目すべき技術選択とその理由
5. 開発者が学べるポイント
6. まとめ

技術的な深掘りをしつつ、初心者にも理解しやすい解説を心がけてください。
`;

  if (template) {
    return basePrompt + `\n\nテンプレート指示：\n${template.sections.map(section => 
      `## ${section.title}\n${section.prompt}`
    ).join('\n\n')}`;
  }

  return basePrompt;
}

/**
 * 技術スタックからタグを抽出
 */
function extractTags(techStack: TechStackItem[]): string[] {
  const tags = new Set<string>();
  
  techStack.forEach(tech => {
    tags.add(tech.name);
    tags.add(tech.category);
  });

  // 最大10個のタグに制限
  return Array.from(tags).slice(0, 10);
}

/**
 * 難易度を判定
 */
function determineDifficulty(
  techStack: TechStackItem[],
  structure: any
): 'beginner' | 'intermediate' | 'advanced' {
  let complexityScore = 0;

  // 技術数による複雑度
  complexityScore += techStack.length * 0.5;

  // フレームワークの複雑度
  const advancedFrameworks = ['React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js'];
  const hasAdvancedFramework = techStack.some(tech => 
    advancedFrameworks.includes(tech.name)
  );
  if (hasAdvancedFramework) complexityScore += 2;

  // インフラ関連技術
  const hasInfra = techStack.some(tech => 
    tech.category === 'service' || tech.name === 'Docker'
  );
  if (hasInfra) complexityScore += 1.5;

  // CI/CDの有無
  if (structure.hasCI) complexityScore += 1;

  // テスト環境の充実度
  if (structure.hasTests) complexityScore += 1;

  if (complexityScore <= 3) return 'beginner';
  if (complexityScore <= 7) return 'intermediate';
  return 'advanced';
}

/**
 * 記事のサマリーを生成
 */
export async function generateArticleSummary(
  analysisResult: AnalysisResult
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const { repository, techStack, summary } = analysisResult;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '100-150文字程度で技術プロジェクトの魅力的なサマリーを作成してください。',
        },
        {
          role: 'user',
          content: `リポジトリ: ${repository.name}\n説明: ${repository.description}\n技術: ${techStack.map(t => t.name).join(', ')}\n概要: ${summary}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return summary;
  }
}

/**
 * 記事テンプレートの一覧
 */
export const articleTemplates: ArticleTemplate[] = [
  {
    id: 'standard',
    name: '標準的な技術解説',
    description: 'バランスの取れた一般的な技術記事',
    sections: [
      {
        title: 'プロジェクト概要',
        type: 'introduction',
        prompt: 'プロジェクトの目的と特徴を簡潔に説明',
        order: 1,
      },
      {
        title: '技術スタック解説',
        type: 'tech-overview',
        prompt: '使用されている技術の詳細な解説',
        order: 2,
      },
      {
        title: 'アーキテクチャ分析',
        type: 'architecture',
        prompt: 'システム構成と設計思想の分析',
        order: 3,
      },
      {
        title: '学べるポイント',
        type: 'features',
        prompt: '開発者が参考にできる技術的なポイント',
        order: 4,
      },
      {
        title: 'まとめ',
        type: 'conclusion',
        prompt: '記事の要点と今後の展望',
        order: 5,
      },
    ],
  },
  {
    id: 'beginner',
    name: '初心者向け解説',
    description: '技術初心者にも分かりやすい構成',
    sections: [
      {
        title: 'このプロジェクトとは？',
        type: 'introduction',
        prompt: '専門用語を避けて、プロジェクトの概要を初心者向けに説明',
        order: 1,
      },
      {
        title: '使われている技術を学ぼう',
        type: 'tech-overview',
        prompt: '各技術の基本的な説明と、なぜ使われているかを解説',
        order: 2,
      },
      {
        title: '初心者が参考にできるポイント',
        type: 'features',
        prompt: '学習の参考になる点や、真似できる部分を紹介',
        order: 3,
      },
      {
        title: '次のステップ',
        type: 'conclusion',
        prompt: '読者が次に学ぶべきことや、実践方法を提案',
        order: 4,
      },
    ],
  },
  {
    id: 'architecture',
    name: 'アーキテクチャ重視',
    description: 'システム設計に焦点を当てた記事',
    sections: [
      {
        title: 'システム概要',
        type: 'introduction',
        prompt: 'システムの全体像と設計目標',
        order: 1,
      },
      {
        title: '技術選択の理由',
        type: 'tech-overview',
        prompt: 'なぜこの技術を選んだのか、その判断基準',
        order: 2,
      },
      {
        title: 'アーキテクチャの深掘り',
        type: 'architecture',
        prompt: 'システム構成の詳細な分析と設計パターン',
        order: 3,
      },
      {
        title: 'スケーラビリティと保守性',
        type: 'features',
        prompt: '拡張性と保守性の観点からの評価',
        order: 4,
      },
      {
        title: '設計の学び',
        type: 'conclusion',
        prompt: 'アーキテクチャから学べる設計思想',
        order: 5,
      },
    ],
  },
];

/**
 * デフォルトテンプレートを取得
 */
export function getDefaultTemplate(): ArticleTemplate {
  return articleTemplates[0];
}