import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/database.types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        await supabase.auth.exchangeCodeForSession(code);
    }

    // URL to redirect to after sign in
    return NextResponse.redirect(requestUrl.origin);
} 