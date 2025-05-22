import { getPublicFooterSettings } from "@/actions/settings/getPublicFooterSettings";
import { FooterSettings } from "@/shared/types/settings";

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

export type FooterDataProps = {
    settings: FooterSettings;
};

export async function getFooterData(): Promise<FooterDataProps> {
    try {
        // Only fetch settings now
        const settingsResult = await getPublicFooterSettings();
        const { settings, error: settingsError } = settingsResult;

        return {
            settings: settings || DEFAULT_FOOTER_SETTINGS
        };
    } catch (error) {
        console.error("Error fetching footer data:", error);
        // Return fallback data
        return {
            settings: DEFAULT_FOOTER_SETTINGS
        };
    }
} 