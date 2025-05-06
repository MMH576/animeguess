import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log environment variable status for debugging
if (typeof window !== 'undefined') {
  console.log('Supabase initialization:', {
    urlConfigured: !!supabaseUrl,
    keyConfigured: !!supabaseAnonKey 
  });
}

// Fallback to empty strings if environment variables are not available,
// which will create a client that fails gracefully instead of throwing exceptions
// This helps during development and when environment variables aren't properly set
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

// Test connection method
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('scores').select('count(*)').limit(1);
    return {
      success: !error,
      error: error ? error.message : null,
      data
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      data: null
    };
  }
};

// Type definitions for your database tables
export type Score = {
  id: string;
  user_id: string;
  score: number;
  created_at: string;
};

export type GamePlay = {
  id: string;
  user_id: string;
  play_date: string;
  streak: number;
  difficulty: string;
  created_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  avatar_url?: string;
  created_at: string;
}; 