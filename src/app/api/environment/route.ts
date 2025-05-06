import { NextResponse } from 'next/server';
import { isSupabaseConfigured, testSupabaseConnection } from '@/lib/supabaseClient';

export async function GET() {
  // Check environment variables (safely - don't expose values)
  const envCheck = {
    supabase: {
      url: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 8)}...` 
          : 'missing'
      },
      key: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...` 
          : 'missing'
      }
    },
    clerk: {
      publishableKey: {
        exists: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 
          ? `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 10)}...` 
          : 'missing'
      },
      secretKey: {
        exists: !!process.env.CLERK_SECRET_KEY,
        value: process.env.CLERK_SECRET_KEY 
          ? `${process.env.CLERK_SECRET_KEY.substring(0, 10)}...` 
          : 'missing'
      }
    }
  };
  
  // Test Supabase connection
  const supabaseStatus = await testSupabaseConnection();
  
  // Provide help for fixing environment issues
  const missingEnvVars = [];
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingEnvVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingEnvVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    missingEnvVars.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
  
  if (!process.env.CLERK_SECRET_KEY) {
    missingEnvVars.push('CLERK_SECRET_KEY');
  }
  
  const helpText = missingEnvVars.length > 0 
    ? `Missing environment variables: ${missingEnvVars.join(', ')}. Create or update your .env.local file.`
    : 'All required environment variables are present';
  
  // Additional node information
  const nodeEnv = process.env.NODE_ENV || 'unknown';
  
  return NextResponse.json({
    environment: envCheck,
    supabaseConfigured: isSupabaseConfigured(),
    supabaseConnection: supabaseStatus,
    nodeEnvironment: nodeEnv,
    help: helpText,
    nextSteps: missingEnvVars.length > 0 
      ? [
          'Create a .env.local file in your project root',
          'Set the missing environment variables',
          'Restart your development server',
          'Make sure your Supabase project is running'
        ]
      : []
  });
} 