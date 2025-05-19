export const IMAGE_BASE_URL = process.env.IMG_URL || '';

// Add an explicit check for image paths
export const getImageUrl = (imagePath?: string): string => {
    if (!imagePath) return '';

    // Check if it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Make sure path starts with a slash if not already
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return normalizedPath;
};
