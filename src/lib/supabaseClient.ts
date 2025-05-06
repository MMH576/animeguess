import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create public client for client-side operations
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
};

export type GamePlay = {
  id: string;
  user_id: string;
  play_date: string;
  streak: number;
  difficulty: string;
  created_at: string;
}; 