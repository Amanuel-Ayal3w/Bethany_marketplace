"use client";

import Image from "next/image";
import { useState } from "react";

import { deleteProductReview, markReviewHelpful } from "@/actions/product/reviews";
import { LikeIcon, StarIcon } from "@/shared/components/icons/svgIcons";
import Button from "@/shared/components/UI/button";
import { formatDate } from "@/shared/utils/date";
import ReviewForm from "../reviewForm";

interface Review {
    id: string;
    productId: string;
    profileId: string;
    rating: number;
    reviewText: string;
    isVerifiedPurchase: boolean;
    isHelpful: number;
    isNotHelpful: number;
    createdAt: string | Date;
    updatedAt: string | Date;
    profile?: any;
}

interface ReviewListProps {
    reviews: Review[];
    productId: string;
    currentUserId?: string | null;
    onReviewsChanged?: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    productId,
    currentUserId,
    onReviewsChanged
}) => {
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleEditClick = (reviewId: string) => {
        setEditingReviewId(reviewId);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
    };

    const handleEditSuccess = () => {
        setEditingReviewId(null);
        if (onReviewsChanged) {
            onReviewsChanged();
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (confirm("Are you sure you want to delete this review?")) {
            try {
                const response = await deleteProductReview(reviewId);
                if (response.error) {
                    setError(response.error);
                    return;
                }

                if (onReviewsChanged) {
                    onReviewsChanged();
                }
            } catch (err) {
                console.error("Error deleting review:", err);
                setError("An error occurred while deleting the review");
            }
        }
    };

    const handleHelpfulVote = async (reviewId: string, isHelpful: boolean) => {
        try {
            await markReviewHelpful(reviewId, isHelpful);
            if (onReviewsChanged) {
                onReviewsChanged();
            }
        } catch (err) {
            console.error("Error marking review as helpful:", err);
        }
    };

    return (
        <div className="mt-6">
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review this product!
                </div>
            ) : (
                <div>
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 py-6">
                            {editingReviewId === review.id ? (
                                <ReviewForm
                                    productId={productId}
                                    reviewId={review.id}
                                    initialRating={review.rating}
                                    initialReviewText={review.reviewText}
                                    onSuccess={handleEditSuccess}
                                    onCancel={handleCancelEdit}
                                />
                            ) : (
                                <>
                                    <div className="flex items-center flex-wrap w-full mb-2 text-sm">
                                        <div className="flex h-8 items-center text-gray-800 font-medium">
                                            <Image
                                                src="/images/images/defaultUser.png"
                                                className="rounded-full overflow-hidden mr-3"
                                                alt="User avatar"
                                                width={32}
                                                height={32}
                                            />
                                            <span>{review.profile?.name || "Anonymous User"}</span>
                                        </div>

                                        {review.isVerifiedPurchase && (
                                            <span className="text-[#f97a1f] ml-4 font-medium">Verified Purchase</span>
                                        )}

                                        <div className="ml-4">
                                            <div className="inline-block pl-6 bg-[url('/icons/dateIcon.svg')] bg-no-repeat bg-[position:left_center]">
                                                {formatDate(new Date(review.createdAt))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center mb-3">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                width={16}
                                                stroke="#856B0F"
                                                fill={i < review.rating ? "#FFD643" : "white"}
                                            />
                                        ))}
                                    </div>

                                    <div className="mb-4 text-sm leading-5 text-gray-800 whitespace-pre-line">
                                        {review.reviewText}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Button
                                                onClick={() => handleHelpfulVote(review.id, true)}
                                                className="h-8 mr-3 font-medium px-3 bg-white border border-white rounded-md text-gray-900 hover:border-green-600 hover:bg-green-100"
                                            >
                                                <LikeIcon width={16} className="fill-white stroke-gray-700 mr-2" />
                                                Helpful ({review.isHelpful})
                                            </Button>
                                            <Button
                                                onClick={() => handleHelpfulVote(review.id, false)}
                                                className="h-8 mr-3 font-medium px-3 bg-white border border-white rounded-md text-gray-900 hover:border-red-700 hover:bg-red-100 [&>svg]:inline-block [&>svg]:[-scale-x-100] [&>svg]:rotate-180"
                                            >
                                                <LikeIcon width={16} className="fill-white stroke-gray-700 mr-2" />
                                                Not Helpful ({review.isNotHelpful})
                                            </Button>
                                        </div>

                                        {currentUserId === review.profileId && (
                                            <div>
                                                <Button
                                                    onClick={() => handleEditClick(review.id)}
                                                    className="text-blue-600 hover:text-blue-800 bg-transparent border-none mr-2"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="text-red-600 hover:text-red-800 bg-transparent border-none"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewList; 