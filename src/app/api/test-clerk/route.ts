import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Test Clerk authentication
    let authInfo = {};
    try {
      const auth = getAuth(request);
      authInfo = {
        userId: auth.userId,
        sessionId: auth.sessionId,
        isAuthenticated: !!auth.userId,
        isSignedIn: !!auth.userId,
      };
    } catch (authError) {
      authInfo = {
        error: 'Authentication error',
        details: authError instanceof Error ? authError.message : 'Unknown auth error',
      };
    }
    
    // 2. Test Clerk API
    let clerkApiStatus = {};
    try {
      const clerkClient = await import('@clerk/clerk-sdk-node').then(mod => mod.default);
      
      // Just check if the Clerk client initializes (don't make actual requests)
      clerkApiStatus = {
        initialized: !!clerkClient,
        apiKey: !!process.env.CLERK_SECRET_KEY,
      };
    } catch (apiError) {
      clerkApiStatus = {
        error: 'Clerk API error',
        details: apiError instanceof Error ? apiError.message : 'Unknown API error',
      };
    }
    
    // 3. Return diagnostic information
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      auth: authInfo,
      api: clerkApiStatus,
      environment: {
        clerkPublicKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        clerkSecretKey: !!process.env.CLERK_SECRET_KEY,
        NODE_ENV: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('Test Clerk endpoint error:', error);
    return NextResponse.json({ error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 