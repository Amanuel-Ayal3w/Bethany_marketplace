import { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminSidebar from "@/domains/admin/components/sideBar";
import { getSupabaseServerClient } from "@/shared/lib/supabase-server";
import { db } from "@/shared/lib/db";

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
    // Get user profile to verify admin role
    const profile = await db.profile.findUnique({
      where: { id: session.user.id }
    });

    console.log(`Admin layout profile check for ${session.user.email}:`, profile);

    // Redirect non-admin users to home page
    if (!profile || profile.role !== 'ADMIN') {
      console.log(`User ${session.user.email} attempted to access admin but has role: ${profile?.role}`);
      redirect('/');
    }

    // Get admin email for display
    const adminEmail = session.user.email;

    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-800">Bethany Marketplace Admin</h1>
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{adminEmail}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
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
