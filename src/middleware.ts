import { defineMiddleware, sequence } from 'astro:middleware';
import type { MiddlewareNext } from 'astro';

// List of protected routes that require authentication
// Note: do NOT protect the entire `/api/auth` prefix, or login/signup endpoints
// will be redirected before they can run. Only protect routes that actually
// require an authenticated user.
const protectedRoutes = ['/dashboard', '/api/auth/user'];

// Authentication middleware
const authMiddleware = defineMiddleware((context, next: MiddlewareNext) => {
  const pathname = new URL(context.request.url).pathname;

  // Check if route requires authentication
  // Handle API routes: allow public auth endpoints, but return JSON 401 for
  // protected API routes when not authenticated. This prevents HTML redirects
  // that break JSON clients (Unexpected token '<').
  if (pathname.startsWith('/api/')) {
    const publicApi = ['/api/auth/login', '/api/auth/signup', '/api/auth/logout', '/api/lambda'];
    if (publicApi.some((p) => pathname.startsWith(p))) {
      return next();
    }

    const authCookie = context.cookies.get('pb_auth');
    if (!authCookie) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return next();
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const authCookie = context.cookies.get('pb_auth');

    if (!authCookie) {
      // Redirect to login if not authenticated (browser navigation)
      return context.redirect('/login');
    }
  }

  return next();
});

export const onRequest = sequence(authMiddleware);
