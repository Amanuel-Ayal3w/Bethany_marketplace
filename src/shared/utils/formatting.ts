/**
 * Formats a number as Ethiopian Birr (ETB) currency
 * @param amount - The numeric amount to format
 * @param showSymbol - Whether to include the ETB prefix (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, showSymbol = true): string => {
    const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return showSymbol ? `ETB ${formattedAmount}` : formattedAmount;
};

/**
 * Formats a price range
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Formatted price range string
 */
export const formatPriceRange = (min: number, max: number): string => {
    return `ETB ${min.toLocaleString('en-US')} - ETB ${max.toLocaleString('en-US')}`;
};

/**
 * Calculates and formats discount percentage
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Formatted discount percentage string
 */
export const formatDiscount = (originalPrice: number, salePrice: number): string => {
    if (!salePrice || originalPrice <= 0) return '';

    const discountPercentage = Math.round(100 - (salePrice / originalPrice) * 100);
    return `-${discountPercentage}%`;
}; 