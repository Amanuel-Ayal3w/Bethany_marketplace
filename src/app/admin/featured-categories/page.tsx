"use client";

import { useEffect, useState } from "react";

import { getAllCategoriesJSON } from "@/actions/category/category";
import {
    getAllFeaturedCategories,
    addFeaturedCategory,
    updateFeaturedCategory,
    removeFeaturedCategory
} from "@/actions/featuredCategory/featuredCategory";
import { TGroupJSON, TFeaturedCategory } from "@/shared/types/categories";

import { toast } from "react-hot-toast";

const FeaturedCategoriesPage = () => {
    const [allCategories, setAllCategories] = useState<TGroupJSON[]>([]);
    const [featuredCategories, setFeaturedCategories] = useState<TFeaturedCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    // Fetch all data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load all categories
                const categoriesResult = await getAllCategoriesJSON();
                if (categoriesResult.res) {
                    setAllCategories(categoriesResult.res);
                } else {
                    toast.error("Failed to load categories");
                }

                // Load featured categories
                const featuredResult = await getAllFeaturedCategories();
                if (featuredResult.res) {
                    setFeaturedCategories(featuredResult.res);
                } else {
                    toast.error("Failed to load featured categories");
                }
            } catch (error) {
                toast.error("Error loading data");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Add a category to featured
    const handleAddFeatured = async () => {
        if (!selectedCategoryId) {
            toast.error("Please select a category");
            return;
        }

        try {
            const result = await addFeaturedCategory(selectedCategoryId);
            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Category added to navbar");

            // Refresh featured categories
            const featuredResult = await getAllFeaturedCategories();
            if (featuredResult.res) {
                setFeaturedCategories(featuredResult.res);
                setSelectedCategoryId("");
            }
        } catch (error) {
            toast.error("Failed to add category");
            console.error(error);
        }
    };

    // Remove a category from featured
    const handleRemoveFeatured = async (id: string) => {
        try {
            const result = await removeFeaturedCategory(id);
            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Category removed from navbar");

            // Update local state
            setFeaturedCategories(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            toast.error("Failed to remove category");
            console.error(error);
        }
    };

    // Toggle active status
    const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
        try {
            const result = await updateFeaturedCategory(id, { isActive: !currentStatus });
            if (result.error) {
                toast.error(result.error);
                return;
            }

            // Update local state
            setFeaturedCategories(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, isActive: !currentStatus } : item
                )
            );

            toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update category status");
            console.error(error);
        }
    };

    // Move a category up in order
    const moveUp = async (index: number) => {
        if (index <= 0) return;

        try {
            const currentItem = featuredCategories[index];
            const prevItem = featuredCategories[index - 1];

            // Swap positions
            await updateFeaturedCategory(currentItem.id, { position: prevItem.position });
            await updateFeaturedCategory(prevItem.id, { position: currentItem.position });

            // Refresh featured categories
            const featuredResult = await getAllFeaturedCategories();
            if (featuredResult.res) {
                setFeaturedCategories(featuredResult.res);
            }
        } catch (error) {
            toast.error("Failed to reorder categories");
            console.error(error);
        }
    };

    // Move a category down in order
    const moveDown = async (index: number) => {
        if (index >= featuredCategories.length - 1) return;

        try {
            const currentItem = featuredCategories[index];
            const nextItem = featuredCategories[index + 1];

            // Swap positions
            await updateFeaturedCategory(currentItem.id, { position: nextItem.position });
            await updateFeaturedCategory(nextItem.id, { position: currentItem.position });

            // Refresh featured categories
            const featuredResult = await getAllFeaturedCategories();
            if (featuredResult.res) {
                setFeaturedCategories(featuredResult.res);
            }
        } catch (error) {
            toast.error("Failed to reorder categories");
            console.error(error);
        }
    };

    // Find category name by ID
    const getCategoryName = (categoryId: string): string => {
        for (const group of allCategories) {
            if (group.group.id === categoryId) {
                return group.group.name;
            }

            for (const category of group.categories) {
                if (category.category.id === categoryId) {
                    return category.category.name;
                }

                for (const subcategory of category.subCategories) {
                    if (subcategory.id === categoryId) {
                        return subcategory.name;
                    }
                }
            }
        }
        return "Unknown Category";
    };

    // Get category path (URL)
    const getCategoryPath = (categoryId: string): string => {
        for (const group of allCategories) {
            if (group.group.id === categoryId) {
                return `/list/${group.group.url}`;
            }

            for (const category of group.categories) {
                if (category.category.id === categoryId) {
                    return `/list/${group.group.url}/${category.category.url}`;
                }

                for (const subcategory of category.subCategories) {
                    if (subcategory.id === categoryId) {
                        return `/list/${group.group.url}/${category.category.url}/${subcategory.url}`;
                    }
                }
            }
        }
        return "#";
    };

    // Flatten categories for dropdown
    const flattenedCategories = allCategories.reduce((acc: { id: string, name: string, path: string }[], group) => {
        // Add group
        acc.push({
            id: group.group.id,
            name: group.group.name,
            path: `/list/${group.group.url}`
        });

        // Add categories
        group.categories.forEach(category => {
            acc.push({
                id: category.category.id,
                name: `${group.group.name} > ${category.category.name}`,
                path: `/list/${group.group.url}/${category.category.url}`
            });

            // Add subcategories
            category.subCategories.forEach(subcategory => {
                acc.push({
                    id: subcategory.id,
                    name: `${group.group.name} > ${category.category.name} > ${subcategory.name}`,
                    path: `/list/${group.group.url}/${category.category.url}/${subcategory.url}`
                });
            });
        });

        return acc;
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-8">Featured Navbar Categories</h1>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-8">Featured Navbar Categories</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 mb-6">
                    Configure which categories appear in the main navigation bar. The order here determines the order in the navbar.
                </p>

                {/* Current featured categories */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Current Navbar Categories</h2>

                    {featuredCategories.length === 0 ? (
                        <div className="text-gray-500 italic">No categories have been added to the navbar yet.</div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {featuredCategories.map((featured, index) => (
                                        <tr key={featured.id} className={!featured.isActive ? "bg-gray-50" : ""}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={!featured.isActive ? "text-gray-400" : "text-gray-900"}>
                                                    {getCategoryName(featured.categoryID)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getCategoryPath(featured.categoryID)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${featured.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}>
                                                    {featured.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => moveUp(index)}
                                                        disabled={index === 0}
                                                        className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        onClick={() => moveDown(index)}
                                                        disabled={index === featuredCategories.length - 1}
                                                        className={`p-1 rounded ${index === featuredCategories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                                    >
                                                        ↓
                                                    </button>
                                                    <span className="text-sm text-gray-500">{featured.position}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => toggleActiveStatus(featured.id, featured.isActive)}
                                                    className={`px-3 py-1 rounded ${featured.isActive
                                                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                                        }`}
                                                >
                                                    {featured.isActive ? "Deactivate" : "Activate"}
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveFeatured(featured.id)}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
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

                {/* Add new featured category */}
                <div className="mt-8 border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">Add Category to Navbar</h2>
                    <div className="flex space-x-4">
                        <div className="flex-grow">
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option value="">Select a category</option>
                                {flattenedCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleAddFeatured}
                            disabled={!selectedCategoryId}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add to Navbar
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 pt-6 border-t">
                    <h2 className="text-lg font-semibold mb-4">How it Works</h2>
                    <div className="bg-gray-50 p-4 rounded border">
                        <p className="mb-4">
                            The categories you configure here will appear in the main navigation bar of your store.
                            You can:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                            <li>Add any category, subcategory, or group to the navbar</li>
                            <li>Change the order by using the up/down arrows</li>
                            <li>Temporarily hide categories by deactivating them</li>
                            <li>Remove categories from the navbar entirely</li>
                        </ul>
                        <p className="text-amber-600 text-sm">
                            Note: Changes to the navbar will be visible immediately to all users.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedCategoriesPage; 