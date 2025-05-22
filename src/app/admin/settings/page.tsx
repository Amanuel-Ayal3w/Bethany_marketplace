"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function SiteSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);

    // This is a placeholder until actual settings are implemented
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">General Configuration</h2>
                <p className="text-gray-600 mb-4">This page is under construction. Site settings will be available soon.</p>

                <div className="flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50">
                    <svg className="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="font-medium">Info:</span> Please use the Footer Settings page to manage footer content.
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    disabled={true}
                    className="px-4 py-2 rounded-md text-white bg-blue-400 cursor-not-allowed"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
} 