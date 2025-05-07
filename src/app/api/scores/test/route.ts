import { getServerSupabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

/**
 * This is a test endpoint for debugging score submission issues
 * It returns detailed connection and environment information
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);

    // Get server-side Supabase client
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({
        error: 'Database configuration error'
      }, { status: 500 });
    }
    
    // Query latest scores
    const { data, error } = await supabase
      .from('scores')
      .select('id, user_id, score, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Query failed',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      scores: data || [],
      message: 'Test the main leaderboard at /api/scores?period=all&limit=10'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Test endpoint for score submission
 * This endpoint bypasses authentication for testing purposes
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse request
    let data;
    try {
      data = await request.json();
    } catch {
      // Default test data
      data = { score: 100 };
    }
    
    const { score = 100, userId = null } = data;
    
    // 2. Get server-side Supabase client
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({
        error: 'Database configuration error',
        details: 'Missing environment variables for Supabase',
      }, { status: 500 });
    }
    
    // 3. Create or use provided test user ID
    const testUserId = userId || `test-user-${Date.now()}`;
    
    // 4. Check if this test user already has a score
    const { data: existingScore, error: fetchError } = await supabase
      .from('scores')
      .select('id, score')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let result;
    
    // 5. Add to existing score or create new score
    if (existingScore) {
      console.log(`Test user ${testUserId} has existing score: ${existingScore.score}, adding new score: ${score}`);
      
      // Calculate cumulative score
      const newTotalScore = existingScore.score + score;
      
      // Update with cumulative total
      const { data, error: updateError } = await supabase
        .from('scores')
        .update({ score: newTotalScore })
        .eq('id', existingScore.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Test update failed:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Update failed',
          details: updateError.message
        }, { status: 500 });
      }
      
      result = data;
    } else {
      // No existing score found or error occurred
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Test check failed:', fetchError);
        return NextResponse.json({
          success: false,
          error: 'Failed to check existing score',
          details: fetchError.message
        }, { status: 500 });
      }
      
      // 6. If no existing score, insert a new one
      console.log(`Testing score insertion with user_id: ${testUserId} and score: ${score}`);
      const { data, error: insertError } = await supabase
        .from('scores')
        .insert([{ 
          user_id: testUserId, 
          score
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Test insert failed:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Insert failed',
          details: insertError.message
        }, { status: 500 });
      }
      
      result = data;
    }
    
    // 7. Success!
    return NextResponse.json({
      success: true,
      message: existingScore ? 'Score added to existing total' : 'New score created',
      previousScore: existingScore ? existingScore.score : 0,
      addedScore: score,
      newTotal: result.score,
      data: result,
      userId: testUserId
    });
  } catch (error) {
    console.error('Unexpected error in test endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 