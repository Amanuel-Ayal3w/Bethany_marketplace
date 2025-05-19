"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createFeaturedBanner } from "@/actions/homepage/featuredBanners";
import Button from "@/shared/components/UI/button";
import Input from "@/shared/components/UI/input";
import BannerImageUploader from "@/domains/admin/components/banner/BannerImageUploader";

export default function AddBannerPage() {
    const [formData, setFormData] = useState({
        title: "",
        smallTitle: "",
        imagePath: "",
        url: "",
        bannerType: "collection",
        isActive: true,
        position: 999
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        });
    };

    const handleImageUploaded = (imagePath: string) => {
        setFormData({
            ...formData,
            imagePath
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.title || !formData.imagePath || !formData.url) {
            setError("Title, image, and URL are required");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createFeaturedBanner(formData);

            if (result.success) {
                router.push("/admin/homepage-banners");
            } else {
                setError(result.error || "Failed to create banner");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Error creating banner:", err);
            setError("An unexpected error occurred");
            setIsSubmitting(false);
        }
    };

    // Helper text for different banner types
    const getBannerTypeHelperText = () => {
        return "Displays as a card in the 'Featured Collections' grid section, ideal for category highlights.";
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Add Collection Banner</h1>
                <Link
                    href="/admin/homepage-banners"
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded"
                >
                    Cancel
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="hidden">
                        <input type="hidden" name="bannerType" value="collection" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Type</label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
                            Collection Banner
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{getBannerTypeHelperText()}</p>
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            <p className="font-medium">Note about homepage layout:</p>
                            <p>This banner will appear in the Featured Collections section. For slider management,
                                please use the <Link href="/admin/homepage-slider" className="underline">Slider Manager</Link>.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                        <Input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Featured Collection"
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Small Title (Subtitle)</label>
                        <Input
                            type="text"
                            name="smallTitle"
                            value={formData.smallTitle}
                            onChange={handleChange}
                            placeholder="e.g., Smart Watches"
                            className="w-full"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Optional subtitle that appears above the main title
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image*</label>
                        <BannerImageUploader
                            onImageUploaded={handleImageUploaded}
                        />
                        {formData.imagePath && (
                            <p className="mt-1 text-xs text-gray-500">
                                Image uploaded successfully! You can change it by uploading a new one.
                            </p>
                        )}
                        <p className="mt-1 text-xs text-amber-600">
                            For collection banners, use images with a 3:2 ratio for best results.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL*</label>
                        <Input
                            type="text"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            placeholder="/list/watches"
                            className="w-full"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">The URL that users will navigate to when clicking the banner</p>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                            Active (will be displayed on the homepage)
                        </label>
                    </div>

                    {error && (
                        <div className="text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isSubmitting || !formData.imagePath}
                        >
                            {isSubmitting ? "Creating..." : "Create Banner"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 