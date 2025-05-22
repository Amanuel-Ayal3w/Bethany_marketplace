'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDebounce } from '@/shared/hooks/useDebounce';

type SearchBarProps = {
    placeholder?: string;
    onSearch?: (query: string) => void;
    className?: string;
    initialValue?: string;
    showIcon?: boolean;
    autoSubmit?: boolean;
};

/**
 * A reusable search bar component
 */
export default function SearchBar({
    placeholder = 'Search products...',
    onSearch,
    className = '',
    initialValue = '',
    showIcon = true,
    autoSubmit = false,
}: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const router = useRouter();
    const debouncedQuery = useDebounce(query, 500);

    // If autoSubmit is true, call onSearch when the debounced query changes
    if (autoSubmit && onSearch) {
        // We're using this side effect pattern instead of useEffect to avoid stale closures
        if (debouncedQuery) {
            onSearch(debouncedQuery);
        }
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (query.trim()) {
            if (onSearch) {
                onSearch(query.trim());
            } else {
                // Navigate to search page if no onSearch callback is provided
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full h-11 rounded-lg text-gray-700 border border-gray-300 focus:border-gray-500 pl-12 pr-4 outline-none"
            />
            {showIcon && (
                <button
                    type="submit"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    aria-label="Search"
                >
                    <Image
                        src="/icons/searchIcon.svg"
                        width={16}
                        height={16}
                        alt="Search"
                        className="text-gray-400"
                    />
                </button>
            )}
        </form>
    );
} 