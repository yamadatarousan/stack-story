import { NextRequest, NextResponse } from 'next/server';
import { getTechStackStats } from '@/lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const stats = await getTechStackStats();

    return NextResponse.json({
      success: true,
      data: stats,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
      },
    });

  } catch (error) {
    console.error('Error fetching tech stack stats:', error);
    
    return NextResponse.json(
      { 
        error: {
          message: 'Failed to fetch technology statistics',
          details: error,
        }
      },
      { status: 500 }
    );
  }
}