import { createClient } from '@supabase/supabase-js';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Create a direct Supabase client for server operations with proper error handling
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return { client: null, error: 'Missing Supabase environment variables' };
  }
  
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    return { client, error: null };
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return { 
      client: null, 
      error: error instanceof Error ? error.message : 'Unknown error creating Supabase client' 
    };
  }
};

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
    // Get Supabase admin client
    const { client: supabaseAdmin, error: clientError } = getSupabaseAdmin();
    if (clientError || !supabaseAdmin) {
      console.error('Failed to initialize Supabase client:', clientError);
      return NextResponse.json(
        { 
          error: 'Database configuration error', 
          details: clientError || 'No client created',
          hint: 'Check server logs and environment variables'
        },
        { status: 500 }
      );
    }
    
    let playData;
    try {
      playData = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { difficulty = 'normal' } = playData;
    
    // First, check if the user already played today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingPlays, error: queryError } = await supabaseAdmin
      .from('plays')
      .select('id, streak, play_date')
      .eq('user_id', auth.userId)
      .gte('play_date', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (queryError) {
      console.error('Error checking existing plays:', queryError);
      return NextResponse.json(
        { 
          error: 'Database query failed', 
          details: queryError.message,
          hint: queryError.hint || 'Error checking existing plays'
        },
        { status: 500 }
      );
    }
    
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
    
    const { data: yesterdayPlays, error: yesterdayError } = await supabaseAdmin
      .from('plays')
      .select('streak')
      .eq('user_id', auth.userId)
      .gte('play_date', yesterday.toISOString())
      .lt('play_date', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (yesterdayError) {
      console.error('Error checking yesterday plays:', yesterdayError);
      return NextResponse.json(
        { 
          error: 'Database query failed', 
          details: yesterdayError.message,
          hint: yesterdayError.hint || 'Error checking yesterday plays'
        },
        { status: 500 }
      );
    }
    
    // Calculate streak based on yesterday's play
    let streak = 1; // Default to 1 if no previous streak
    if (yesterdayPlays && yesterdayPlays.length > 0) {
      streak = yesterdayPlays[0].streak + 1;
    }
    
    // Record the play with the calculated streak
    const { data, error } = await supabaseAdmin
      .from('plays')
      .insert([{
        user_id: auth.userId,
        streak,
        difficulty
      }])
      .select();

    if (error) {
      console.error('Error inserting play:', error);
      return NextResponse.json(
        { 
          error: 'Failed to record play', 
          details: error.message,
          hint: error.hint || 'Error inserting play record'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error recording play:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record play',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check server logs for more details'
      },
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
    // Get Supabase admin client
    const { client: supabaseAdmin, error: clientError } = getSupabaseAdmin();
    if (clientError || !supabaseAdmin) {
      console.error('Failed to initialize Supabase client:', clientError);
      return NextResponse.json(
        { 
          error: 'Database configuration error', 
          details: clientError || 'No client created',
          hint: 'Check server logs and environment variables'
        },
        { status: 500 }
      );
    }
    
    // Get current streak
    const { data: streakData, error: streakError } = await supabaseAdmin
      .from('plays')
      .select('streak')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (streakError) {
      console.error('Error fetching streak data:', streakError);
      return NextResponse.json(
        { 
          error: 'Database query failed', 
          details: streakError.message,
          hint: streakError.hint || 'Error fetching streak data'
        },
        { status: 500 }
      );
    }
    
    // Get total plays
    const { count: totalPlays, error: countError } = await supabaseAdmin
      .from('plays')
      .select('id', { count: 'exact' })
      .eq('user_id', auth.userId);
      
    if (countError) {
      console.error('Error counting plays:', countError);
      return NextResponse.json(
        { 
          error: 'Database query failed', 
          details: countError.message,
          hint: countError.hint || 'Error counting total plays'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      currentStreak: streakData && streakData.length > 0 ? streakData[0].streak : 0,
      totalPlays: totalPlays || 0
    });
  } catch (error) {
    console.error('Error fetching play stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch play statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check server logs for more details'
      },
      { status: 500 }
    );
  }
} 