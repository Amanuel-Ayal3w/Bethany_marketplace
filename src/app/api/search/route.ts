import { db } from "@/shared/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";
        const categoryId = searchParams.get("category");
        const brandId = searchParams.get("brand");
        const minPrice = parseFloat(searchParams.get("minPrice") || "0");
        const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999999");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const sort = searchParams.get("sort") || "createdAt";
        const order = searchParams.get("order") || "desc";

        // Validate parameters
        if (page < 1 || limit < 1 || limit > 50) {
            return NextResponse.json(
                { error: "Invalid pagination parameters" },
                { status: 400 }
            );
        }

        // Build search filters
        const whereClause: any = {
            AND: [],
        };

        // Text search
        if (query.trim()) {
            whereClause.AND.push({
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { desc: { contains: query, mode: "insensitive" } },
                    { specialFeatures: { has: query } },
                ],
            });
        }

        // Category filter
        if (categoryId) {
            whereClause.AND.push({ categoryID: categoryId });
        }

        // Brand filter
        if (brandId) {
            whereClause.AND.push({ brandID: brandId });
        }

        // Price range filter
        if (minPrice > 0 || maxPrice < 999999999) {
            whereClause.AND.push({
                price: {
                    gte: minPrice,
                    lte: maxPrice,
                },
            });
        }

        // Get total count for pagination
        const totalItems = await db.product.count({ where: whereClause });

        // Calculate pagination
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil(totalItems / limit);

        // Get products with pagination and sorting
        const products = await db.product.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                images: true,
                price: true,
                salePrice: true,
                isAvailable: true,
                specialFeatures: true,
                brand: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                [sort]: order,
            },
        });

        // Return the search results with pagination info
        return NextResponse.json({
            products,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            { error: "Failed to perform search" },
            { status: 500 }
        );
    }
} 