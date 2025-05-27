"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getContactSettings, updateContactSettings } from "@/actions/settings/contact";
import { ContactSettings } from "@/shared/types/settings";

export default function ContactSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<ContactSettings>({
        address: "",
        phone: "",
        email: "",
        workingHours: {
            weekdays: "",
            saturday: ""
        }
    });

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const data = await getContactSettings();
                if (data.settings) {
                    setSettings(data.settings);
                }
            } catch (error) {
                console.error("Error loading contact settings:", error);
                toast.error("Failed to load contact settings");
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
            const result = await updateContactSettings(settings);
            if (result.error) {
                throw new Error(result.error);
            }
            toast.success("Contact settings updated successfully");
        } catch (error) {
            console.error("Error updating contact settings:", error);
            toast.error("Failed to update contact settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof ContactSettings] as Record<string, string>),
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
            <h1 className="text-2xl font-bold mb-6">Contact Page Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={settings.address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Enter your business address"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                value={settings.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="+1 (123) 456-7890"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={settings.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="contact@example.com"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Working Hours</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="workingHours.weekdays" className="block text-sm font-medium text-gray-700 mb-1">
                                Weekday Hours
                            </label>
                            <input
                                id="workingHours.weekdays"
                                name="workingHours.weekdays"
                                type="text"
                                value={settings.workingHours.weekdays}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                            />
                        </div>

                        <div>
                            <label htmlFor="workingHours.saturday" className="block text-sm font-medium text-gray-700 mb-1">
                                Saturday Hours
                            </label>
                            <input
                                id="workingHours.saturday"
                                name="workingHours.saturday"
                                type="text"
                                value={settings.workingHours.saturday}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Saturday: 10:00 AM - 4:00 PM"
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