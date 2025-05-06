import { supabase } from '@/lib/supabaseClient';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/plays - Record a game play
export async function POST(request: NextRequest) {
  const auth = getAuth(request);
  
  // Check if user is authenticated
  if (!auth.userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { difficulty = 'normal' } = await request.json();
    
    // First, check if the user already played today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingPlays, error: queryError } = await supabase
      .from('plays')
      .select('id, streak, play_date')
      .eq('user_id', auth.userId)
      .gte('play_date', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (queryError) throw queryError;
    
    // If already played today, don't do anything
    if (existingPlays && existingPlays.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already recorded a play today',
        data: existingPlays[0]
      });
    }
    
    // Check yesterday's play to calculate streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: yesterdayPlays, error: yesterdayError } = await supabase
      .from('plays')
      .select('streak')
      .eq('user_id', auth.userId)
      .gte('play_date', yesterday.toISOString())
      .lt('play_date', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (yesterdayError) throw yesterdayError;
    
    // Calculate streak based on yesterday's play
    let streak = 1; // Default to 1 if no previous streak
    if (yesterdayPlays && yesterdayPlays.length > 0) {
      streak = yesterdayPlays[0].streak + 1;
    }
    
    // Record the play with the calculated streak
    const { data, error } = await supabase
      .from('plays')
      .insert([{
        user_id: auth.userId,
        streak,
        difficulty
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error recording play:', error);
    return NextResponse.json(
      { error: 'Failed to record play' },
      { status: 500 }
    );
  }
}

// GET /api/plays/stats - Get play statistics
export async function GET(request: NextRequest) {
  const auth = getAuth(request);
  
  // Check if user is authenticated
  if (!auth.userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Get current streak
    const { data: streakData, error: streakError } = await supabase
      .from('plays')
      .select('streak')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (streakError) throw streakError;
    
    // Get total plays
    const { count: totalPlays, error: countError } = await supabase
      .from('plays')
      .select('id', { count: 'exact' })
      .eq('user_id', auth.userId);
      
    if (countError) throw countError;
    
    return NextResponse.json({
      currentStreak: streakData && streakData.length > 0 ? streakData[0].streak : 0,
      totalPlays: totalPlays || 0
    });
  } catch (error) {
    console.error('Error fetching play stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch play statistics' },
      { status: 500 }
    );
  }
} 