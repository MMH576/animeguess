import { getServerSupabase } from '@/lib/supabaseClient';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@clerk/clerk-sdk-node';

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
    const { score } = body;
    
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

    // 4. Check if user already has a score
    const { data: existingScore, error: fetchError } = await supabase
      .from('scores')
      .select('id, score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let result;
    
    // 5. Add the new score to the existing total or create a new record
    if (existingScore) {
      // Calculate the new cumulative score
      const newTotalScore = existingScore.score + score;
      
      // Update the user's score with the new total
      const { data, error } = await supabase
        .from('scores')
        .update({ score: newTotalScore })
        .eq('id', existingScore.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating score:', error);
        return NextResponse.json(
          { error: 'Failed to update score' },
          { status: 500 }
        );
      }
      
      result = data;
    } else {
      // No existing score found or error occurred
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error checking existing score:', fetchError);
        return NextResponse.json(
          { error: 'Failed to check existing score' },
          { status: 500 }
        );
      }
      
      // 6. If user has no existing score, insert a new one
      const { data, error } = await supabase
        .from('scores')
        .insert([{ 
          user_id: userId, 
          score
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
      
      result = data;
    }

    // 7. Return success response with the saved/updated score
    return NextResponse.json({ 
      success: true, 
      score: result 
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
// - limit: number (default: 10)
export async function GET(request: NextRequest) {
  try {
    // 1. Parse query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
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
      .select('id, user_id, score, created_at')
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

    // 6. Process results to ensure only one entry per user with the latest score
    const userScoreMap = new Map();
    
    data?.forEach(score => {
      userScoreMap.set(score.user_id, score);
    });
    
    const uniqueScores = Array.from(userScoreMap.values());
    uniqueScores.sort((a, b) => b.score - a.score);

    // 7. Get user information from Clerk
    const clerkClient = await import('@clerk/clerk-sdk-node').then(mod => mod.default);
    const userIds = uniqueScores.map(score => score.user_id);
    let users: User[] = [];
    try {
      users = await clerkClient.users.getUserList({ userId: userIds });
    } catch (error) {
      console.error('Error fetching user details:', error);
    }

    // 8. Combine scores with user information
    const leaderboardWithUserInfo = uniqueScores.map(score => {
      const user = users.find((u: User) => u.id === score.user_id);
      return {
        ...score,
        username: user?.username || user?.firstName || `Player ${score.user_id.substring(0, 2)}`
      };
    });
    
    return NextResponse.json({ 
      leaderboard: leaderboardWithUserInfo.slice(0, limit),
      period
    });
  } catch (error) {
    console.error('Error in leaderboard fetch:', error);
    return NextResponse.json(
      { error: 'Failed to process leaderboard request', leaderboard: [] },
      { status: 500 }
    );
  }
} 