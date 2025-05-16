import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import AuthTabs from '@/shared/components/Auth/AuthTabs';
import { getSupabaseServerClient } from '@/shared/lib/supabase-server';

export const metadata: Metadata = {
    title: 'Login | BITEX',
    description: 'Login to your BITEX account',
};

export default async function LoginPage() {
    // Check if user is already logged in
    const supabase = getSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // If already logged in, redirect to dashboard
    if (session) {
        redirect('/');
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2">
            <div className="w-full max-w-md px-4">
                <h1 className="text-2xl font-bold text-center mb-6">Welcome to BITEX</h1>
                <AuthTabs />
            </div>
        </div>
    );
} 