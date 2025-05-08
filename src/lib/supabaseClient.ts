import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey;
};

// Test Supabase connection
export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase is not configured'
    };
  }

  try {
    const { error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

// Create a server-side admin client that bypasses RLS
export const getServerSupabase = () => {
  if (typeof window !== 'undefined') {
    console.error('getServerSupabase should only be called from server components');
    return null;
  }
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables for server client');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
};

// Type definitions for your database tables
export type Score = {
  id: string;
  user_id: string;
  score: number;
  difficulty: string;
  created_at: string;
  username?: string;
};

export type GamePlay = {
  id: string;
  user_id: string;
  play_date: string;
  streak: number;
  difficulty: string;
  created_at: string;
}; 