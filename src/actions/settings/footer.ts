"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { FooterSettings, SettingsResponse } from "@/shared/types/settings";

// Schema for validating footer settings
const FooterSettingsSchema = z.object({
    contactPhone: z.string().optional(),
    contactAddress: z.string().optional(),
    contactEmail: z.string().optional(),
    socialLinks: z.object({
        facebook: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        twitter: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal(""))
    })
});

// Default footer settings
const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
    contactPhone: "+49 30 575909881",
    contactAddress: "685 Market Street, San Francisco, CA 94105, US",
    contactEmail: "contact@bethanymarketplace.com",
    socialLinks: {
        facebook: "https://www.facebook.com",
        instagram: "https://www.instagram.com",
        twitter: "https://www.twitter.com",
        linkedin: "https://www.linkedin.com"
    }
};

/**
 * Retrieve footer settings from the database
 */
export async function getFooterSettings(): Promise<SettingsResponse> {
    try {
        const supabase = createServerComponentClient({ cookies });

        // Check if user is authenticated and is an admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Get settings from database
        const { data, error } = await supabase
            .from("Settings")
            .select("*")
            .eq("key", "footer")
            .single();

        if (error) {
            console.error("Error fetching footer settings:", error);

            // If no settings exist, return defaults
            if (error.code === "PGRST116") {
                return { settings: DEFAULT_FOOTER_SETTINGS };
            }

            return { error: "Failed to fetch footer settings" };
        }

        // Parse and return settings
        return { settings: data.value as FooterSettings };

    } catch (error) {
        console.error("Error in getFooterSettings:", error);
        return { error: "Server error", settings: DEFAULT_FOOTER_SETTINGS };
    }
}

/**
 * Update footer settings in the database
 */
export async function updateFooterSettings(settings: FooterSettings): Promise<SettingsResponse> {
    try {
        // Validate settings
        const validationResult = FooterSettingsSchema.safeParse(settings);
        if (!validationResult.success) {
            const errorMessage = JSON.stringify(validationResult.error.format());
            return { error: `Invalid settings: ${errorMessage}` };
        }

        const supabase = createServerComponentClient({ cookies });

        // Check if user is authenticated and is an admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check if the user is an admin
        const { data: profile } = await supabase
            .from("Profile")
            .select("role")
            .eq("id", session.user.id)
            .single();

        if (!profile || profile.role !== "ADMIN") {
            return { error: "Not authorized" };
        }

        // Check if setting already exists
        const { data: existingData } = await supabase
            .from("Settings")
            .select("id")
            .eq("key", "footer")
            .single();

        let result;

        if (existingData) {
            // Update existing record
            result = await supabase
                .from("Settings")
                .update({ value: settings, updatedAt: new Date().toISOString() })
                .eq("key", "footer");
        } else {
            // Insert new record
            result = await supabase
                .from("Settings")
                .insert({
                    key: "footer",
                    value: settings,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
        }

        if (result.error) {
            return { error: "Failed to update footer settings" };
        }

        // Revalidate paths that use footer data
        revalidatePath("/");
        revalidatePath("/admin/footer");

        return { settings };

    } catch (error) {
        console.error("Error in updateFooterSettings:", error);
        return { error: "Server error" };
    }
} 