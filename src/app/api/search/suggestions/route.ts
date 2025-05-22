import { db } from "@/shared/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";

        // If query is too short, return empty suggestions
        if (!query || query.length < 2) {
            return NextResponse.json({ suggestions: [] });
        }

        // Limit results to keep suggestions fast
        const limit = 5;

        // Get matching products
        const products = await db.product.findMany({
            where: {
                name: { contains: query, mode: "insensitive" }
            },
            select: {
                id: true,
                name: true,
                images: true,
            },
            take: limit,
        });

        // Get matching categories
        const categories = await db.category.findMany({
            where: {
                name: { contains: query, mode: "insensitive" }
            },
            select: {
                id: true,
                name: true,
            },
            take: 3,
        });

        // Get matching brands
        const brands = await db.brand.findMany({
            where: {
                name: { contains: query, mode: "insensitive" }
            },
            select: {
                id: true,
                name: true,
            },
            take: 3,
        });

        // Format all suggestions
        const suggestions = [
            ...products.map(product => ({
                id: product.id,
                type: 'product' as const,
                name: product.name,
                image: product.images && product.images.length > 0 ? product.images[0] : undefined,
                url: `/product/${product.id}`
            })),
            ...categories.map(category => ({
                id: category.id,
                type: 'category' as const,
                name: category.name,
                image: undefined,
                url: `/list/category/${category.id}`
            })),
            ...brands.map(brand => ({
                id: brand.id,
                type: 'brand' as const,
                name: brand.name,
                image: undefined,
                url: `/list/brand/${brand.id}`
            }))
        ];

        // Sort suggestions - exact matches first, then starts with, then contains
        suggestions.sort((a, b) => {
            // Exact matches first
            if (a.name.toLowerCase() === query.toLowerCase() && b.name.toLowerCase() !== query.toLowerCase()) {
                return -1;
            }
            if (a.name.toLowerCase() !== query.toLowerCase() && b.name.toLowerCase() === query.toLowerCase()) {
                return 1;
            }

            // Then starts with
            if (a.name.toLowerCase().startsWith(query.toLowerCase()) && !b.name.toLowerCase().startsWith(query.toLowerCase())) {
                return -1;
            }
            if (!a.name.toLowerCase().startsWith(query.toLowerCase()) && b.name.toLowerCase().startsWith(query.toLowerCase())) {
                return 1;
            }

            // Then alphabetical
            return a.name.localeCompare(b.name);
        });

        // Return limited suggestions
        return NextResponse.json({
            suggestions: suggestions.slice(0, 10)
        });

    } catch (error) {
        console.error("Suggestions API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch suggestions" },
            { status: 500 }
        );
    }
} 