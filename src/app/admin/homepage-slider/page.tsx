"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getActiveFeaturedBannersByType, FeaturedBanner, createFeaturedBanner, deleteFeaturedBanner } from "@/actions/homepage/featuredBanners";
import Button from "@/shared/components/UI/button";
import SliderImageUploader from "@/domains/admin/components/banner/SliderImageUploader";

type SliderImage = {
    path: string;
    title: string;
    buttonText: string;
    url: string;
};

export default function HomepageSliderPage() {
    const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadSliderData();
    }, []);

    const loadSliderData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await getActiveFeaturedBannersByType("slider");

            if (result.success && result.banners) {
                // Convert banners to slider image format
                const images = result.banners.map((banner: FeaturedBanner) => ({
                    path: banner.imagePath,
                    title: banner.title,
                    buttonText: banner.smallTitle || "Shop Now",
                    url: banner.url
                }));

                setSliderImages(images);
            }
        } catch (err) {
            console.error("Error loading slider data:", err);
            setError("Failed to load slider data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSlider = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // First, get current slider banners to delete them
            const currentBannersResult = await getActiveFeaturedBannersByType("slider");

            if (currentBannersResult.success && currentBannersResult.banners) {
                // Delete all existing slider banners
                for (const banner of currentBannersResult.banners) {
                    await deleteFeaturedBanner(banner.id);
                }
            }

            // Create new slider banners
            for (let i = 0; i < sliderImages.length; i++) {
                const image = sliderImages[i];
                await createFeaturedBanner({
                    title: image.title,
                    smallTitle: image.buttonText,
                    imagePath: image.path,
                    url: image.url,
                    bannerType: "slider",
                    position: i + 1, // Set position based on order
                    isActive: true
                });
            }

            setSuccess("Slider saved successfully!");
        } catch (err) {
            console.error("Error saving slider:", err);
            setError("Failed to save slider");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Homepage Slider</h1>
                <Link
                    href="/admin/homepage-banners"
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded"
                >
                    Back to Banners
                </Link>
            </div>

            <div className="bg-purple-50 p-4 rounded-md mb-6">
                <h2 className="text-sm font-semibold text-purple-800 mb-2">Homepage Slider Management</h2>
                <p className="text-sm text-purple-700">
                    Upload multiple images for the homepage slider carousel. You can reorder slides by using the up/down buttons.
                    Changes won't be applied until you click the Save button.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-md mb-6 text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 p-4 rounded-md mb-6 text-green-700">
                    {success}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                {isLoading ? (
                    <div className="text-center py-10">Loading slider data...</div>
                ) : (
                    <>
                        <SliderImageUploader
                            images={sliderImages}
                            onImagesChange={setSliderImages}
                        />

                        <div className="mt-8 flex justify-end">
                            <Button
                                onClick={handleSaveSlider}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Slider"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
} 