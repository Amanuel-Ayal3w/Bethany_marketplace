'use client';

import { useState, useEffect } from "react";
import { getContactSettings } from "@/actions/settings/contact";
import { ContactSettings } from "@/shared/types/settings";

// Icons with better sizing and consistency
const PhoneIcon = () => (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);
const EmailIcon = () => (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const AddressIcon = () => (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const ClockIcon = () => (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function ContactPage() {
    const [settings, setSettings] = useState<ContactSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getContactSettings();
                if (data.settings) {
                    setSettings(data.settings);
                }
            } catch (error) {
                console.error("Error loading contact settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    if (isLoading || !settings) {
        return (
            <div className="w-full bg-white pt-32 pb-20 px-4"> {/* Increased top padding */}
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="h-10 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white pt-32 pb-16 px-4 sm:px-6 lg:px-8"> {/* Increased top padding */}
            <div className="max-w-7xl mx-auto">
                {/* Contact Us Heading with better spacing */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Contact Us</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        We're here to help and answer any questions you might have.
                    </p>
                </div>

                {/* Contact Information Grid */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition duration-200">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <PhoneIcon />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                                <p className="mt-1 text-base text-gray-600">
                                    <a href={`tel:${settings.phone}`} className="hover:text-blue-600 transition">
                                        {settings.phone}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition duration-200">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <EmailIcon />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                                <p className="mt-1 text-base text-gray-600">
                                    <a href={`mailto:${settings.email}`} className="text-blue-600 hover:underline">
                                        {settings.email}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition duration-200">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <AddressIcon />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                                <p className="mt-1 text-base text-gray-600">{settings.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition duration-200">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <ClockIcon />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Working Hours</h3>
                                <p className="mt-1 text-base text-gray-600">{settings.workingHours.weekdays}</p>
                                <p className="text-base text-gray-600">{settings.workingHours.saturday}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}