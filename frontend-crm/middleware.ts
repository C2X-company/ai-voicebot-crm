// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// ── Define protected routes ────────────────────────────────────────────────
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)'
]);

// ── Middleware ─────────────────────────────────────────────────────────────
export default clerkMiddleware(async (auth, req) => {
  
  if (isProtectedRoute(req)) {
    // 1. Await the auth() promise to resolve it and satisfy TypeScript
    const session = await auth();
    
    // 2. Safely and manually protect the route
    if (!session.userId) {
      // Create a URL to redirect them to your sign-in page
      const signInUrl = new URL('/sign-in', req.url);
      
      // Keep track of where they were trying to go, so they return after logging in
      signInUrl.searchParams.set('redirect_url', req.url);
      
      return NextResponse.redirect(signInUrl);
    }
  }
  
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};