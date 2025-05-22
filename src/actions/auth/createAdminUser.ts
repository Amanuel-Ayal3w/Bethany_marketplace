'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { db } from "@/shared/lib/db";

type AdminUserCreationResult = {
    success: boolean;
    error?: string;
    userId?: string;
};

export async function createAdminUser(email: string, password: string): Promise<AdminUserCreationResult> {
    try {
        // Get the current user's session
        const supabase = createServerComponentClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        // Check if the current user is authenticated
        if (!session) {
            return {
                success: false,
                error: "You must be logged in to create an admin user."
            };
        }

        // Check if the current user is an admin
        const { data: currentProfile } = await supabase
            .from('Profile')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (!currentProfile || currentProfile.role !== 'ADMIN') {
            return {
                success: false,
                error: "Only admins can create new admin users."
            };
        }

        // Create the new user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm the email
        });

        if (authError) {
            console.error('Error creating user:', authError);
            return {
                success: false,
                error: authError.message
            };
        }

        // If user created successfully, proceed with profile creation
        const userId = authData.user.id;

        // Create the profile with ADMIN role
        const profile = await db.profile.create({
            data: {
                id: userId,
                role: "ADMIN",
            }
        });

        return {
            success: true,
            userId
        };
    } catch (error) {
        console.error('Error in createAdminUser:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred."
        };
    }
} 