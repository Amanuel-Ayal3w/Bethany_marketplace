"use server";

import { db } from "@/shared/lib/db";
import { getSupabaseServerClient } from "@/shared/lib/supabase-server";

export async function createUserProfile(userId: string) {
    if (!userId) {
        return { error: "User ID is required" };
    }

    try {
        console.log(`Attempting to create profile for user ${userId}`);

        // Check if profile already exists
        const existingProfile = await db.profile.findUnique({
            where: { id: userId }
        });

        if (existingProfile) {
            console.log(`Profile already exists for user ${userId}`);
            return { success: true, profile: existingProfile };
        }

        // Create the profile
        const profile = await db.profile.create({
            data: {
                id: userId,
                role: "USER",
            }
        });

        console.log(`Successfully created profile for user ${userId}`);
        return { success: true, profile };
    } catch (error) {
        console.error("Error creating profile via Prisma:", error);

        // Try a second approach using Supabase if Prisma fails
        try {
            const supabase = getSupabaseServerClient();
            console.log(`Attempting Supabase fallback for user ${userId}`);

            const { data, error: supabaseError } = await supabase
                .from('Profile')
                .insert([{
                    id: userId,
                    role: 'USER',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }])
                .select();

            if (supabaseError) {
                console.error("Supabase insert error:", supabaseError);
                throw supabaseError;
            }

            console.log(`Created profile via Supabase direct insert for user ${userId}`);
            return { success: true, profile: data?.[0] };
        } catch (fallbackError) {
            console.error("Fallback profile creation also failed:", fallbackError);
            return {
                error: "Failed to create profile after multiple attempts",
                details: error instanceof Error ? error.message : String(error)
            };
        }
    }
}

// Function to verify if a user has a profile and create one if missing
export async function ensureUserProfile(userId: string) {
    if (!userId) return { error: "No user ID provided" };

    try {
        console.log(`Ensuring profile exists for user ${userId}`);

        // Check if profile exists
        const existingProfile = await db.profile.findUnique({
            where: { id: userId }
        });

        if (existingProfile) {
            console.log(`Profile already exists for user ${userId}`);
            return { success: true, profile: existingProfile };
        }

        // Profile doesn't exist, create one
        return await createUserProfile(userId);
    } catch (error) {
        console.error("Error ensuring user profile:", error);
        return {
            error: "Failed to ensure profile exists",
            details: error instanceof Error ? error.message : String(error)
        };
    }
} 