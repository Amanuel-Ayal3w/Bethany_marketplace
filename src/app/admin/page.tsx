import Link from "next/link";
import { getSupabaseServerClient } from "@/shared/lib/supabase-server";

export const metadata = {
  title: "Admin Dashboard | BITEX",
  description: "Administrator dashboard for the BITEX marketplace"
};

const AdminHome = async () => {
  const supabase = getSupabaseServerClient();

  // Get some basic stats
  const { count: productsCount } = await supabase
    .from('Product')
    .select('*', { count: 'exact', head: true });

  const { count: categoriesCount } = await supabase
    .from('Category')
    .select('*', { count: 'exact', head: true });

  const { count: brandsCount } = await supabase
    .from('Brand')
    .select('*', { count: 'exact', head: true });

  // Get latest page visits
  const { data: recentVisits } = await supabase
    .from('PageVisit')
    .select('*')
    .order('time', { ascending: false })
    .limit(5);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dashboard cards */}
        <DashboardCard
          title="Products"
          value={productsCount || 0}
          icon="📦"
          linkTo="/admin/products"
        />

        <DashboardCard
          title="Categories"
          value={categoriesCount || 0}
          icon="🗂️"
          linkTo="/admin/categories"
        />

        <DashboardCard
          title="Brands"
          value={brandsCount || 0}
          icon="🏷️"
          linkTo="/admin/brands"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Recent Page Visits</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentVisits && recentVisits.length > 0 ? (
                recentVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.pagePath || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.pageType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(visit.time)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.deviceResolution || 'Unknown'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No recent visits found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickActionLink href="/admin/products" text="Add New Product" />
            <QuickActionLink href="/admin/categories" text="Manage Categories" />
            <QuickActionLink href="/admin/brands" text="Manage Brands" />
            <QuickActionLink href="/admin/trafficView/1" text="View Traffic Analytics" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Admin Help</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Use the sidebar to navigate between different sections</li>
            <li>You can add, edit, and delete products from the Products section</li>
            <li>Manage your store categories and brands from their respective sections</li>
            <li>View site traffic analytics in the Traffic View section</li>
            <li>Your profile settings can be accessed from the top right menu</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper components
const DashboardCard = ({ title, value, icon, linkTo }: { title: string, value: number, icon: string, linkTo: string }) => (
  <Link href={linkTo} className="block">
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  </Link>
);

const QuickActionLink = ({ href, text }: { href: string, text: string }) => (
  <Link href={href}>
    <div className="p-3 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center">
      <span className="text-sm font-medium">{text}</span>
      <svg className="ml-auto w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </div>
  </Link>
);

export default AdminHome;
