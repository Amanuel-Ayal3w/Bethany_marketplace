"use client";

import { useState, useRef } from "react";
import { uploadBannerImage } from "@/actions/upload/imageUpload";
import Image from "next/image";
import Button from "@/shared/components/UI/button";
import SafeImage from "@/shared/components/UI/safeImage";

type BrandLogoUploaderProps = {
    currentLogo?: string | null;
    onLogoUploaded: (logoPath: string) => void;
};

export default function BrandLogoUploader({ currentLogo, onLogoUploaded }: BrandLogoUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewLogo, setPreviewLogo] = useState<string | null>(currentLogo || null);
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
            setPreviewLogo(imageUrl);

            // We can use the same upload endpoint as banners since they're both images
            const result = await uploadBannerImage(formData);

            if (result.error) {
                setError(result.error);
                setPreviewLogo(currentLogo || null);
            } else if (result.filePath) {
                // Call the callback with the new image path
                onLogoUploaded(result.filePath);
            }
        } catch (err) {
            setError("Failed to upload logo");
            setPreviewLogo(currentLogo || null);
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
                    id="brand-logo-upload"
                />
                <label
                    htmlFor="brand-logo-upload"
                    className="bg-yellow-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-yellow-700 inline-block"
                >
                    {uploading ? "Uploading..." : previewLogo ? "Change Logo" : "Upload Brand Logo"}
                </label>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {/* Display preview image */}
            {previewLogo && (
                <div className="mt-4 border rounded-md p-4 bg-gray-50">
                    <div className="relative h-24 w-full mb-4 flex items-center justify-center">
                        <SafeImage
                            src={previewLogo}
                            alt="Brand logo preview"
                            width={120}
                            height={48}
                            style={{ objectFit: "contain", maxHeight: "48px" }}
                            className="opacity-90"
                        />
                    </div>
                    <p className="text-sm text-gray-500 mb-2 break-all">{
                        previewLogo.startsWith("blob:")
                            ? "New logo will be saved when you submit the form"
                            : previewLogo
                    }</p>
                </div>
            )}
        </div>
    );
} 