"use server";

import { db } from "@/shared/lib/db";

export type FeaturedBanner = {
    id: string;
    title: string;
    smallTitle: string | null;
    imagePath: string;
    url: string;
    position: number;
    isActive: boolean;
    bannerType: string;
    createdAt: Date;
    updatedAt: Date;
};

export type FeaturedBannerInput = {
    id?: string;
    title: string;
    smallTitle?: string;
    imagePath: string;
    url: string;
    position?: number;
    isActive?: boolean;
    bannerType: string;
};

// Use type assertion to access the featuredBanner model
const featuredBannerModel = (db as any).featuredBanner;

// Get all banners
export async function getAllFeaturedBanners() {
    try {
        const banners = await featuredBannerModel.findMany({
            orderBy: {
                position: 'asc'
            }
        });

        return { success: true, banners };
    } catch (error) {
        console.error("Error fetching featured banners:", error);
        return { success: false, error: "Failed to fetch featured banners" };
    }
}

// Get active banners by type
export async function getActiveFeaturedBannersByType(bannerType: string) {
    try {
        const banners = await featuredBannerModel.findMany({
            where: {
                isActive: true,
                bannerType
            },
            orderBy: {
                position: 'asc'
            }
        });

        return { success: true, banners };
    } catch (error) {
        console.error(`Error fetching ${bannerType} banners:`, error);
        return { success: false, error: `Failed to fetch ${bannerType} banners` };
    }
}

// Create a new banner
export async function createFeaturedBanner(data: FeaturedBannerInput) {
    try {
        const banner = await featuredBannerModel.create({
            data: {
                title: data.title,
                smallTitle: data.smallTitle || null,
                imagePath: data.imagePath,
                url: data.url,
                position: data.position || 999,
                isActive: data.isActive !== undefined ? data.isActive : true,
                bannerType: data.bannerType
            }
        });

        return { success: true, banner };
    } catch (error) {
        console.error("Error creating featured banner:", error);
        return { success: false, error: "Failed to create featured banner" };
    }
}

// Update an existing banner
export async function updateFeaturedBanner(id: string, data: Partial<FeaturedBannerInput>) {
    try {
        const banner = await featuredBannerModel.update({
            where: { id },
            data
        });

        return { success: true, banner };
    } catch (error) {
        console.error("Error updating featured banner:", error);
        return { success: false, error: "Failed to update featured banner" };
    }
}

// Delete a banner
export async function deleteFeaturedBanner(id: string) {
    try {
        await featuredBannerModel.delete({
            where: { id }
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting featured banner:", error);
        return { success: false, error: "Failed to delete featured banner" };
    }
}

// Toggle banner active status
export async function toggleFeaturedBannerStatus(id: string, isActive: boolean) {
    try {
        const banner = await featuredBannerModel.update({
            where: { id },
            data: { isActive }
        });

        return { success: true, banner };
    } catch (error) {
        console.error("Error toggling featured banner status:", error);
        return { success: false, error: "Failed to toggle featured banner status" };
    }
}

// Update banner positions (batch update)
export async function updateBannerPositions(updates: { id: string, position: number }[]) {
    try {
        const updatePromises = updates.map(update =>
            featuredBannerModel.update({
                where: { id: update.id },
                data: { position: update.position }
            })
        );

        await Promise.all(updatePromises);

        return { success: true };
    } catch (error) {
        console.error("Error updating banner positions:", error);
        return { success: false, error: "Failed to update banner positions" };
    }
} 