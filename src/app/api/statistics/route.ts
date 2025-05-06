import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/statistics?query=top10&period=week
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || 'top10';
  const period = searchParams.get('period') || 'all';
  
  try {
    // Handle different query types
    switch (query) {
      case 'top10': {
        return await getTopPlayers(10, period);
      }
      case 'averageScore': {
        return await getAverageScores();
      }
      default:
        return NextResponse.json(
          { error: 'Invalid query type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error running statistics query:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// Get top N players for a given time period
async function getTopPlayers(limit = 10, period: string = 'all') {
  let query = supabase
    .from('scores')
    .select('user_id, score')
    .order('score', { ascending: false })
    .limit(limit);
  
  // Apply time period filter
  if (period === 'week') {
    query = query.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  } else if (period === 'month') {
    query = query.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return NextResponse.json({ 
    top_players: data 
  });
}

// Get average score per user
async function getAverageScores() {
  // This uses a more complex SQL query to get average scores per user
  const { data, error } = await supabase
    .rpc('get_average_scores_per_user');
  
  if (error) {
    // If the RPC function doesn't exist, use a fallback approach
    // Ideally, you would create an RPC function in Supabase
    console.warn('RPC function not available, using fallback query');
    
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('scores')
      .select('user_id, score');
      
    if (fallbackError) throw fallbackError;
    
    // Calculate average scores manually
    const userScores: Record<string, number[]> = {};
    fallbackData?.forEach(score => {
      if (!userScores[score.user_id]) {
        userScores[score.user_id] = [];
      }
      userScores[score.user_id].push(score.score);
    });
    
    const averages = Object.entries(userScores).map(([user_id, scores]) => {
      const total = scores.reduce((sum, score) => sum + score, 0);
      return {
        user_id,
        average_score: total / scores.length
      };
    });
    
    return NextResponse.json({ average_scores: averages });
  }
  
  return NextResponse.json({ average_scores: data });
} 