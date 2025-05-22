import { Metadata } from "next";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from 'next/dynamic';

// Dynamically import the form with no SSR
const CreateUserForm = dynamic(() => import('@/app/admin/users/create-user-form'), { ssr: false });

export const metadata: Metadata = {
    title: "Admin - User Management",
    description: "Manage users for Bethany Marketplace"
};

export default async function AdminUsersPage() {
    const supabase = createServerComponentClient({ cookies });

    try {
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            redirect('/login?returnUrl=/admin/users');
        }

        // Check if user is an admin using a direct auth check
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error('Error getting user:', userError);
            throw new Error('Error checking user authentication');
        }

        // List of admin emails (this is a simple approach)
        // In a production environment, you should use a proper role-based system
        const adminEmails = [
            'amanuelayalew983@gmail.com',
            'amanuel.ayalew@aait.edu.et'  // Added your email from the logs
        ];

        if (!adminEmails.includes(user?.email || '')) {
            redirect('/admin');
        }

        // Attempt to get all user profiles from Supabase, but handle errors gracefully
        let allUsers: { id: string; email: string; role: string }[] = [];

        try {
            // Try to get all profiles from the database
            const { data: userProfiles, error: profilesError } = await supabase
                .from('Profile')
                .select('id, role');

            if (!profilesError && userProfiles) {
                // Transform the data for display
                allUsers = userProfiles.map(profile => ({
                    id: profile.id,
                    role: profile.role,
                    email: profile.id.substring(0, 8) + '...' // Just display a portion of the ID
                }));
            } else {
                console.error('Error fetching user profiles:', profilesError);
            }
        } catch (error) {
            console.error('Error fetching user profiles:', error);
            // Continue with empty users list
        }

        // Add the current user to the list if they're not already included
        if (user && adminEmails.includes(user.email || '') && !allUsers.some(u => u.id === user.id)) {
            allUsers.push({
                id: user.id,
                role: 'ADMIN',
                email: user.email || 'Unknown email'
            });
        }

        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">User Management</h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Create New User</h2>
                    <CreateUserForm />
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">All Users</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email / ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.role}
                                        </td>
                                    </tr>
                                ))}

                                {!allUsers.length && (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error in admin users page:', error);
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">User Management</h1>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>Error loading users. Please try again later.</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Create New User</h2>
                    <CreateUserForm />
                </div>
            </div>
        );
    }
} 