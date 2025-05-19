"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
    getAllHomepageBrands,
    createHomepageBrand,
    deleteHomepageBrand,
    toggleHomepageBrandStatus
} from "@/actions/homepage/homepageBrands";
import { getAllBrands } from "@/actions/brands/brands";
import Button from "@/shared/components/UI/button";
import Input from "@/shared/components/UI/input";
import SafeImage from "@/shared/components/UI/safeImage";
import BrandLogoUploader from "@/domains/admin/components/brand/BrandLogoUploader";

type HomepageBrand = {
    id: string;
    brandID: string;
    logoPath: string | null;
    position: number;
    isActive: boolean;
    brand: {
        id: string;
        name: string;
    };
};

type Brand = {
    id: string;
    name: string;
};

export default function HomepageBrandsPage() {
    const [homepageBrands, setHomepageBrands] = useState<HomepageBrand[]>([]);
    const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState<string>("");
    const [logoPath, setLogoPath] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);

        // Load homepage brands
        const homepageResult = await getAllHomepageBrands();
        if (homepageResult.success && homepageResult.brands) {
            setHomepageBrands(homepageResult.brands);
        }

        // Load all brands
        const brandsResult = await getAllBrands();
        if (brandsResult.res) {
            setAvailableBrands(brandsResult.res);
        }

        setIsLoading(false);
    };

    const getFilteredBrands = () => {
        const featuredBrandIds = homepageBrands.map(hb => hb.brandID);
        return availableBrands.filter(brand => !featuredBrandIds.includes(brand.id));
    };

    const handleAddBrand = async () => {
        if (!selectedBrandId) return;

        setIsSubmitting(true);

        await createHomepageBrand({
            brandID: selectedBrandId,
            logoPath: logoPath || undefined
        });

        setSelectedBrandId("");
        setLogoPath("");
        setIsSubmitting(false);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to remove this brand from the homepage?")) {
            await deleteHomepageBrand(id);
            loadData();
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        await toggleHomepageBrandStatus(id, !currentStatus);
        loadData();
    };

    const handleLogoUploaded = (path: string) => {
        setLogoPath(path);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold mr-4">Homepage Brands</h1>
                    <div className="bg-yellow-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        {homepageBrands.length} Total
                    </div>
                </div>
            </div>

            {/* Updated message about homepage layout */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Homepage Layout Update</h3>
                <p className="text-blue-700 mb-2">
                    The homepage has been updated to only display content that's managed through this admin interface.
                    The static brands section has been removed in favor of this dynamic one.
                </p>
                <p className="text-blue-700">
                    <strong>Important:</strong> All brands added here with logos will be displayed on the homepage.
                    Make sure to add high-quality logo images for the best presentation.
                </p>
            </div>

            {/* Add new homepage brand form */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Add Brand to Homepage</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Brand</label>
                        <select
                            value={selectedBrandId}
                            onChange={(e) => setSelectedBrandId(e.target.value)}
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSubmitting || getFilteredBrands().length === 0}
                        >
                            <option value="">Select a brand...</option>
                            {getFilteredBrands().map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                        {getFilteredBrands().length === 0 && (
                            <p className="mt-1 text-xs text-red-500">
                                All brands are already featured. You can remove some brands to add different ones.
                            </p>
                        )}

                        <div className="mt-6">
                            <Button
                                onClick={handleAddBrand}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                disabled={!selectedBrandId || isSubmitting || !logoPath}
                            >
                                {isSubmitting ? "Adding..." : "Add to Homepage"}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo (Required)</label>
                        <BrandLogoUploader
                            onLogoUploaded={handleLogoUploaded}
                        />
                        {!logoPath && (
                            <p className="mt-1 text-xs text-gray-500">
                                Please upload a logo image for the brand to display on the homepage.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading...</div>
            ) : homepageBrands.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No brands have been added to the homepage yet</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brand
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Logo
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
                            {homepageBrands.map((brand) => (
                                <tr key={brand.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{brand.brand.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {brand.logoPath ? (
                                            <div className="relative w-24 h-12">
                                                <SafeImage
                                                    src={brand.logoPath}
                                                    alt={brand.brand.name}
                                                    fill
                                                    sizes="96px"
                                                    style={{ objectFit: "contain" }}
                                                    className="rounded"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500">No custom logo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleStatus(brand.id, brand.isActive)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${brand.isActive
                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                }`}
                                        >
                                            {brand.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(brand.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Remove
                                        </button>
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