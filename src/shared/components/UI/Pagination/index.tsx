'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    onPageChange?: (page: number) => void;
};

/**
 * A reusable pagination component
 */
export default function Pagination({
    currentPage,
    totalPages,
    baseUrl,
    onPageChange,
}: PaginationProps) {
    const router = useRouter();

    // Generate array of page numbers with ellipsis for large page counts
    const getPageNumbers = () => {
        if (totalPages <= 1) return [1];
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

        const pages = [];
        const delta = 2; // Number of pages to show before and after current page

        // Always include first page
        pages.push(1);

        // Calculate range around current page
        let rangeStart = Math.max(2, currentPage - delta);
        let rangeEnd = Math.min(totalPages - 1, currentPage + delta);

        // Adjust range to ensure we show consistent number of pages
        if (rangeEnd - rangeStart < delta * 2) {
            if (currentPage - delta < 2) {
                // We're close to the start, extend end
                rangeEnd = Math.min(totalPages - 1, rangeStart + delta * 2);
            } else if (currentPage + delta > totalPages - 1) {
                // We're close to the end, extend start
                rangeStart = Math.max(2, rangeEnd - delta * 2);
            }
        }

        // Add ellipsis if needed before range
        if (rangeStart > 2) {
            pages.push('...');
        } else if (rangeStart === 2) {
            pages.push(2);
        }

        // Add pages in range
        for (let i = rangeStart + 1; i < rangeEnd; i++) {
            pages.push(i);
        }

        // Add ellipsis if needed after range
        if (rangeEnd < totalPages - 1) {
            pages.push('...');
        } else if (rangeEnd === totalPages - 1) {
            pages.push(totalPages - 1);
        }

        // Always include last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePageClick = (page: number) => {
        if (page === currentPage) return;

        if (onPageChange) {
            onPageChange(page);
        } else {
            const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}`;
            router.push(url);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center my-8">
            <button
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>

            {getPageNumbers().map((pageNumber, index) => (
                pageNumber === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-4 py-2 mx-1">...</span>
                ) : (
                    <button
                        key={`page-${pageNumber}`}
                        onClick={() => handlePageClick(pageNumber as number)}
                        className={`px-4 py-2 mx-1 rounded-md ${currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700'
                            }`}
                    >
                        {pageNumber}
                    </button>
                )
            ))}

            <button
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
} 