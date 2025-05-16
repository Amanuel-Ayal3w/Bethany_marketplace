"use server";

import { db } from "@/shared/lib/db";
import { getSupabaseServerClient } from "@/shared/lib/supabase-server";

export async function createUserProfile(userId: string) {
    if (!userId) {
        return { error: "User ID is required" };
    }

    try {
        // Check if profile already exists
        const existingProfile = await db.profile.findUnique({
            where: { id: userId }
        });

        if (existingProfile) {
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
        console.error("Error creating profile:", error);

        // Try a second approach using Supabase if Prisma fails
        try {
            const supabase = getSupabaseServerClient();
            const { data, error: supabaseError } = await supabase
                .from('Profile')
                .insert([{ id: userId, role: 'USER' }])
                .select();

            if (supabaseError) {
                throw supabaseError;
            }

            console.log(`Created profile via Supabase direct insert for user ${userId}`);
            return { success: true, profile: data?.[0] };
        } catch (fallbackError) {
            console.error("Fallback profile creation also failed:", fallbackError);
            return {
                error: "Failed to create profile after multiple attempts",
                details: JSON.stringify(error)
            };
        }
    }
}

// Function to verify if a user has a profile and create one if missing
export async function ensureUserProfile(userId: string) {
    if (!userId) return { error: "No user ID provided" };

    try {
        // Check if profile exists
        const existingProfile = await db.profile.findUnique({
            where: { id: userId }
        });

        if (existingProfile) {
            return { success: true, profile: existingProfile };
        }

        // Profile doesn't exist, create one
        return await createUserProfile(userId);
    } catch (error) {
        console.error("Error ensuring user profile:", error);
        return { error: "Failed to ensure profile exists", details: JSON.stringify(error) };
    }
} 