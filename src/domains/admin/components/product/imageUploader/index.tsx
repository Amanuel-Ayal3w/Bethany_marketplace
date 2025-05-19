"use client";

import { useState, useRef } from "react";
import { uploadProductImage } from "@/actions/upload/imageUpload";
import SafeImage from "@/shared/components/UI/safeImage";
import Button from "@/shared/components/UI/button";

type ImageUploaderProps = {
    images: string[];
    onChange: (images: string[]) => void;
};

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

            const result = await uploadProductImage(formData);

            if (result.error) {
                setError(result.error);
            } else if (result.filePath) {
                // Add the new image path to the images array
                onChange([...images, result.filePath]);
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

    // Remove an image from the list
    // This only removes the reference from the form, doesn't delete the file
    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
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
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    className="bg-bethany-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-bethany-blue-600 inline-block"
                >
                    {uploading ? "Uploading..." : "Upload Image"}
                </label>
                {error && <p className="text-bethany-red-500 mt-2">{error}</p>}
            </div>

            {/* Display uploaded images */}
            <div className="grid grid-cols-2 gap-4 mt-4">
                {images.map((img, index) => (
                    <div key={index} className="relative border rounded-md p-2 bg-gray-50">
                        <div className="relative h-32 w-full mb-2 bg-white flex items-center justify-center">
                            <SafeImage
                                src={img}
                                alt={`Product image ${index + 1}`}
                                fill
                                sizes="(max-width: 150px) 100vw"
                                style={{ objectFit: "contain" }}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500 truncate w-[120px]">{img}</p>
                            <Button
                                onClick={() => removeImage(index)}
                                className="text-xs bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 