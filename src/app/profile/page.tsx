import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getSupabaseServerClient } from '@/shared/lib/supabase-server';
import SignOutButton from '@/shared/components/Auth/SignOutButton';

export const metadata: Metadata = {
    title: 'Profile | BITEX',
    description: 'Manage your BITEX profile',
};

export default async function ProfilePage() {
    const supabase = getSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Redirect to login if not authenticated
    if (!session) {
        redirect('/login');
    }

    // Get profile data
    const { data: profile } = await supabase
        .from('profile')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white shadow-md rounded-lg p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Your Profile</h1>
                    <SignOutButton />
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">User Information</h2>
                        <div className="mt-2 p-4 bg-gray-50 rounded-md">
                            <p><span className="font-medium">Email:</span> {session.user.email}</p>
                            <p><span className="font-medium">User ID:</span> {session.user.id}</p>
                            <p><span className="font-medium">Role:</span> {profile?.role || 'User'}</p>
                            <p><span className="font-medium">Last Sign In:</span> {new Date(session.user.last_sign_in_at || '').toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 