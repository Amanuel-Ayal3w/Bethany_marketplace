// This API route is deprecated as we've migrated from NextAuth to Supabase Auth
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
        { message: 'Auth has been migrated to Supabase Auth. This endpoint is no longer active.' },
        { status: 410 } // Gone status code
    );
}

export async function POST() {
    return NextResponse.json(
        { message: 'Auth has been migrated to Supabase Auth. This endpoint is no longer active.' },
        { status: 410 } // Gone status code
    );
}
