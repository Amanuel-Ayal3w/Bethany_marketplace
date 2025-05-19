"use client";

import { useState, useRef } from "react";
import { uploadBannerImage } from "@/actions/upload/imageUpload";
import Image from "next/image";
import Button from "@/shared/components/UI/button";

type BannerImageUploaderProps = {
    currentImage?: string;
    onImageUploaded: (imagePath: string) => void;
};

export default function BannerImageUploader({ currentImage, onImageUploaded }: BannerImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
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

            // Create a preview URL for the selected image
            const imageUrl = URL.createObjectURL(files[0]);
            setPreviewImage(imageUrl);

            const result = await uploadBannerImage(formData);

            if (result.error) {
                setError(result.error);
                setPreviewImage(currentImage || null);
            } else if (result.filePath) {
                // Call the callback with the new image path
                onImageUploaded(result.filePath);
            }
        } catch (err) {
            setError("Failed to upload image");
            setPreviewImage(currentImage || null);
            console.error(err);
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
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
                    id="banner-image-upload"
                />
                <label
                    htmlFor="banner-image-upload"
                    className="bg-blue-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-700 inline-block"
                >
                    {uploading ? "Uploading..." : previewImage ? "Change Image" : "Upload Banner Image"}
                </label>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {/* Display preview image */}
            {previewImage && (
                <div className="mt-4 border rounded-md p-4 bg-gray-50">
                    <div className="relative h-48 w-full mb-4">
                        <Image
                            src={previewImage}
                            alt="Banner preview"
                            fill
                            sizes="(max-width: 768px) 100vw, 500px"
                            style={{ objectFit: "contain" }}
                            className="rounded"
                        />
                    </div>
                    <p className="text-sm text-gray-500 mb-2 break-all">{
                        previewImage.startsWith("blob:")
                            ? "New image will be saved when you submit the form"
                            : previewImage
                    }</p>
                </div>
            )}
        </div>
    );
} 