import { getFooterData } from '@/domains/store/shared/components/footer/FooterData';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const footerData = await getFooterData();
        return NextResponse.json(footerData);
    } catch (error) {
        console.error('Error in footer API route:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch footer data',
                settings: {
                    contactPhone: "+49 30 575909881",
                    contactAddress: "685 Market Street, San Francisco, CA 94105, US",
                    contactEmail: "contact@bethanymarketplace.com",
                    socialLinks: {
                        facebook: "https://www.facebook.com",
                        instagram: "https://www.instagram.com",
                        twitter: "https://www.twitter.com",
                        linkedin: "https://www.linkedin.com"
                    }
                }
            },
            { status: 500 }
        );
    }
} 