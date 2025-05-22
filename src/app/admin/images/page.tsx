"use client";

import { useEffect, useState } from "react";
import { uploadProductImage, deleteProductImage, getProductImages } from "@/actions/upload/imageUpload";
import Image from "next/image";
import Button from "@/shared/components/UI/button";
import { useRouter } from "next/navigation";
import AdminPagination from "@/domains/admin/components/pagination";

const ITEMS_PER_PAGE = 12;

export default function ImageManagementPage() {
    const [images, setImages] = useState<string[]>([]);
    const [displayedImages, setDisplayedImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load existing images on page load
    useEffect(() => {
        const loadImages = async () => {
            setLoading(true);
            try {
                const result = await getProductImages();

                if (result.success && result.images) {
                    setImages(result.images);
                } else if (result.error) {
                    setError(result.error);
                }
            } catch (err) {
                console.error("Failed to load images", err);
                setError("Failed to load images");
            } finally {
                setLoading(false);
            }
        };

        loadImages();
    }, []);

    // Apply pagination when images or current page changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayedImages(images.slice(startIndex, endIndex));
    }, [images, currentPage]);

    // Handle file drop events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleFiles(e.dataTransfer.files);
        }
    };

    // Handle file input change
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            await handleFiles(e.target.files);
        }
    };

    // Process files for upload
    const handleFiles = async (files: FileList) => {
        setUploading(true);
        setError(null);

        try {
            // Upload each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append("file", file);

                const result = await uploadProductImage(formData);

                if (result.error) {
                    setError(`Error uploading ${file.name}: ${result.error}`);
                } else if (result.filePath) {
                    setImages(prev => [...prev, result.filePath]);
                    setCurrentPage(1); // Go to first page after upload
                }
            }
        } catch (err) {
            setError("Failed to upload images");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    // Delete an image
    const deleteImage = async (path: string) => {
        try {
            // Remove from UI immediately
            setImages(prev => prev.filter(img => img !== path));

            // Call the server action to delete the file
            await deleteProductImage(path);
        } catch (err) {
            console.error("Error deleting image:", err);
            // Add the image back to UI if deletion fails
            setImages(prev => [...prev, path]);
            setError("Failed to delete image");
        }
    };

    const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold mr-4">Image Management</h1>
                    <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        {images.length} Total Images
                    </div>
                </div>
                <Button
                    onClick={() => router.push('/admin/products')}
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                    Back to Products
                </Button>
            </div>

            {/* Upload section */}
            <div
                className={`border-2 border-dashed rounded-lg p-10 text-center mb-8 ${dragActive ? "border-bethany-blue-500 bg-bethany-blue-50" : "border-gray-300"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="space-y-4">
                    <div className="text-gray-500">
                        <p className="text-lg">Drag and drop image files here</p>
                        <p className="text-sm">or</p>
                    </div>

                    <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />

                    <label
                        htmlFor="image-upload"
                        className="inline-block bg-bethany-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-bethany-blue-600"
                    >
                        {uploading ? "Uploading..." : "Select Images"}
                    </label>

                    {error && <p className="text-bethany-red-500">{error}</p>}
                </div>
            </div>

            {/* Image gallery */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Uploaded Images</h2>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="relative h-48 bg-gray-100 animate-pulse rounded-md"></div>
                        ))}
                    </div>
                ) : images.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No images uploaded yet</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {displayedImages.map((img, index) => (
                            <div key={index} className="relative group border rounded-md p-2 bg-gray-50">
                                <div className="relative h-40 w-full mb-2">
                                    <Image
                                        src={img}
                                        alt={`Product image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 300px) 100vw"
                                        style={{ objectFit: "contain" }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-500 truncate w-[120px]">{img.split('/').pop()}</p>
                                    <Button
                                        onClick={() => deleteImage(img)}
                                        className="text-xs bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-6"
                />
            </div>
        </div>
    );
} 