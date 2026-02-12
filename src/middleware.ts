import { defineMiddleware, sequence } from 'astro:middleware';
import type { MiddlewareNext } from 'astro';

// List of protected routes that require authentication
const protectedRoutes = ['/dashboard', '/api/auth/user', '/api/auth'];

// Authentication middleware
const authMiddleware = defineMiddleware((context, next: MiddlewareNext) => {
  const pathname = new URL(context.request.url).pathname;

  // Check if route requires authentication
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const authCookie = context.cookies.get('pb_auth');

    if (!authCookie) {
      // Redirect to login if not authenticated
      return context.redirect('/login');
    }
  }

  return next();
});

export const onRequest = sequence(authMiddleware);
