'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useRecentSearches } from '@/shared/hooks/useRecentSearches';

type SuggestionType = {
    id: string;
    type: 'product' | 'category' | 'brand';
    name: string;
    image?: string;
    url: string;
};

type SearchAutocompleteProps = {
    placeholder?: string;
    className?: string;
    initialValue?: string;
    onSearch?: (query: string) => void;
};

/**
 * A search autocomplete component that shows suggestions as the user types
 */
export default function SearchAutocomplete({
    placeholder = 'Search products...',
    className = '',
    initialValue = '',
    onSearch,
}: SearchAutocompleteProps) {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<SuggestionType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const suggestionRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { recentSearches, addSearch } = useRecentSearches();

    // Fetch suggestions when the debounced query changes
    useEffect(() => {
        async function fetchSuggestions() {
            if (debouncedQuery.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data.suggestions || []);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSuggestions();
    }, [debouncedQuery]);

    // Handle click outside to close suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle search submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (query.trim()) {
            if (onSearch) {
                onSearch(query.trim());
            } else {
                // Navigate to search page
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }

            // Add to recent searches
            addSearch(query.trim());

            // Close suggestions
            setShowSuggestions(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: SuggestionType) => {
        // Navigate to the URL
        router.push(suggestion.url);

        // Add to recent searches if it's a text search
        if (suggestion.type === 'product') {
            addSearch(suggestion.name);
        }

        // Close suggestions
        setShowSuggestions(false);
    };

    // Handle recent search click
    const handleRecentSearchClick = (searchTerm: string) => {
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
        setShowSuggestions(false);
    };

    return (
        <div className={`relative w-full ${className}`} ref={suggestionRef}>
            <form onSubmit={handleSubmit} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full h-11 rounded-lg text-gray-700 border border-gray-300 pl-12 pr-4 focus:outline-none focus:border-gray-500"
                />
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
            </form>

            {showSuggestions && (query.length > 1 || recentSearches.length > 0) && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto border border-gray-200">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && query.length < 2 && (
                        <div className="p-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((searchTerm, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleRecentSearchClick(searchTerm)}
                                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
                                    >
                                        {searchTerm}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {isLoading && query.length >= 2 && (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-pulse flex space-x-4">
                                <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {!isLoading && suggestions.length > 0 && (
                        <div>
                            {suggestions.map((suggestion) => (
                                <button
                                    key={`${suggestion.type}-${suggestion.id}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="flex items-center w-full p-3 hover:bg-gray-50 transition-colors text-left"
                                >
                                    {suggestion.image && (
                                        <div className="w-10 h-10 mr-3 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                                            <Image
                                                src={suggestion.image}
                                                alt={suggestion.name}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-grow">
                                        <div className="text-sm font-medium text-gray-900">{suggestion.name}</div>
                                        <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
                                    </div>
                                </button>
                            ))}

                            <div className="p-2 border-t border-gray-100">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-2 text-sm text-blue-600 hover:underline text-center"
                                >
                                    See all results for "{query}"
                                </button>
                            </div>
                        </div>
                    )}

                    {/* No suggestions */}
                    {!isLoading && query.length >= 2 && suggestions.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                            No suggestions found for "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 