import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from './database.types';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req, res });

    // Refresh the session if it exists
    await supabase.auth.getSession();

    return res;
}

// Specify which routes the middleware should run on
export const config = {
    matcher: [
        // Protected routes that need authentication
        '/profile',
        '/dashboard/:path*',
        '/admin/:path*',
        // Skip certain paths
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 