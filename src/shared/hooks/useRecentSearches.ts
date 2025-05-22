import { useState, useEffect } from 'react';

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'bethany_recent_searches';

/**
 * A hook to manage recent searches with localStorage persistence
 * @returns An object with recent searches and methods to manage them
 */
export function useRecentSearches() {
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Load recent searches from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setRecentSearches(JSON.parse(saved));
                }
            } catch (error) {
                console.error('Error loading recent searches:', error);
            }
        }
    }, []);

    /**
     * Add a search term to recent searches
     * @param query The search term to add
     */
    const addSearch = (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        setRecentSearches(prev => {
            // Remove if already exists
            const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());

            // Add to beginning and limit length
            const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            }

            return updated;
        });
    };

    /**
     * Clear all recent searches
     */
    const clearSearches = () => {
        setRecentSearches([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    /**
     * Remove a specific search term
     * @param query The search term to remove
     */
    const removeSearch = (query: string) => {
        setRecentSearches(prev => {
            const updated = prev.filter(item => item !== query);

            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            }

            return updated;
        });
    };

    return {
        recentSearches,
        addSearch,
        clearSearches,
        removeSearch
    };
} 