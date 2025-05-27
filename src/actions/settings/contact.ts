"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ContactSettings } from "@/shared/types/settings";

// Schema for validating contact settings
const ContactSettingsSchema = z.object({
    address: z.string().min(1, "Address is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    workingHours: z.object({
        weekdays: z.string().min(1, "Weekday hours are required"),
        saturday: z.string().min(1, "Saturday hours are required")
    }),
    mapLocation: z.object({
        latitude: z.number(),
        longitude: z.number()
    }).optional()
});

// Default contact settings
const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
    address: "685 Market Street, San Francisco, CA 94105, US",
    phone: "+49 30 575909881",
    email: "info@bethanymarketplace.com",
    workingHours: {
        weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
        saturday: "Saturday: 10:00 AM - 4:00 PM"
    }
};

export async function getContactSettings() {
    const supabase = createServerComponentClient({ cookies });

    try {
        const { data, error } = await supabase
            .from('Settings')
            .select('value')
            .eq('key', 'contact')
            .single();

        if (error) throw error;

        return { settings: data?.value || DEFAULT_CONTACT_SETTINGS };
    } catch (error) {
        console.error("Error fetching contact settings:", error);
        return { error: "Failed to fetch contact settings" };
    }
}

export async function updateContactSettings(settings: ContactSettings) {
    const supabase = createServerComponentClient({ cookies });

    try {
        // Verify admin access first
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: "Unauthorized" };
        }

        // Validate settings
        const validatedSettings = ContactSettingsSchema.parse(settings);

        // Update settings
        const { error: updateError } = await supabase
            .from('Settings')
            .upsert(
                {
                    key: 'contact',
                    value: validatedSettings
                },
                { onConflict: 'key' }
            );

        if (updateError) {
            throw updateError;
        }

        revalidatePath('/contact');
        return { success: true };
    } catch (error) {
        console.error("Error updating contact settings:", error);
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message };
        }
        return { error: error instanceof Error ? error.message : "Failed to update contact settings" };
    }
}
