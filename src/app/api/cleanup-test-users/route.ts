import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient';

// API endpoint to clean up test users
// GET /api/cleanup-test-users
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

    // 1. Delete users with test-user IDs
    const { error: error1, count: count1 } = await supabase
      .from('scores')
      .delete({ count: 'exact' })
      .like('user_id', 'test-user%');

    if (error1) {
      console.error('Error deleting test users by ID:', error1);
      return NextResponse.json(
        { error: 'Failed to delete test users by ID', details: error1.message },
        { status: 500 }
      );
    }

    // 2. Delete users with test-looking usernames
    const { error: error2, count: count2 } = await supabase
      .from('scores')
      .delete({ count: 'exact' })
      .or('username.eq.Player te,username.like.Test User%');

    if (error2) {
      console.error('Error deleting test users by username:', error2);
      return NextResponse.json(
        { error: 'Failed to delete test users by username', details: error2.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test users removed successfully',
      deletedByUserId: count1 || 0,
      deletedByUsername: count2 || 0,
      totalRemoved: (count1 || 0) + (count2 || 0)
    });
  } catch (error) {
    console.error('Error in cleanup-test-users endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 