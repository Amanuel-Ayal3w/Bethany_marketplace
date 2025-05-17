import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/shared/lib/supabase-server';
import { db } from '@/shared/lib/db';

export async function GET() {
    try {
        const supabase = getSupabaseServerClient();

        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { isAdmin: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Get user profile
        const profile = await db.profile.findUnique({
            where: { id: session.user.id }
        });

        if (!profile) {
            return NextResponse.json(
                { isAdmin: false, error: 'No profile found' },
                { status: 403 }
            );
        }

        const isAdmin = String(profile.role) === 'ADMIN';

        if (!isAdmin) {
            return NextResponse.json(
                { isAdmin: false, error: 'Not an admin' },
                { status: 403 }
            );
        }

        // Success - user is an admin
        return NextResponse.json({ isAdmin: true });

    } catch (error) {
        console.error('Error in check-admin API route:', error);
        return NextResponse.json(
            { isAdmin: false, error: 'Server error' },
            { status: 500 }
        );
    }
} 