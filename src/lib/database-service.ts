import prisma from '@/lib/db';
import { AnalysisResult, GitHubRepository, TechStackItem, DependencyInfo, ProjectStructure, DetectedFile } from '@/types';

/**
 * 分析結果をデータベースに保存
 */
export async function saveAnalysisResult(analysisResult: AnalysisResult, userId?: string) {
  try {
    const { repository, techStack, dependencies, structure, detectedFiles, summary } = analysisResult;

    // リポジトリを保存または更新
    const savedRepository = await prisma.repository.upsert({
      where: {
        userId_fullName: {
          userId: userId || 'anonymous',
          fullName: repository.full_name,
        },
      },
      update: {
        description: repository.description,
        language: repository.language,
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        updatedAt: new Date(),
      },
      create: {
        name: repository.name,
        fullName: repository.full_name,
        url: repository.html_url,
        description: repository.description,
        language: repository.language,
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        userId: userId || 'anonymous',
      },
    });

    // 分析結果を保存
    const savedAnalysis = await prisma.analysis.create({
      data: {
        repositoryId: savedRepository.id,
        techStack: techStack as any, // Prisma JSONフィールド
        dependencies: dependencies as any,
        structure: structure as any,
      },
    });

    return {
      repository: savedRepository,
      analysis: savedAnalysis,
    };
  } catch (error) {
    console.error('Error saving analysis result:', error);
    throw new Error('Failed to save analysis result to database');
  }
}

/**
 * リポジトリの分析履歴を取得
 */
export async function getRepositoryAnalyses(fullName: string, userId?: string) {
  try {
    const repository = await prisma.repository.findUnique({
      where: {
        userId_fullName: {
          userId: userId || 'anonymous',
          fullName,
        },
      },
      include: {
        analyses: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // 最新10件
        },
      },
    });

    return repository;
  } catch (error) {
    console.error('Error fetching repository analyses:', error);
    throw new Error('Failed to fetch repository analyses');
  }
}

/**
 * ユーザーの分析履歴を取得
 */
export async function getUserAnalyses(userId: string, limit: number = 20) {
  try {
    const repositories = await prisma.repository.findMany({
      where: {
        userId,
      },
      include: {
        analyses: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // 最新の分析のみ
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    return repositories;
  } catch (error) {
    console.error('Error fetching user analyses:', error);
    throw new Error('Failed to fetch user analyses');
  }
}

/**
 * 分析結果の詳細を取得
 */
export async function getAnalysisById(analysisId: string) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: {
        id: analysisId,
      },
      include: {
        repository: true,
        articles: true,
      },
    });

    return analysis;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw new Error('Failed to fetch analysis');
  }
}

/**
 * 人気のリポジトリを取得（stars数順）
 */
export async function getPopularRepositories(limit: number = 10) {
  try {
    const repositories = await prisma.repository.findMany({
      where: {
        stars: {
          gte: 1, // 1スター以上
        },
      },
      include: {
        analyses: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        stars: 'desc',
      },
      take: limit,
    });

    return repositories;
  } catch (error) {
    console.error('Error fetching popular repositories:', error);
    throw new Error('Failed to fetch popular repositories');
  }
}

/**
 * 最近の分析を取得
 */
export async function getRecentAnalyses(limit: number = 10) {
  try {
    const analyses = await prisma.analysis.findMany({
      include: {
        repository: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return analyses;
  } catch (error) {
    console.error('Error fetching recent analyses:', error);
    throw new Error('Failed to fetch recent analyses');
  }
}

/**
 * 技術スタック統計を取得
 */
export async function getTechStackStats() {
  try {
    const analyses = await prisma.analysis.findMany({
      select: {
        techStack: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1000, // 最新1000件
    });

    // 技術スタックの集計
    const techCounts: Record<string, number> = {};
    const categoryRanks: Record<string, Record<string, number>> = {};

    analyses.forEach(analysis => {
      const techStack = analysis.techStack as TechStackItem[];
      techStack.forEach(tech => {
        // 技術名でカウント
        techCounts[tech.name] = (techCounts[tech.name] || 0) + 1;
        
        // カテゴリー別でカウント
        if (!categoryRanks[tech.category]) {
          categoryRanks[tech.category] = {};
        }
        categoryRanks[tech.category][tech.name] = 
          (categoryRanks[tech.category][tech.name] || 0) + 1;
      });
    });

    // トップ技術の抽出
    const topTechnologies = Object.entries(techCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    // カテゴリー別トップ
    const topByCategory = Object.entries(categoryRanks).reduce((acc, [category, techs]) => {
      acc[category] = Object.entries(techs)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      return acc;
    }, {} as Record<string, Array<{ name: string; count: number }>>);

    return {
      totalAnalyses: analyses.length,
      topTechnologies,
      topByCategory,
    };
  } catch (error) {
    console.error('Error fetching tech stack stats:', error);
    throw new Error('Failed to fetch tech stack statistics');
  }
}

/**
 * 分析結果を削除
 */
export async function deleteAnalysis(analysisId: string, userId?: string) {
  try {
    // 権限チェック（ユーザーIDが指定されている場合）
    if (userId) {
      const analysis = await prisma.analysis.findUnique({
        where: { id: analysisId },
        include: { repository: true },
      });

      if (!analysis || analysis.repository.userId !== userId) {
        throw new Error('Unauthorized to delete this analysis');
      }
    }

    await prisma.analysis.delete({
      where: {
        id: analysisId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw new Error('Failed to delete analysis');
  }
}