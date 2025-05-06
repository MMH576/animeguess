import { clerkMiddleware } from "@clerk/nextjs/server";

// Protect all routes with Clerk authentication
export default clerkMiddleware();

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (files in the public/images directory)
     * - public files with extensions (.jpg, .png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
    '/(api|trpc)(.*)',
  ],
}; 