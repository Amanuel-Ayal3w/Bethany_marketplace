"use server";

import { unstable_cache } from "next/cache";
import { db } from "@/shared/lib/db";

// Define the category type to match the database schema
export type FooterCategory = {
    id: string;
    name: string;
    url: string;
    parentID: string | null;
};

// Create a cached version of the footer categories
export const getFooterCategories = unstable_cache(
    async () => {
        try {
            // Get top-level categories (no parentID)
            const mainCategories = await db.category.findMany({
                where: { parentID: null },
                take: 5, // Limit to top 5 main categories
                orderBy: { name: 'asc' },
            });

            // Get some subcategories
            const subCategories = await db.category.findMany({
                where: {
                    parentID: { not: null }
                },
                take: 4, // Add some subcategories
                orderBy: { name: 'asc' },
            });

            // Combine and return the top 9 categories for footer display
            const footerCategories = [...mainCategories, ...subCategories].slice(0, 9);

            return { categories: footerCategories as FooterCategory[] };
        } catch (error) {
            console.error("Error fetching footer categories:", error);
            return { error: "Failed to fetch categories for footer", categories: [] as FooterCategory[] };
        }
    },
    ["footer-categories"], // Cache key
    { revalidate: 3600 } // Revalidate once per hour
); 