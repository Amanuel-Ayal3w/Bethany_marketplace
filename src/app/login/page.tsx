import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import LoginForm from '@/shared/components/Auth/LoginForm';
import { getSupabaseServerClient } from '@/shared/lib/supabase-server';

export const metadata: Metadata = {
    title: 'Admin Login | Bethany Marketplace',
    description: 'Admin access for Bethany Marketplace',
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Get return URL if available
    const returnUrl = typeof searchParams.returnUrl === 'string'
        ? searchParams.returnUrl
        : '/admin';

    // Check if user is already logged in
    const supabase = getSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // If already logged in, redirect to the return URL or admin dashboard
    if (session) {
        redirect(returnUrl);
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2">
            <div className="w-full max-w-md px-4">
                <h1 className="text-2xl font-bold text-center mb-2">Bethany Marketplace Admin</h1>
                <p className="text-gray-600 text-center mb-6">Administrator access only</p>
                <LoginForm returnUrl={returnUrl} />
            </div>
        </div>
    );
} 