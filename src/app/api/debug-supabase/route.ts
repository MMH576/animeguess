import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // 1. Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const envCheck = {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
    urlFirstChars: supabaseUrl ? supabaseUrl.substring(0, 15) + '...' : 'missing',
    keyFirstChars: supabaseServiceKey ? supabaseServiceKey.substring(0, 5) + '...' : 'missing'
  };
  
  // 2. Create a test client
  let testClient = null;
  let clientCreationError = null;
  
  try {
    if (supabaseUrl && supabaseServiceKey) {
      testClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
    }
  } catch (error) {
    clientCreationError = error instanceof Error ? error.message : 'Unknown client creation error';
  }
  
  // 3. Attempt a simple query if client was created
  let queryResult = null;
  let queryError = null;
  
  if (testClient) {
    try {
      // Just get table existence
      const { error, count } = await testClient
        .from('scores')
        .select('id', { head: true, count: 'exact' })
        .limit(1);
        
      if (error) {
        queryError = {
          message: error.message,
          code: error.code,
          hint: error.hint
        };
      } else {
        queryResult = {
          success: true,
          tableExists: true,
          count
        };
      }
    } catch (error) {
      queryError = error instanceof Error ? error.message : 'Unknown query error';
    }
  }
  
  // 4. Return diagnostic information
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envCheck,
    clientCreation: testClient ? 'success' : 'failed',
    clientCreationError,
    queryAttempted: !!testClient,
    queryResult,
    queryError
  });
} 