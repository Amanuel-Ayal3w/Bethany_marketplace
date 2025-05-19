"use server";

import { getSupabaseServerClient } from "@/shared/lib/supabase-server";
import { db } from "@/shared/lib/db";

type ReviewData = {
    rating: number;
    reviewText: string;
};

export const getProductReviews = async (productId: string) => {
    if (!productId) {
        return { error: "Product ID is required" };
    }

    try {
        // Get reviews with profile information
        const reviews = await db.productReview.findMany({
            where: {
                productId,
            },
            orderBy: {
                createdAt: "desc", // Most recent first
            },
            include: {
                profile: true,
            },
        });

        return { success: true, reviews };
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        return { error: "Failed to fetch reviews" };
    }
};

export const getProductAverageRating = async (productId: string) => {
    if (!productId) {
        return { error: "Product ID is required" };
    }

    try {
        const reviews = await db.productReview.findMany({
            where: {
                productId,
            },
            select: {
                rating: true,
            },
        });

        if (reviews.length === 0) {
            return { success: true, averageRating: 0, totalReviews: 0 };
        }

        // Calculate the average rating
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = sum / reviews.length;

        return {
            success: true,
            averageRating,
            totalReviews: reviews.length,
        };
    } catch (error) {
        console.error("Error calculating average rating:", error);
        return { error: "Failed to calculate average rating" };
    }
};

export const addProductReview = async (productId: string, reviewData: ReviewData) => {
    try {
        // Get the authenticated user
        const supabase = getSupabaseServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return { error: "You must be logged in to leave a review" };
        }

        const userId = session.user.id;

        // Check if user has already reviewed this product
        const existingReview = await db.productReview.findFirst({
            where: {
                productId,
                profileId: userId,
            },
        });

        if (existingReview) {
            return { error: "You have already reviewed this product" };
        }

        // Create the review
        const review = await db.productReview.create({
            data: {
                productId,
                profileId: userId,
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
                isVerifiedPurchase: false, // This would be determined by checking order history
            },
        });

        return { success: true, review };
    } catch (error) {
        console.error("Error adding product review:", error);
        return { error: "Failed to add review" };
    }
};

export const updateProductReview = async (reviewId: string, reviewData: ReviewData) => {
    try {
        // Get the authenticated user
        const supabase = getSupabaseServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return { error: "You must be logged in to update a review" };
        }

        const userId = session.user.id;

        // Find the review and check if it belongs to the user
        const existingReview = await db.productReview.findUnique({
            where: {
                id: reviewId,
            },
        });

        if (!existingReview) {
            return { error: "Review not found" };
        }

        if (existingReview.profileId !== userId) {
            return { error: "You can only edit your own reviews" };
        }

        // Update the review
        const updatedReview = await db.productReview.update({
            where: {
                id: reviewId,
            },
            data: {
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
                updatedAt: new Date(),
            },
        });

        return { success: true, review: updatedReview };
    } catch (error) {
        console.error("Error updating product review:", error);
        return { error: "Failed to update review" };
    }
};

export const deleteProductReview = async (reviewId: string) => {
    try {
        // Get the authenticated user
        const supabase = getSupabaseServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return { error: "You must be logged in to delete a review" };
        }

        const userId = session.user.id;

        // Find the review and check if it belongs to the user
        const existingReview = await db.productReview.findUnique({
            where: {
                id: reviewId,
            },
        });

        if (!existingReview) {
            return { error: "Review not found" };
        }

        if (existingReview.profileId !== userId) {
            return { error: "You can only delete your own reviews" };
        }

        // Delete the review
        await db.productReview.delete({
            where: {
                id: reviewId,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting product review:", error);
        return { error: "Failed to delete review" };
    }
};

export const markReviewHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
        // Get the authenticated user
        const supabase = getSupabaseServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return { error: "You must be logged in to mark a review as helpful" };
        }

        // Find the review
        const existingReview = await db.productReview.findUnique({
            where: {
                id: reviewId,
            },
        });

        if (!existingReview) {
            return { error: "Review not found" };
        }

        // Update the review's helpful or not helpful count
        const updatedReview = await db.productReview.update({
            where: {
                id: reviewId,
            },
            data: {
                isHelpful: isHelpful
                    ? { increment: 1 }
                    : existingReview.isHelpful,
                isNotHelpful: !isHelpful
                    ? { increment: 1 }
                    : existingReview.isNotHelpful,
            },
        });

        return { success: true, review: updatedReview };
    } catch (error) {
        console.error("Error marking review as helpful:", error);
        return { error: "Failed to mark review as helpful" };
    }
}; 