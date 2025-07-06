import { NextResponse } from 'next/server';
import { getRateLimit } from '@/lib/github';

export async function GET() {
  try {
    const rateLimit = await getRateLimit();
    
    if (!rateLimit) {
      return NextResponse.json(
        { error: 'Failed to fetch rate limit information' },
        { status: 500 }
      );
    }

    return NextResponse.json(rateLimit);
  } catch (error) {
    console.error('Error fetching rate limit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit information' },
      { status: 500 }
    );
  }
}