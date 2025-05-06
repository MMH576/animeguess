import { NextResponse } from 'next/server';

export async function GET() {
  // Safely reveal only the presence of keys, not their values
  const envStatus = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    // List any other required environment variables here
    nodeEnv: process.env.NODE_ENV,
    serviceKeyFirstChars: process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 5)}...` 
      : 'missing'
  };
  
  return NextResponse.json({ 
    status: 'ok',
    env: envStatus,
    serverTime: new Date().toISOString()
  });
} 