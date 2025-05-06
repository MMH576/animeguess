import { supabase } from '@/lib/supabaseClient';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/debug - Test connectivity and authentication
export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection
    const { error: supabaseError } = await supabase
      .from('_supabase_health_check')
      .select('*')
      .limit(1);
    
    // Get authentication status
    const auth = getAuth(request);
    
    return NextResponse.json({
      supabase: {
        connected: !supabaseError,
        error: supabaseError ? supabaseError.message : null,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'
      },
      clerk: {
        authenticated: !!auth.userId,
        userId: auth.userId || null
      },
      environment: {
        supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        clerkConfigured: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Debug API failed' }, { status: 500 });
  }
} 