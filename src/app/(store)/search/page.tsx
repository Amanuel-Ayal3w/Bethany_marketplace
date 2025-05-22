'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import SearchBar from '@/shared/components/UI/SearchBar';
import Pagination from '@/shared/components/UI/Pagination';
import ProductCard from '@/domains/product/components/productCard';
import { TProductCard } from '@/shared/types/common';
import { useRecentSearches } from '@/shared/hooks/useRecentSearches';

type SearchResult = {
    id: string;
    name: string;
    images: string[];
    price: number;
    salePrice: number | null;
    isAvailable: boolean;
    specialFeatures: string[];
    brand: {
        id: string;
        name: string;
    };
    category: {
        id: string;
        name: string;
    };
};

type PaginationInfo = {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('category') || '';
    const brandId = searchParams.get('brand') || '';
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;

    const [isLoading, setIsLoading] = useState(true);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        pageSize: 12,
        hasNextPage: false,
        hasPrevPage: false,
    });

    // Initialize recent searches hook
    const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

    useEffect(() => {
        async function fetchSearchResults() {
            if (!query && !categoryId && !brandId) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Build search URL with all parameters
                let searchUrl = `/api/search?page=${page}&limit=12`;
                if (query) searchUrl += `&q=${encodeURIComponent(query)}`;
                if (categoryId) searchUrl += `&category=${encodeURIComponent(categoryId)}`;
                if (brandId) searchUrl += `&brand=${encodeURIComponent(brandId)}`;

                const response = await fetch(searchUrl);
                if (!response.ok) throw new Error('Search failed');

                const data = await response.json();

                setResults(data.products || []);
                setPagination(data.pagination || pagination);

                // Add to recent searches if it's a text search
                if (query) {
                    addSearch(query);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSearchResults();
    }, [query, categoryId, brandId, page, pagination, addSearch]);

    // Helper function to convert API results to ProductCard format
    const mapToProductCard = (product: SearchResult): TProductCard => {
        return {
            name: product.name,
            isAvailable: product.isAvailable,
            specs: product.specialFeatures.slice(0, 3),
            price: product.price,
            dealPrice: product.salePrice || undefined,
            imgUrl: [product.images[0] || '', product.images[1] || product.images[0] || ''],
            url: `/product/${product.id}`,
        };
    };

    // Handle search submission
    const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Handle recent search click
    const handleRecentSearchClick = (searchQuery: string) => {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    };

    // Build the base URL for pagination without the page parameter
    const getBaseUrl = () => {
        let url = '/search?';
        if (query) url += `q=${encodeURIComponent(query)}&`;
        if (categoryId) url += `category=${encodeURIComponent(categoryId)}&`;
        if (brandId) url += `brand=${encodeURIComponent(brandId)}&`;
        return url;
    };

    return (
        <div className="pt-28 pb-20">
            <div className="storeContainer mb-8">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <SearchBar
                        initialValue={query}
                        placeholder="Search products, brands and more..."
                        className="max-w-3xl mx-auto"
                        onSearch={handleSearch}
                    />

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && !query && (
                        <div className="max-w-3xl mx-auto mt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
                                <button
                                    onClick={clearSearches}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {recentSearches.map((searchTerm, index) => (
                                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                        <button
                                            onClick={() => handleRecentSearchClick(searchTerm)}
                                            className="text-sm text-gray-700 mr-1"
                                        >
                                            {searchTerm}
                                        </button>
                                        <button
                                            onClick={() => removeSearch(searchTerm)}
                                            className="text-gray-400 hover:text-gray-600"
                                            aria-label="Remove search"
                                        >
                                            <span className="text-xs">×</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {(query || categoryId || brandId) && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-medium text-gray-800">
                            {pagination.totalItems} results
                            {query && ` for "${query}"`}
                            {categoryId && ` in category "${categoryId}"`}
                            {brandId && ` from brand "${brandId}"`}
                        </h1>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-wrap gap-4 mt-7 ml-2 mb-[400px]">
                        {Array(12).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-[420px] w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)]"></div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.map((product) => (
                                <ProductCard key={product.id} {...mapToProductCard(product)} />
                            ))}
                        </div>

                        {pagination.totalPages > 1 && (
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                baseUrl={getBaseUrl()}
                            />
                        )}
                    </>
                ) : (query || categoryId || brandId) ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <Image
                            src="/icons/searchIcon.svg"
                            alt="No results found"
                            width={120}
                            height={120}
                            className="mb-6 opacity-70"
                        />
                        <h2 className="text-xl font-medium mb-2">No results found</h2>
                        <p className="text-gray-500 mb-8">
                            Try adjusting your search terms or filters
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Continue Shopping
                            </Link>
                            <button
                                onClick={() => window.history.back()}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-16 text-center text-gray-500">
                        Start by typing a search term above
                    </div>
                )}
            </div>
        </div>
    );
} 