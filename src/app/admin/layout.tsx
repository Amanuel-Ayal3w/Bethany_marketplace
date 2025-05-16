import { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminSidebar from "@/domains/admin/components/sideBar";
import { getSupabaseServerClient } from "@/shared/lib/supabase-server";

export const metadata: Metadata = {
  title: "Admin",
};

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  // Get session from Supabase Auth
  const supabase = getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // If not logged in, redirect to login page
  if (!session) {
    redirect("/login");
  }

  // You might want to add a role check here to make sure the user is an admin
  // For example:
  // const { data: profile } = await supabase
  //   .from('Profile')
  //   .select('role')
  //   .eq('id', session.user.id)
  //   .single();
  // 
  // if (!profile || profile.role !== 'ADMIN') {
  //   redirect('/');
  // }

  return (
    <div className="styles.adminLayout flex min-h-screen">
      <AdminSidebar />
      <div className="w-full p-6">
        <h1 className="w-full block text-gray-700 text-2xl font-light pb-5 mb-2 border-b border-gray-300">Page Name</h1>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
