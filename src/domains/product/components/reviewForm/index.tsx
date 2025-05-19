"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { addProductReview, updateProductReview } from "@/actions/product/reviews";
import Button from "@/shared/components/UI/button";
import { StarIcon } from "@/shared/components/icons/svgIcons";

interface ReviewFormProps {
    productId: string;
    reviewId?: string; // Optional - only for editing an existing review
    initialRating?: number;
    initialReviewText?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
    productId,
    reviewId,
    initialRating = 0,
    initialReviewText = "",
    onSuccess,
    onCancel,
}) => {
    const router = useRouter();
    const [rating, setRating] = useState(initialRating);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState(initialReviewText);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!reviewId;

    const handleStarClick = (newRating: number) => {
        setRating(newRating);
    };

    const handleStarHover = (newRating: number) => {
        setHoverRating(newRating);
    };

    const handleStarLeave = () => {
        setHoverRating(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (rating === 0) {
            setError("Please select a star rating");
            return;
        }

        if (reviewText.trim().length < 10) {
            setError("Please write a review with at least 10 characters");
            return;
        }

        setIsSubmitting(true);

        try {
            let response;

            if (isEditing) {
                response = await updateProductReview(reviewId, {
                    rating,
                    reviewText: reviewText.trim(),
                });
            } else {
                response = await addProductReview(productId, {
                    rating,
                    reviewText: reviewText.trim(),
                });
            }

            if (response.error) {
                setError(response.error);
                setIsSubmitting(false);
                return;
            }

            // Success!
            setIsSubmitting(false);

            // Refresh the page to show the new review
            router.refresh();

            // Call the success callback if provided
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error("Error submitting review:", err);
            setError("An unexpected error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? "Edit Your Review" : "Write a Review"}
            </h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div
                    className="flex items-center"
                    onMouseLeave={handleStarLeave}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => handleStarHover(star)}
                            className="p-1 border-none bg-transparent"
                        >
                            <StarIcon
                                width={24}
                                stroke="#856B0F"
                                fill={(hoverRating || rating) >= star ? "#FFD643" : "white"}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                </label>
                <textarea
                    id="reviewText"
                    name="reviewText"
                    rows={5}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your experience with this product..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                />
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                {onCancel && (
                    <Button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
                </Button>
            </div>
        </form>
    );
};

export default ReviewForm; 