import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient';

// Track recently created test users to prevent duplicates
const recentTestUsers = new Set<string>();

// Test endpoint for real-time functionality
// GET /api/test-realtime
export async function GET() {
  try {
    // Get server-side Supabase client
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    // Generate a unique test user ID that hasn't been used recently
    const timestamp = Date.now();
    let testUserId = `test-user-${timestamp.toString().slice(-5)}`;
    
    // Make sure we don't reuse a recent user ID
    while (recentTestUsers.has(testUserId)) {
      testUserId = `test-user-${Math.floor(Math.random() * 100000)}`;
    }
    
    // Track this user ID to avoid duplicates
    recentTestUsers.add(testUserId);
    
    // Clean up the set periodically to prevent memory growth
    if (recentTestUsers.size > 100) {
      // Remove oldest entries
      const entriesToRemove = Array.from(recentTestUsers).slice(0, 50);
      entriesToRemove.forEach(entry => recentTestUsers.delete(entry));
    }
    
    // Generate a random score between 1 and 1000
    const score = Math.floor(Math.random() * 1000) + 1;
    
    // Create a readable username for the test user
    const username = `Test User ${timestamp.toString().slice(-3)}`;
    
    // Insert a new test score with username
    const { data, error } = await supabase
      .from('scores')
      .insert([{ 
        user_id: testUserId, 
        score: score,
        username: username
      }])
      .select();

    if (error) {
      console.error('Error inserting test score:', error);
      return NextResponse.json(
        { error: 'Failed to insert test score', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test score inserted successfully',
      score: data[0],
      note: 'This endpoint is for testing real-time updates only'
    });
  } catch (error) {
    console.error('Error in test-realtime endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 