/**
 * Formats a date into a readable string format
 * @param date The date to format
 * @returns A formatted date string like "May 10, 2023"
 */
export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}; 