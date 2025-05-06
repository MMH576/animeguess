import { supabase } from '@/lib/supabaseClient';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/scores - Record a new score
export async function POST(request: NextRequest) {
  const auth = getAuth(request);
  
  // Check if user is authenticated
  if (!auth.userId) {
    console.log('Authentication failed: No userId in auth context');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    let scoreData;
    try {
      scoreData = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { score } = scoreData;
    
    // Validate score
    if (typeof score !== 'number' || score < 0) {
      console.log('Invalid score value:', score);
      return NextResponse.json(
        { error: 'Invalid score value' },
        { status: 400 }
      );
    }

    console.log(`Inserting score ${score} for user ${auth.userId}`);

    // Check if Supabase client is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured');
      return NextResponse.json(
        { error: 'Database configuration error', detail: 'Missing environment variables' },
        { status: 500 }
      );
    }

    // Insert score into Supabase
    try {
      const { data, error } = await supabase
        .from('scores')
        .insert([{ user_id: auth.userId, score }])
        .select();

      if (error) {
        console.error('Supabase error when inserting score:', error);
        return NextResponse.json(
          { error: 'Database error', details: error.message },
          { status: 500 }
        );
      }

      console.log('Score inserted successfully:', data);
      return NextResponse.json({ success: true, data });
    } catch (supabaseError) {
      console.error('Supabase operation failed:', supabaseError);
      return NextResponse.json(
        { 
          error: 'Database operation failed', 
          details: supabaseError instanceof Error ? supabaseError.message : 'Unknown database error' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { error: 'Failed to save score', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/scores - Get leaderboard
// ?period=week|month|all&limit=10
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || 'week';
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  try {
    // Check if Supabase client is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured');
      return NextResponse.json(
        { error: 'Database configuration error', leaderboard: [] },
        { status: 500 }
      );
    }
    
    let query = supabase
      .from('scores')
      .select('user_id, score, created_at')
      .order('score', { ascending: false })
      .limit(limit);
    
    // Apply time period filter
    if (period === 'week') {
      query = query.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    } else if (period === 'month') {
      query = query.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    }
    
    try {
      const { data, error } = await query;

      if (error) {
        console.error('Supabase error when fetching leaderboard:', error);
        return NextResponse.json(
          { error: error.message, leaderboard: [] },
          { status: 500 }
        );
      }

      return NextResponse.json({ leaderboard: data || [] });
    } catch (supabaseError) {
      console.error('Supabase query failed:', supabaseError);
      return NextResponse.json(
        { 
          error: 'Database query failed', 
          details: supabaseError instanceof Error ? supabaseError.message : 'Unknown database error',
          leaderboard: [] 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard', 
        details: error instanceof Error ? error.message : 'Unknown error',
        leaderboard: [] 
      },
      { status: 500 }
    );
  }
} 