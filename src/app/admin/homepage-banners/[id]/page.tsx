"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
    getAllFeaturedBanners,
    updateFeaturedBanner
} from "@/actions/homepage/featuredBanners";
import Button from "@/shared/components/UI/button";
import Input from "@/shared/components/UI/input";
import BannerImageUploader from "@/domains/admin/components/banner/BannerImageUploader";

interface FeaturedBanner {
    id: string;
    title: string;
    smallTitle: string | null;
    imagePath: string;
    url: string;
    position: number;
    isActive: boolean;
    bannerType: string;
    createdAt: string;
    updatedAt: string;
}

interface EditBannerPageProps {
    params: {
        id: string;
    };
}

export default function EditBannerPage({ params }: EditBannerPageProps) {
    const [formData, setFormData] = useState({
        title: "",
        smallTitle: "",
        imagePath: "",
        url: "",
        bannerType: "collection",
        isActive: true,
        position: 999
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        const loadBanner = async () => {
            setIsLoading(true);
            try {
                const result = await getAllFeaturedBanners();
                if (result.success && result.banners) {
                    const banner = result.banners.find((b: FeaturedBanner) => b.id === id);
                    if (banner) {
                        setFormData({
                            title: banner.title,
                            smallTitle: banner.smallTitle || "",
                            imagePath: banner.imagePath,
                            url: banner.url,
                            bannerType: banner.bannerType,
                            isActive: banner.isActive,
                            position: banner.position
                        });
                    } else {
                        setError("Banner not found");
                    }
                } else {
                    setError("Failed to load banner data");
                }
            } catch (err) {
                console.error("Error loading banner:", err);
                setError("An unexpected error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        loadBanner();
    }, [id]);

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
            const result = await updateFeaturedBanner(id, formData);

            if (result.success) {
                router.push("/admin/homepage-banners");
            } else {
                setError(result.error || "Failed to update banner");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Error updating banner:", err);
            setError("An unexpected error occurred");
            setIsSubmitting(false);
        }
    };

    // Helper text for different banner types
    const getBannerTypeHelperText = () => {
        switch (formData.bannerType) {
            case "collection":
                return "Displays as a card in the 'Featured Collections' grid section, ideal for category highlights.";
            case "slider":
                return "Displays in the main slider at the top of the homepage. Create multiple slider banners to have multiple slides in the carousel.";
            default:
                return "";
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="text-center py-10">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Homepage Banner</h1>
                <Link
                    href="/admin/homepage-banners"
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded"
                >
                    Cancel
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {error && (
                    <div className="text-red-600 bg-red-50 p-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Type</label>
                        <select
                            name="bannerType"
                            value={formData.bannerType}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="collection">Collection Banner</option>
                            <option value="slider">Homepage Slider</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">{getBannerTypeHelperText()}</p>
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            <p className="font-medium">Note about homepage layout:</p>
                            <p>The homepage now only displays collection banners and slider content managed through this admin interface.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                        <Input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder={formData.bannerType === "slider" ? "e.g., PLAYSTATION 5" : "e.g., Featured Collection"}
                            className="w-full"
                            required
                        />
                        {formData.bannerType === "slider" && (
                            <p className="mt-1 text-xs text-gray-500">For slider banners, this will be the main heading displayed on the slide.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Small Title (Subtitle)</label>
                        <Input
                            type="text"
                            name="smallTitle"
                            value={formData.smallTitle}
                            onChange={handleChange}
                            placeholder={formData.bannerType === "slider" ? "e.g., Shop Now" : "e.g., Smart Watches"}
                            className="w-full"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.bannerType === "slider"
                                ? "For slider banners, this will be the button text. If left empty, 'Shop Now' will be used."
                                : "Optional subtitle that appears above the main title"}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image*</label>
                        <BannerImageUploader
                            currentImage={formData.imagePath}
                            onImageUploaded={handleImageUploaded}
                        />
                        {formData.bannerType === "collection" && (
                            <p className="mt-1 text-xs text-amber-600">
                                For collection banners, use images with a 3:2 ratio for best results.
                            </p>
                        )}
                        {formData.bannerType === "slider" && (
                            <p className="mt-1 text-xs text-amber-600">
                                For slider banners, use high-quality landscape images (1920×500px recommended) that work well with overlay text.
                                To create a multi-image slider, add multiple slider banner items.
                            </p>
                        )}
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

                    {formData.bannerType === "slider" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slide Order (Position)</label>
                            <Input
                                type="number"
                                name="position"
                                value={formData.position ? formData.position.toString() : "999"}
                                onChange={handleChange}
                                placeholder="1"
                                className="w-full"
                                min="1"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Lower numbers display first in the slider. Use this to control the order of slides.
                            </p>
                        </div>
                    )}

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

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Updating..." : "Update Banner"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 