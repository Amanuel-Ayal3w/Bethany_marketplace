import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from './database.types';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req, res });

    // Skip middleware for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
        return res;
    }

    // Check if route requires authentication
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/admin') ||
        req.nextUrl.pathname === '/profile';

    // Only apply auth check to protected routes
    if (isProtectedRoute) {
        // Get session
        const { data: { session } } = await supabase.auth.getSession();

        // If no session (not logged in), redirect to login
        if (!session) {
            console.log(`No session, redirecting to login from ${req.nextUrl.pathname}`);
            const redirectUrl = new URL('/login', req.url);
            redirectUrl.searchParams.set('returnUrl', req.nextUrl.pathname);
            return NextResponse.redirect(redirectUrl);
        }

        // Let the page components handle role verification
    }

    return res;
}

// Specify which routes the middleware should run on
export const config = {
    matcher: [
        // Only run on admin and profile routes
        '/profile',
        '/admin',
        '/admin/:path*',
        '/api/:path*',
    ],
}; 