import { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminSidebar from "@/domains/admin/components/sideBar";
import { getSupabaseServerClient } from "@/shared/lib/supabase-server";

export const metadata: Metadata = {
  title: " Admin Dashboard",
  description: "Administrator control panel for Bethany Marketplace"
};

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  // Get session from Supabase Auth
  const supabase = getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // If not logged in, redirect to login page
  if (!session) {
    redirect("/login?returnUrl=/admin");
  }

  try {
    // Get user email
    const userEmail = session.user.email || '';
    console.log(`Admin layout profile check for ${userEmail}`);

    // List of admin emails
    const adminEmails = [
      'amanuelayalew983@gmail.com',
      'amanuel.ayalew@aait.edu.et'  // Added your email from the logs
    ];

    // Check if user is in admin list
    const isAdmin = adminEmails.includes(userEmail);

    // Try to get the profile from Supabase as a backup check
    let profileIsAdmin = false;
    try {
      const { data: profile } = await supabase
        .from('Profile')
        .select('role')
        .eq('id', session.user.id)
        .single();

      profileIsAdmin = profile?.role === 'ADMIN';
      console.log(`Profile role check:`, profile);
    } catch (err) {
      console.log('Could not check profile, using email list only');
    }

    // Redirect non-admin users to home page
    if (!isAdmin && !profileIsAdmin) {
      console.log(`User ${userEmail} attempted to access admin but is not in admin list`);
      redirect('/');
    }

    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0 mt-10 lg:mt-0">Bethany Marketplace Admin</h1>
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{userEmail}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 pt-16 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    redirect("/login?error=permission");
  }
};

export default AdminLayout;
