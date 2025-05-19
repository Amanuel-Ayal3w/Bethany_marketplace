"use client";

import Image, { ImageProps } from "next/image";

/**
 * A wrapper for Next.js Image component that safely handles undefined or invalid src values
 */
export default function SafeImage({ src, alt, ...rest }: ImageProps) {
    // Create placeholder with consistent dimensions
    const renderPlaceholder = () => (
        <div
            className={`bg-gray-200 flex items-center justify-center ${rest.className || ''}`}
            style={{
                width: typeof rest.width === 'number' ? `${rest.width}px` : rest.width,
                height: typeof rest.height === 'number' ? `${rest.height}px` : rest.height,
                position: rest.fill ? 'absolute' : 'relative',
                top: rest.fill ? 0 : undefined,
                left: rest.fill ? 0 : undefined,
                right: rest.fill ? 0 : undefined,
                bottom: rest.fill ? 0 : undefined,
            }}
        >
            <span className="text-gray-400 text-xs">No image</span>
        </div>
    );

    // Return placeholder for undefined or empty src
    if (!src || src === 'undefined' || src === '/undefined') {
        return renderPlaceholder();
    }

    // Handle different src types
    let safeSource: string;

    try {
        // If src is a string, process it
        if (typeof src === 'string') {
            // Relative path without leading slash
            if (!src.startsWith('/') && !src.startsWith('http')) {
                safeSource = `/${src}`;
            } else {
                safeSource = src;
            }
        } else {
            // For StaticImageData or other objects
            safeSource = src as any;
        }

        return <Image src={safeSource} alt={alt || ""} {...rest} />;
    } catch (error) {
        console.error("Error rendering image:", error);
        return renderPlaceholder();
    }
} 