import { NextResponse } from 'next/server';
import { db as prisma } from '@/shared/lib/db';

// Temporary storage for settings until we can set up the database migration
let temporarySettings = {
    'contact_phone': '+49 30 575909881',
    'contact_email': 'info@bethanymarketplace.com',
    'contact_address': '685 Market Street, San Francisco, CA 94105, US'
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        let settings;

        if (key) {
            // Get a specific setting by key
            settings = temporarySettings[key as keyof typeof temporarySettings] || null;
        } else {
            // Get all settings
            settings = temporarySettings;
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json(
                { success: false, error: 'Key and value are required' },
                { status: 400 }
            );
        }

        // Update the setting in our temporary storage
        temporarySettings[key as keyof typeof temporarySettings] = value;

        return NextResponse.json({
            success: true,
            data: { key, value }
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update setting' },
            { status: 500 }
        );
    }
} 