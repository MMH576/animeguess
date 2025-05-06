import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getAuth } from '@clerk/nextjs/server';

/**
 * This is a test endpoint for debugging score submission issues
 * It returns detailed connection and environment information
 */
export async function GET(request: NextRequest) {
  const auth = getAuth(request);
  
  return NextResponse.json({
    auth: {
      isAuthenticated: !!auth.userId,
      userId: auth.userId || null
    },
    supabase: {
      configured: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      client: {
        initialized: !!supabase
      }
    },
    testValues: {
      validScore: 100
    },
    message: "Use this endpoint to test Supabase connections. Make a POST request with a score to test submission."
  });
}

/**
 * Test endpoint for score submission
 * Returns detailed error information if submission fails
 */
export async function POST(request: NextRequest) {
  const auth = getAuth(request);
  
  // Check if user is authenticated
  if (!auth.userId) {
    return NextResponse.json({
      success: false,
      error: 'Authentication required',
      authDetails: { userId: null }
    }, { status: 401 });
  }

  try {
    // Parse request body
    let body;
    try {
      const text = await request.text();
      console.log('Request body text:', text);
      body = text ? JSON.parse(text) : {};
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Request parsing failed',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        solution: 'Ensure you\'re sending valid JSON with a "score" field'
      }, { status: 400 });
    }
    
    // Use provided score or fallback to test value
    const score = typeof body.score === 'number' ? body.score : 50;
    
    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase configuration missing',
        details: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        },
        solution: 'Check your .env.local file'
      }, { status: 500 });
    }
    
    // Attempt insert with detailed error handling
    try {
      console.log(`Test inserting score ${score} for user ${auth.userId}`);
      
      const { data, error } = await supabase
        .from('scores')
        .insert([{ user_id: auth.userId, score }])
        .select();
      
      if (error) {
        return NextResponse.json({
          success: false,
          error: 'Database insertion failed',
          details: error,
          debug: {
            userId: auth.userId,
            score,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
          }
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Score inserted successfully',
        data,
        testInfo: 'If this worked, your main score submission should also work'
      });
    } catch (supabaseError) {
      return NextResponse.json({
        success: false,
        error: 'Supabase operation error',
        details: supabaseError instanceof Error ? supabaseError.message : 'Unknown error',
        trace: supabaseError instanceof Error ? supabaseError.stack : null
      }, { status: 500 });
    }
  } catch (generalError) {
    return NextResponse.json({
      success: false,
      error: 'General test failure',
      details: generalError instanceof Error ? generalError.message : 'Unknown error',
      trace: generalError instanceof Error ? generalError.stack : null
    }, { status: 500 });
  }
} 