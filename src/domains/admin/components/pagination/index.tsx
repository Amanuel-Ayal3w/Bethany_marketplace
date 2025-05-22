import React from 'react';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
};

const AdminPagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className={`flex justify-center items-center mt-8 ${className}`}>
            <nav className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, and pages around current page
                    if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                        return (
                            <button
                                key={pageNumber}
                                onClick={() => onPageChange(pageNumber)}
                                className={`px-4 py-2 rounded-md ${currentPage === pageNumber
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-gray-300 text-gray-700"
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        );
                    } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                    ) {
                        return <span key={pageNumber} className="px-2">...</span>;
                    }
                    return null;
                })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </nav>
        </div>
    );
};

export default AdminPagination; 