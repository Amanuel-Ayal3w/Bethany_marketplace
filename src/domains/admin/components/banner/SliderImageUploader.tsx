"use client";

import { useState, useRef } from "react";
import { uploadBannerImage } from "@/actions/upload/imageUpload";
import Image from "next/image";
import Button from "@/shared/components/UI/button";

type SliderImage = {
    path: string;
    title: string;
    buttonText: string;
    url: string;
};

type SliderImageUploaderProps = {
    images: SliderImage[];
    onImagesChange: (images: SliderImage[]) => void;
};

export default function SliderImageUploader({ images, onImagesChange }: SliderImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", files[0]);

            const result = await uploadBannerImage(formData);

            if (result.error) {
                setError(result.error);
            } else if (result.filePath) {
                // Add the new image to the list
                const newImage: SliderImage = {
                    path: result.filePath,
                    title: "New Slide",
                    buttonText: "Shop Now",
                    url: "/products",
                };
                onImagesChange([...images, newImage]);
            }
        } catch (err) {
            setError("Failed to upload image");
            console.error(err);
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    const handleEditImage = (index: number, field: keyof SliderImage, value: string) => {
        const newImages = [...images];
        newImages[index] = {
            ...newImages[index],
            [field]: value
        };
        onImagesChange(newImages);
    };

    const handleMoveImage = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) ||
            (direction === 'down' && index === images.length - 1)) {
            return;
        }

        const newImages = [...images];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap the images
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

        onImagesChange(newImages);
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    ref={fileInputRef}
                    className="hidden"
                    id="slider-image-upload"
                />
                <label
                    htmlFor="slider-image-upload"
                    className="bg-blue-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-700 inline-block"
                >
                    {uploading ? "Uploading..." : "Add Slider Image"}
                </label>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {/* Display all slider images */}
            {images.length > 0 ? (
                <div className="space-y-6">
                    <h3 className="font-medium text-gray-700">Slider Images ({images.length})</h3>

                    {images.map((image, index) => (
                        <div key={index} className="border rounded-lg bg-gray-50 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium">Slide {index + 1}</h4>
                                <div className="flex space-x-2">
                                    {index > 0 && (
                                        <button
                                            onClick={() => handleMoveImage(index, 'up')}
                                            className="px-2 py-1 bg-gray-200 rounded text-xs"
                                        >
                                            ↑ Move Up
                                        </button>
                                    )}
                                    {index < images.length - 1 && (
                                        <button
                                            onClick={() => handleMoveImage(index, 'down')}
                                            className="px-2 py-1 bg-gray-200 rounded text-xs"
                                        >
                                            ↓ Move Down
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative h-48 w-full">
                                    <Image
                                        src={image.path}
                                        alt={`Slide ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 500px"
                                        style={{ objectFit: "contain" }}
                                        className="rounded"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={image.title}
                                            onChange={(e) => handleEditImage(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                            placeholder="Slide Title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                                        <input
                                            type="text"
                                            value={image.buttonText}
                                            onChange={(e) => handleEditImage(index, 'buttonText', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                            placeholder="Shop Now"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Link URL</label>
                                        <input
                                            type="text"
                                            value={image.url}
                                            onChange={(e) => handleEditImage(index, 'url', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                            placeholder="/products"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 border rounded-lg">
                    <p className="text-gray-500 mb-4">No slider images added yet</p>
                    <p className="text-sm text-gray-400">
                        Click "Add Slider Image" to upload your first slide
                    </p>
                </div>
            )}
        </div>
    );
} 