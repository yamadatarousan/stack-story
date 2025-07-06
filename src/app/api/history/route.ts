import { NextRequest, NextResponse } from 'next/server';
import { getRecentAnalyses, getUserAnalyses, getPopularRepositories } from '@/lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');

    let data;

    switch (type) {
      case 'user':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required for user history' },
            { status: 400 }
          );
        }
        data = await getUserAnalyses(userId, limit);
        break;

      case 'popular':
        data = await getPopularRepositories(limit);
        break;

      case 'recent':
      default:
        data = await getRecentAnalyses(limit);
        break;
    }

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        type,
        count: data.length,
        limit,
        fetchedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    
    return NextResponse.json(
      { 
        error: {
          message: 'Failed to fetch analysis history',
          details: error,
        }
      },
      { status: 500 }
    );
  }
}