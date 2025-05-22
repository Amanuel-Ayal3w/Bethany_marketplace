'use client';

import { useEffect, useState } from 'react';
import { ClientFooter } from './ClientFooter';
import { FooterDataProps } from './FooterData';

// Default footer settings
const DEFAULT_FOOTER_SETTINGS = {
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

export default function ClientFooterWrapper() {
    const [footerData, setFooterData] = useState<FooterDataProps>({
        settings: DEFAULT_FOOTER_SETTINGS
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFooterData() {
            try {
                const response = await fetch('/api/footer');
                if (response.ok) {
                    const data = await response.json();
                    setFooterData(data);
                }
            } catch (error) {
                console.error('Error fetching footer data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchFooterData();
    }, []);

    if (loading) {
        return (
            <footer className="bg-gray-900 text-white pt-10 pb-8">
                <div className="container mx-auto px-4">
                    {/* Loading skeleton */}
                    <div className="animate-pulse">
                        <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
                        <div className="h-4 w-48 bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-36 bg-gray-700 rounded mb-6"></div>
                    </div>
                </div>
            </footer>
        );
    }

    return <ClientFooter {...footerData} />;
} 