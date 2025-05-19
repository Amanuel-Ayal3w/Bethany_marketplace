"use server";

import { db } from "@/shared/lib/db";
import { TFeaturedCategory } from "@/shared/types/categories";

/**
 * Get all featured categories with their related category data
 */
export const getAllFeaturedCategories = async () => {
    try {
        const result = await db.featuredCategory.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                position: 'asc'
            },
            include: {
                category: true
            }
        });

        if (!result) return { error: "Can't read featured categories" };
        return { res: result };
    } catch (error) {
        console.error("Error fetching featured categories:", error);
        return { error: "Failed to read featured categories" };
    }
};

/**
 * Add a category to the featured categories
 */
export const addFeaturedCategory = async (categoryId: string, position?: number) => {
    if (!categoryId) return { error: "Category ID is required" };

    try {
        // Check if category exists
        const categoryExists = await db.category.findUnique({
            where: { id: categoryId }
        });

        if (!categoryExists) return { error: "Category not found" };

        // Check if already featured
        const alreadyFeatured = await db.featuredCategory.findFirst({
            where: { categoryID: categoryId }
        });

        if (alreadyFeatured) return { error: "Category is already featured" };

        // Get max position if none provided
        let finalPosition = position;
        if (!finalPosition) {
            const maxPosition = await db.featuredCategory.findMany({
                orderBy: { position: 'desc' },
                take: 1
            });
            finalPosition = maxPosition.length > 0 ? maxPosition[0].position + 1 : 0;
        }

        // Create featured category
        const result = await db.featuredCategory.create({
            data: {
                categoryID: categoryId,
                position: finalPosition,
                isActive: true
            }
        });

        return { res: result };
    } catch (error) {
        console.error("Error adding featured category:", error);
        return { error: "Failed to add featured category" };
    }
};

/**
 * Update a featured category's position or active status
 */
export const updateFeaturedCategory = async (id: string, data: { position?: number, isActive?: boolean }) => {
    if (!id) return { error: "Featured category ID is required" };

    try {
        const result = await db.featuredCategory.update({
            where: { id },
            data
        });

        return { res: result };
    } catch (error) {
        console.error("Error updating featured category:", error);
        return { error: "Failed to update featured category" };
    }
};

/**
 * Remove a category from featured categories
 */
export const removeFeaturedCategory = async (id: string) => {
    if (!id) return { error: "Featured category ID is required" };

    try {
        await db.featuredCategory.delete({
            where: { id }
        });

        return { res: { success: true } };
    } catch (error) {
        console.error("Error removing featured category:", error);
        return { error: "Failed to remove featured category" };
    }
};

/**
 * Get navbar categories for display in the store
 */
export const getNavbarCategories = async () => {
    try {
        const result = await db.featuredCategory.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                position: 'asc'
            },
            include: {
                category: true
            }
        });

        if (!result) return { error: "Can't read navbar categories" };

        // Transform the result into a more convenient format for the navbar
        const navItems = result.map(item => ({
            name: item.category.name,
            link: `/list/${item.category.url}`
        }));

        return { res: navItems };
    } catch (error) {
        console.error("Error fetching navbar categories:", error);
        return { error: "Failed to read navbar categories" };
    }
}; 