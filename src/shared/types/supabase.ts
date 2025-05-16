import { Database } from '@/database.types';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient<Database>;

export interface SupabaseAuthState {
    isLoading: boolean;
    session: Session | null;
    user: User | null;
}

export interface SupabaseAuthContext extends SupabaseAuthState {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
}