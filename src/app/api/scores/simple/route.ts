import { getServerSupabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

// Type for API responses
type ApiResponse = {
  [key: string]: unknown;
};

// Define a minimal user type with only the properties we need
interface ClerkUser {
  id: string;
  username?: string | null;
  firstName?: string | null;
  emailAddresses?: Array<{emailAddress: string}>;
}

// Helper function to create a response with no-cache headers
const createNoCacheResponse = (data: ApiResponse, status = 200) => {
  return NextResponse.json(data, { 
    status,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

// GET /api/scores/simple - Get leaderboard without Clerk integration
export async function GET(request: NextRequest) {
  console.log('[API] Simple leaderboard fetch started');
  
  try {
    // 1. Parse query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '10', 10),
      100 // Cap at 100 for performance
    );
    console.log(`[API] Parameters: period=${period}, limit=${limit}`);
    
    // 2. Get server-side Supabase client
    console.log('[API] Initializing Supabase client');
    const supabase = getServerSupabase();
    if (!supabase) {
      console.error('[API] Failed to initialize Supabase client - configuration error');
      return createNoCacheResponse(
        { error: 'Database service unavailable', details: 'Configuration error' },
        503
      );
    }
    
    // 3. Build the query
    console.log('[API] Building Supabase query');
    let query = supabase
      .from('scores')
      .select('id, user_id, score, created_at')
      .order('score', { ascending: false });
    
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
    
    // Add limit after filters
    query = query.limit(limit);
    
    // 4. Execute the query
    console.log('[API] Executing database query');
    const { data, error: queryError } = await query;
    
    // Log query results for debugging
    console.log(`[API] Query results: ${data?.length ?? 0} records found`);
    
    // 5. Handle query errors
    if (queryError) {
      console.error('[API] Database query error:', queryError);
      return createNoCacheResponse(
        { 
          error: 'Failed to fetch leaderboard data',
          details: queryError.message,
          code: queryError.code
        },
        500
      );
    }
    
    // If no data is returned, send empty array (not an error)
    if (!data || data.length === 0) {
      console.log('[API] No scores found, returning empty leaderboard');
      return createNoCacheResponse({ 
        leaderboard: [],
        period,
        total: 0
      });
    }

    // 6. Get user information from Clerk
    console.log('[API] Fetching user information from Clerk');
    const clerkClient = await import('@clerk/clerk-sdk-node').then(mod => mod.default);
    const userIds = data.map(score => score.user_id);
    
    let users: ClerkUser[] = [];
    try {
      if (userIds.length > 0) {
        console.log(`[API] Fetching details for ${userIds.length} users`);
        users = await clerkClient.users.getUserList({ userId: userIds }) as ClerkUser[];
        console.log(`[API] Successfully fetched ${users.length} user details`);
      }
    } catch (clerkError) {
      console.error('[API] Error fetching user details:', clerkError);
      // Continue with empty users array - we'll use fallback usernames
    }

    // 7. Combine scores with user information
    console.log('[API] Formatting leaderboard data with real user info');
    const leaderboardWithUserInfo = data.map(score => {
      const user = users.find(u => u.id === score.user_id);
      
      // Use real usernames from Clerk when available
      return {
        ...score,
        username: user?.username || 
                 user?.firstName || 
                 (user?.emailAddresses && user.emailAddresses[0]?.emailAddress.split('@')[0]) || 
                 `Player ${score.user_id.substring(0, 4)}`,
      };
    });
    
    // 8. Return success response
    console.log('[API] Simple leaderboard fetch completed successfully');
    return createNoCacheResponse({ 
      leaderboard: leaderboardWithUserInfo,
      period,
      total: leaderboardWithUserInfo.length,
      timestamp: new Date().toISOString() // Add timestamp for debugging
    });
  } catch (error) {
    // Capture and log the full error stack
    console.error('[API] Unhandled error in simple leaderboard fetch:', error);
    if (error instanceof Error && error.stack) {
      console.error('[API] Error stack:', error.stack);
    }
    
    return createNoCacheResponse(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      500
    );
  }
} 