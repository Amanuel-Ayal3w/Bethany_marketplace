'use client';

import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../lib/supabase-browser';
import type { SupabaseAuthContext, SupabaseAuthState } from '../types/supabase';
import { createUserProfile, ensureUserProfile } from '@/actions/auth/profileActions';

const INITIAL_STATE: SupabaseAuthState = {
    isLoading: true,
    session: null,
    user: null,
};

const AuthContext = createContext<SupabaseAuthContext>({
    ...INITIAL_STATE,
    signIn: async () => { },
    signUp: async () => { return { user: null, session: null } },
    signOut: async () => { },
    resetPassword: async () => { },
    updatePassword: async () => { },
});

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<SupabaseAuthState>(INITIAL_STATE);
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    // Initialize the auth state
    useEffect(() => {
        const initializeAuth = async () => {
            const { data } = await supabase.auth.getSession();

            if (data.session) {
                setState({
                    isLoading: false,
                    session: data.session,
                    user: data.session.user,
                });
            } else {
                setState({
                    isLoading: false,
                    session: null,
                    user: null,
                });
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: AuthChangeEvent, session: Session | null) => {
                if (session) {
                    setState({
                        isLoading: false,
                        session,
                        user: session.user,
                    });
                } else {
                    setState({
                        isLoading: false,
                        session: null,
                        user: null,
                    });
                }
                // Refresh the page to update the UI when auth state changes
                router.refresh();
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [router, supabase]);

    // Auth methods
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            console.log('Starting signup process for email:', email);

            // First attempt Supabase Auth signup
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            console.log('Signup response:', { data: data ? 'exists' : 'null', error: error?.message });

            if (error) {
                throw new Error(`Error creating user account: ${error.message}`);
            }

            // If signup was successful but we want to ensure profile creation
            if (data?.user) {
                // Try to ensure the profile exists
                console.log('Signup successful, ensuring profile exists for user ID:', data.user.id);
                const profileResult = await ensureUserProfile(data.user.id);

                if (profileResult.error) {
                    console.warn('Profile may not have been created properly:', profileResult.error);
                    // We don't throw here because the auth account was created successfully
                    // The profile can be fixed later
                }
            }

            return data;
        } catch (error) {
            console.error('Detailed signup error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(error.message);
        }
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            throw new Error(error.message);
        }
    };

    const updatePassword = async (password: string) => {
        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            throw new Error(error.message);
        }
    };

    const value = {
        ...state,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useSupabaseAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
    }

    return context;
}; 