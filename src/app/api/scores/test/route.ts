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
    
    const { score = 100 } = data;
    
    // 2. Get server-side Supabase client
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({
        error: 'Database configuration error',
        details: 'Missing environment variables for Supabase',
      }, { status: 500 });
    }
    
    // 3. Create test user ID - this is a test endpoint, so we use a unique ID per test
    const testUserId = `test-user-${Date.now()}`;
    
    // 4. Attempt insertion with minimal fields to avoid column errors
    console.log(`Testing score insertion with user_id: ${testUserId} and score: ${score}`);
    const { error: insertError } = await supabase
      .from('scores')
      .insert([{ 
        user_id: testUserId, 
        score
      }])
      .select();
    
    if (insertError) {
      console.error('Test insert failed:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        details: insertError.message
      }, { status: 500 });
    }
    
    // 5. Verify the data was inserted
    const { data: verifyData, error: verifyError } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Verification failed',
        details: verifyError.message
      }, { status: 500 });
    }
    
    // 6. Success!
    return NextResponse.json({
      success: true,
      message: 'Score inserted successfully',
      data: verifyData
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