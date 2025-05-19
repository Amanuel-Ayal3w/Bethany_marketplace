"use server";

import { db } from "@/shared/lib/db";

export type HomepageBrand = {
    id: string;
    brandID: string;
    logoPath: string | null;
    position: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    brand: {
        id: string;
        name: string;
    };
};

export type HomepageBrandInput = {
    id?: string;
    brandID: string;
    logoPath?: string;
    position?: number;
    isActive?: boolean;
};

// Use type assertion to access the homepageBrand model
const homepageBrandModel = (db as any).homepageBrand;

// Get all homepage brands
export async function getAllHomepageBrands() {
    try {
        const brands = await homepageBrandModel.findMany({
            orderBy: {
                position: 'asc'
            },
            include: {
                brand: true
            }
        });

        return { success: true, brands };
    } catch (error) {
        console.error("Error fetching homepage brands:", error);
        return { success: false, error: "Failed to fetch homepage brands" };
    }
}

// Get active homepage brands
export async function getActiveHomepageBrands() {
    try {
        const brands = await homepageBrandModel.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                position: 'asc'
            },
            include: {
                brand: true
            }
        });

        return { success: true, brands };
    } catch (error) {
        console.error("Error fetching active homepage brands:", error);
        return { success: false, error: "Failed to fetch active homepage brands" };
    }
}

// Create a new homepage brand
export async function createHomepageBrand(data: HomepageBrandInput) {
    try {
        // Check if the brand already exists
        const existing = await homepageBrandModel.findUnique({
            where: {
                brandID: data.brandID
            }
        });

        if (existing) {
            return { success: false, error: "Brand is already featured on the homepage" };
        }

        const homepageBrand = await homepageBrandModel.create({
            data: {
                brandID: data.brandID,
                logoPath: data.logoPath,
                position: data.position || 999,
                isActive: data.isActive !== undefined ? data.isActive : true
            },
            include: {
                brand: true
            }
        });

        return { success: true, homepageBrand };
    } catch (error) {
        console.error("Error creating homepage brand:", error);
        return { success: false, error: "Failed to create homepage brand" };
    }
}

// Update an existing homepage brand
export async function updateHomepageBrand(id: string, data: Partial<HomepageBrandInput>) {
    try {
        const homepageBrand = await homepageBrandModel.update({
            where: { id },
            data,
            include: {
                brand: true
            }
        });

        return { success: true, homepageBrand };
    } catch (error) {
        console.error("Error updating homepage brand:", error);
        return { success: false, error: "Failed to update homepage brand" };
    }
}

// Delete a homepage brand
export async function deleteHomepageBrand(id: string) {
    try {
        await homepageBrandModel.delete({
            where: { id }
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting homepage brand:", error);
        return { success: false, error: "Failed to delete homepage brand" };
    }
}

// Toggle homepage brand active status
export async function toggleHomepageBrandStatus(id: string, isActive: boolean) {
    try {
        const homepageBrand = await homepageBrandModel.update({
            where: { id },
            data: { isActive },
            include: {
                brand: true
            }
        });

        return { success: true, homepageBrand };
    } catch (error) {
        console.error("Error toggling homepage brand status:", error);
        return { success: false, error: "Failed to toggle homepage brand status" };
    }
}

// Update homepage brand positions (batch update)
export async function updateHomepageBrandPositions(updates: { id: string, position: number }[]) {
    try {
        const updatePromises = updates.map(update =>
            homepageBrandModel.update({
                where: { id: update.id },
                data: { position: update.position }
            })
        );

        await Promise.all(updatePromises);

        return { success: true };
    } catch (error) {
        console.error("Error updating homepage brand positions:", error);
        return { success: false, error: "Failed to update homepage brand positions" };
    }
} 