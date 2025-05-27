// Types for application settings

// Footer settings
export interface FooterSettings {
    contactPhone: string;
    contactAddress: string;
    contactEmail: string;
    socialLinks: {
        facebook: string;
        instagram: string;
        twitter: string;
        linkedin: string;
    };
}

// API responses
export interface SettingsResponse {
    settings?: FooterSettings;
    error?: string;
}

// Contact settings
export interface ContactSettings {
    address: string;
    phone: string;
    email: string;
    workingHours: {
        weekdays: string;
        saturday: string;
    };
    mapLocation?: {
        latitude: number;
        longitude: number;
    };
} 