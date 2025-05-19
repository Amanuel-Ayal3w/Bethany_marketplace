import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Bethany Marketplace - Contact Us",
    description: "Contact Bethany Marketplace for inquiries about our products"
};

export default function ContactPage() {
    return (
        <div className="w-full bg-white pt-40 pb-20">
            <div className="storeContainer max-w-4xl mx-auto">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">Contact Us</h1>

                <div className="bg-white shadow-md rounded-lg p-8 mb-10">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div>
                            <h2 className="text-xl font-medium text-gray-700 mb-4">Get in Touch</h2>
                            <p className="text-gray-600 mb-6">
                                We'd love to hear from you. Please fill out the form or contact us directly using the information below.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-800">Address</h3>
                                    <p className="text-gray-600">685 Market Street, San Francisco, CA 94105, US</p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-800">Phone</h3>
                                    <p className="text-gray-600">+49 30 575909881</p>
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
                            <h2 className="text-xl font-medium text-gray-700 mb-4">Send a Message</h2>
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bethany-blue-500 focus:border-bethany-blue-500"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bethany-blue-500 focus:border-bethany-blue-500"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bethany-blue-500 focus:border-bethany-blue-500"
                                        placeholder="Enter subject"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-bethany-blue-500 focus:border-bethany-blue-500"
                                        placeholder="Enter your message"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-bethany-blue-500 text-white py-2 px-4 rounded-md hover:bg-bethany-blue-600 transition-colors duration-300"
                                >
                                    Send Message
                                </button>
                            </form>
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