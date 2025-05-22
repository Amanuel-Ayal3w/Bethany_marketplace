"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { FooterSettings, SettingsResponse } from "@/shared/types/settings";

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
 * Public version of getFooterSettings
 * This function doesn't require authentication
 */
export async function getPublicFooterSettings(): Promise<SettingsResponse> {
    try {
        const supabase = createServerComponentClient({ cookies });

        // Get settings from database
        const { data, error } = await supabase
            .from("Settings")
            .select("value")
            .eq("key", "footer")
            .single();

        if (error) {
            console.error("Error fetching public footer settings:", error);

            // If no settings exist, return defaults
            if (error.code === "PGRST116") {
                return { settings: DEFAULT_FOOTER_SETTINGS };
            }

            return { error: "Failed to fetch footer settings", settings: DEFAULT_FOOTER_SETTINGS };
        }

        // Parse and return settings
        return { settings: data.value as FooterSettings };

    } catch (error) {
        console.error("Error in getPublicFooterSettings:", error);
        return { error: "Server error", settings: DEFAULT_FOOTER_SETTINGS };
    }
} 