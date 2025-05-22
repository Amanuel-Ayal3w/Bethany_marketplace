"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { getFooterSettings, updateFooterSettings } from "@/actions/settings/footer";
import { FooterSettings } from "@/shared/types/settings";

export default function FooterSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<FooterSettings>({
        contactPhone: "",
        contactAddress: "",
        contactEmail: "",
        socialLinks: {
            facebook: "",
            instagram: "",
            twitter: "",
            linkedin: ""
        }
    });

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const data = await getFooterSettings();
                if (data.settings) {
                    setSettings(data.settings);
                }
            } catch (error) {
                console.error("Error loading footer settings:", error);
                toast.error("Failed to load footer settings");
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await updateFooterSettings(settings);
            if (result.error) {
                throw new Error(result.error);
            }
            toast.success("Footer settings updated successfully");
        } catch (error) {
            console.error("Error updating footer settings:", error);
            toast.error("Failed to update footer settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            // Handle nested properties like socialLinks.facebook
            const [parent, child] = name.split('.');
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof FooterSettings],
                    [child]: value
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Footer Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                id="contactPhone"
                                name="contactPhone"
                                type="text"
                                value={settings.contactPhone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="+1 (123) 456-7890"
                            />
                        </div>

                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="contactEmail"
                                name="contactEmail"
                                type="email"
                                value={settings.contactEmail}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="support@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                id="contactAddress"
                                name="contactAddress"
                                value={settings.contactAddress}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="123 Street, City, Country"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                                Facebook
                            </label>
                            <input
                                id="socialLinks.facebook"
                                name="socialLinks.facebook"
                                type="url"
                                value={settings.socialLinks.facebook}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="https://facebook.com/yourpage"
                            />
                        </div>

                        <div>
                            <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                                Instagram
                            </label>
                            <input
                                id="socialLinks.instagram"
                                name="socialLinks.instagram"
                                type="url"
                                value={settings.socialLinks.instagram}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="https://instagram.com/youraccount"
                            />
                        </div>

                        <div>
                            <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700 mb-1">
                                Twitter
                            </label>
                            <input
                                id="socialLinks.twitter"
                                name="socialLinks.twitter"
                                type="url"
                                value={settings.socialLinks.twitter}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="https://twitter.com/youraccount"
                            />
                        </div>

                        <div>
                            <label htmlFor="socialLinks.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                                LinkedIn
                            </label>
                            <input
                                id="socialLinks.linkedin"
                                name="socialLinks.linkedin"
                                type="url"
                                value={settings.socialLinks.linkedin}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="https://linkedin.com/company/yourcompany"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md text-white ${isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                            } transition-colors duration-300`}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
} 