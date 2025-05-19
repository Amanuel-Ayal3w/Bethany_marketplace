"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
    getAllFeaturedBanners,
    deleteFeaturedBanner,
    toggleFeaturedBannerStatus
} from "@/actions/homepage/featuredBanners";
import Button from "@/shared/components/UI/button";

type FeaturedBanner = {
    id: string;
    title: string;
    smallTitle: string | null;
    imagePath: string;
    url: string;
    position: number;
    isActive: boolean;
    bannerType: string;
};

export default function HomepageBannersPage() {
    const [banners, setBanners] = useState<FeaturedBanner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        setIsLoading(true);
        const result = await getAllFeaturedBanners();
        if (result.success && result.banners) {
            // Filter out slider banners, as they're now managed in the slider page
            const filteredBanners = result.banners.filter((banner: FeaturedBanner) => banner.bannerType !== 'slider');
            setBanners(filteredBanners);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this banner?")) {
            await deleteFeaturedBanner(id);
            loadBanners();
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        await toggleFeaturedBannerStatus(id, !currentStatus);
        loadBanners();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold mr-4">Collection Banners</h1>
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        {banners.length} Total
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href="/admin/homepage-slider"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                    >
                        Manage Slider
                    </Link>
                    <Button
                        onClick={() => router.push('/admin/homepage-banners/add')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Add New Banner
                    </Button>
                </div>
            </div>

            <div className="mb-6 bg-blue-50 p-4 rounded-md">
                <h2 className="text-sm font-semibold text-blue-800 mb-2">Homepage Banners Management</h2>
                <p className="text-sm text-blue-700">
                    This page is for managing collection banners that appear in the Featured Collections section.
                    To manage the homepage slider, please use the dedicated <Link href="/admin/homepage-slider" className="font-medium underline">Slider Manager</Link>.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading...</div>
            ) : banners.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500 mb-4">No collection banners have been created yet</p>
                    <Button
                        onClick={() => router.push('/admin/homepage-banners/add')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Create Your First Banner
                    </Button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Banner
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Preview
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {banners.map((banner) => (
                                <tr key={banner.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                                        {banner.smallTitle && (
                                            <div className="text-sm text-gray-500">{banner.smallTitle}</div>
                                        )}
                                        <div className="text-xs text-blue-500 truncate">{banner.url}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="relative w-20 h-12">
                                            <Image
                                                src={banner.imagePath}
                                                alt={banner.title}
                                                fill
                                                sizes="80px"
                                                style={{ objectFit: "cover" }}
                                                className="rounded"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            Collection Banner
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleStatus(banner.id, banner.isActive)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${banner.isActive
                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                }`}
                                        >
                                            {banner.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                href={`/admin/homepage-banners/${banner.id}`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
} 