import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getSupabaseServerClient } from '@/shared/lib/supabase-server';
import SignOutButton from '@/shared/components/Auth/SignOutButton';
import Link from 'next/link';
import { db } from '@/shared/lib/db';

export const metadata: Metadata = {
    title: 'Admin Profile | BITEX',
    description: 'Manage your BITEX administrator profile',
};

export default async function ProfilePage() {
    const supabase = getSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Redirect to login if not authenticated
    if (!session) {
        redirect('/login?returnUrl=/profile');
    }

    try {
        // Get profile data using Prisma instead of Supabase
        const profile = await db.profile.findUnique({
            where: { id: session.user.id }
        });

        // Redirect to home if not admin
        if (!profile || profile.role !== 'ADMIN') {
            console.log(`User ${session.user.email} attempted to access profile but has role: ${profile?.role}`);
            redirect('/');
        }

        // Format date for display
        const formatDate = (dateString: string | null | undefined) => {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleString();
        };

        // Get user's account creation date
        const createdAt = formatDate(session.user?.created_at);
        const lastSignIn = formatDate(session.user.last_sign_in_at);

        return (
            <div className="max-w-4xl mx-auto p-6 mt-32">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {/* Header section */}
                    <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-8 py-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-white">Administrator Profile</h1>
                            <SignOutButton />
                        </div>
                        <p className="text-blue-100 mt-2">
                            Manage your BITEX store admin account
                        </p>
                    </div>

                    {/* Main content */}
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Account Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Admin Email</p>
                                        <p className="font-medium">{session.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">User ID</p>
                                        <p className="font-medium text-sm text-gray-800 break-all">{session.user.id}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Account Created</p>
                                        <p className="font-medium">{createdAt}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Last Sign In</p>
                                        <p className="font-medium">{lastSignIn}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Admin Status</h2>
                            <div className="bg-blue-50 rounded-md p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Account Role</p>
                                    <p className="text-gray-600">Administrator</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    Store Administrator
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link href="/admin" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                Go to Admin Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error in profile page:", error);
        redirect("/login?error=profile");
    }
} 