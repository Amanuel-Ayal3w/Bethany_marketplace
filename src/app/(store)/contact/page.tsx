'use client';  // Add this at the top to use client-side functionality

import Link from "next/link";
import { useState } from "react";

// Temporary hardcoded phone number - would come from dashboard/settings in the full implementation
const CONTACT_PHONE = "+49 30 575909881";

export default function ContactPage() {
    const [showPhone, setShowPhone] = useState(false);

    const togglePhone = () => {
        setShowPhone(!showPhone);
    };

    return (
        <div className="w-full bg-white pt-40 pb-20">
            <div className="storeContainer max-w-4xl mx-auto">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">Contact Us</h1>

                <div className="bg-white shadow-md rounded-lg p-8 mb-10">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div>
                            <h2 className="text-xl font-medium text-gray-700 mb-4">Get in Touch</h2>
                            <p className="text-gray-600 mb-6">
                                We'd love to hear from you. Please contact us directly using the information below.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-800">Address</h3>
                                    <p className="text-gray-600">685 Market Street, San Francisco, CA 94105, US</p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-800">Phone</h3>
                                    <div className="flex items-center gap-3">
                                        {showPhone ? (
                                            <p className="text-gray-600">{CONTACT_PHONE}</p>
                                        ) : (
                                            <button
                                                onClick={togglePhone}
                                                className="bg-bethany-blue-500 text-white py-2 px-4 rounded-md hover:bg-bethany-blue-600 transition-colors duration-300"
                                            >
                                                Show Phone Number
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-800">Email</h3>
                                    <p className="text-gray-600">info@bethanymarketplace.com</p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-800">Working Hours</h3>
                                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-medium text-gray-700 mb-4">Call Us Now</h2>
                            <p className="text-gray-600 mb-6">
                                Click the button below to view our phone number. We're available during working hours to assist you with any questions.
                            </p>
                            <div className="flex items-center gap-3 mt-4">
                                {showPhone ? (
                                    <>
                                        <p className="text-gray-800 font-medium">{CONTACT_PHONE}</p>
                                        <button
                                            onClick={togglePhone}
                                            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300"
                                        >
                                            Hide Number
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={togglePhone}
                                        className="bg-bethany-blue-500 text-white py-2 px-4 rounded-md hover:bg-bethany-blue-600 transition-colors duration-300"
                                    >
                                        Show Phone Number
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg overflow-hidden h-80 bg-gray-200">
                    {/* Map placeholder - in a real app, you would integrate a map service here */}
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500">Map location would be displayed here</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 