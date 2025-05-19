"use server";

import { writeFile, unlink, readdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

/**
 * Uploads an image file to the server's public directory
 * @param formData FormData containing the image file
 * @returns Object with the file path or error
 */
export async function uploadProductImage(formData: FormData) {
    try {
        const file = formData.get("file") as File;

        if (!file) {
            return { error: "No file uploaded" };
        }

        // Validate file type
        const fileType = file.type;
        if (!fileType.startsWith("image/")) {
            return { error: "File must be an image" };
        }

        // Get file extension and create unique filename
        const fileExtension = file.name.split(".").pop() || "";
        const fileName = `${randomUUID()}.${fileExtension}`;

        // Create path and save to public directory
        const relativePath = `/images/products/${fileName}`;
        const absolutePath = path.join(process.cwd(), "public", relativePath);

        // Convert file to buffer and write to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(absolutePath, buffer);

        return {
            success: true,
            filePath: relativePath
        };
    } catch (error) {
        console.error("Error uploading image:", error);
        return { error: "Failed to upload image" };
    }
}

/**
 * Uploads a banner image file to the server's public directory
 * @param formData FormData containing the image file
 * @returns Object with the file path or error
 */
export async function uploadBannerImage(formData: FormData) {
    try {
        const file = formData.get("file") as File;

        if (!file) {
            return { error: "No file uploaded" };
        }

        // Validate file type
        const fileType = file.type;
        if (!fileType.startsWith("image/")) {
            return { error: "File must be an image" };
        }

        // Get file extension and create unique filename
        const fileExtension = file.name.split(".").pop() || "";
        const fileName = `${randomUUID()}.${fileExtension}`;

        // Create path and save to public directory
        const relativePath = `/images/banners/${fileName}`;
        // Ensure the directory exists
        const dirPath = path.join(process.cwd(), "public", "images", "banners");

        try {
            await readdir(dirPath);
        } catch (error) {
            // Directory doesn't exist, create it
            await writeFile(path.join(process.cwd(), "public", "images", "banners", ".gitkeep"), "");
        }

        const absolutePath = path.join(process.cwd(), "public", relativePath);

        // Convert file to buffer and write to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(absolutePath, buffer);

        return {
            success: true,
            filePath: relativePath
        };
    } catch (error) {
        console.error("Error uploading banner image:", error);
        return { error: "Failed to upload banner image" };
    }
}

/**
 * Delete an image file from the server's public directory
 * @param filePath Relative path of the file to delete
 * @returns Object with success or error message
 */
export async function deleteProductImage(filePath: string) {
    try {
        const absolutePath = path.join(process.cwd(), "public", filePath);
        await unlink(absolutePath);
        return { success: true };
    } catch (error) {
        console.error("Error deleting image:", error);
        return { error: "Failed to delete image" };
    }
}

/**
 * Get all product images from the server
 * @returns Array of image paths
 */
export async function getProductImages() {
    try {
        const dirPath = path.join(process.cwd(), "public", "images", "products");

        try {
            const files = await readdir(dirPath);
            const imagePaths = files
                .filter(file => !file.startsWith(".")) // Filter out hidden files
                .map(file => `/images/products/${file}`);

            return { success: true, images: imagePaths };
        } catch (error) {
            // Directory doesn't exist
            return { success: true, images: [] };
        }
    } catch (error) {
        console.error("Error getting product images:", error);
        return { error: "Failed to get product images" };
    }
} 