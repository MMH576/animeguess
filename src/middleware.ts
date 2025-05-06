import { clerkMiddleware } from '@clerk/nextjs/server';

// This middleware protects ALL routes that aren't listed in publicRoutes
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}; 