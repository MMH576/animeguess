import { getServerSupabase } from '@/lib/supabaseClient';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/scores - Record a new score
export async function POST(request: NextRequest) {
  // 1. Authenticate the user
  let userId;
  try {
    const auth = getAuth(request);
    userId = auth.userId;
  } catch (authError) {
    console.error('Authentication error:', authError);
    return NextResponse.json(
      { error: 'Authentication service unavailable', details: 'Please try again later' },
      { status: 500 }
    );
  }
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // 2. Parse and validate the score data
    const body = await request.json();
    const { score } = body; // Removed difficulty assignment since it's not used
    
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Invalid score value' },
        { status: 400 }
      );
    }

    // 3. Get server-side Supabase client with admin privileges
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    // 4. Insert the score using the authenticated user's ID
    // Note: We're not including the difficulty field to avoid the column error
    const { data, error } = await supabase
      .from('scores')
      .insert([{ 
        user_id: userId, 
        score
        // Difficulty field removed until database is updated
      }])
      .select()
      .single();

    if (error) {
      console.error('Error submitting score:', error);
      return NextResponse.json(
        { error: 'Failed to save score' },
        { status: 500 }
      );
    }

    // 5. Return success response with the saved score
    return NextResponse.json({ 
      success: true, 
      score: data 
    });
  } catch (error) {
    console.error('Error in score submission:', error);
    return NextResponse.json(
      { error: 'Failed to process score submission' },
      { status: 500 }
    );
  }
}

// GET /api/scores - Get leaderboard
// Query parameters:
// - period: 'all' | 'week' | 'month' (default: 'all')
// - difficulty: 'easy' | 'normal' | 'hard' (default: all difficulties)
// - limit: number (default: 10)
export async function GET(request: NextRequest) {
  try {
    // 1. Parse query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
    // Note: Difficulty parameter is ignored until database is updated
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '10', 10),
      100 // Cap at 100 for performance
    );
    
    // 2. Get server-side Supabase client
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database configuration error', leaderboard: [] },
        { status: 500 }
      );
    }
    
    // 3. Build the query
    let query = supabase
      .from('scores')
      .select('id, user_id, score, created_at')  // Removed difficulty from select
      .order('score', { ascending: false })
      .limit(limit);
    
    // Apply time period filter
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('created_at', monthAgo.toISOString());
    }
    
    // Difficulty filter removed until database is updated
    
    // 4. Execute the query
    const { data, error } = await query;

    // 5. Handle errors
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard', leaderboard: [] },
        { status: 500 }
      );
    }

    // 6. Return the leaderboard data (add default difficulty for UI compatibility)
    const leaderboardWithDifficulty = data?.map(score => ({
      ...score,
      difficulty: 'normal' // Add default difficulty for UI compatibility
    })) || [];
    
    return NextResponse.json({ 
      leaderboard: leaderboardWithDifficulty,
      period,
      difficulty: 'all'  // Default since filtering is disabled
    });
  } catch (error) {
    console.error('Error in leaderboard fetch:', error);
    return NextResponse.json(
      { error: 'Failed to process leaderboard request', leaderboard: [] },
      { status: 500 }
    );
  }
} 