import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient';

// Simple endpoint to test real-time functionality
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

    // Generate a random score between 1 and 1000
    const randomScore = Math.floor(Math.random() * 1000) + 1;
    
    // Insert a test score
    const { data, error } = await supabase
      .from('scores')
      .insert([{ 
        user_id: 'test-realtime-user', 
        score: randomScore,
        difficulty: 'normal'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting test score:', error);
      return NextResponse.json(
        { error: 'Failed to insert test score' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test score inserted successfully',
      score: data
    });
  } catch (error) {
    console.error('Error in test-realtime endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 