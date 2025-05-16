'use client';

import React, { useState } from 'react';
import { useSupabaseAuth } from '@/shared/hooks/useSupabaseAuth';

interface SignOutButtonProps {
    className?: string;
}

export default function SignOutButton({ className = '' }: SignOutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { signOut } = useSupabaseAuth();

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut();
            // Router will handle the redirect via middleware
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isLoading}
            className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${className}`}
        >
            {isLoading ? 'Signing out...' : 'Sign out'}
        </button>
    );
} 