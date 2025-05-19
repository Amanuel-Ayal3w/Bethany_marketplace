import Link from "next/link";
import { db } from "@/shared/lib/db";
import { StarIcon, ArrowIcon, ListIcon } from "@/shared/components/icons/svgIcons";

export const metadata = {
  title: "Admin Dashboard | Bethany Marketplace",
  description: "Administrator dashboard for the Bethany Marketplace"
};

// Custom icon components for admin dashboard
const BagIcon = ({ width = 12, className = "" }) => (
  <svg width={width} height={width} viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8H18C20.2091 8 22 9.79086 22 12V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18V12C2 9.79086 3.79086 8 6 8H8M16 8V6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6V8M16 8H8"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CategoryIcon = ({ width = 12, className = "" }) => (
  <svg width={width} height={width} viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3H3V10H10V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 3H14V10H21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 14H14V21H21V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 14H3V21H10V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrandIcon = ({ width = 12, className = "" }) => (
  <svg width={width} height={width} viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4H18V6H20V8H18V10H16V8H14V6H16V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 18V14H6V10.5C6 10.5 6 6 12 6V14L9 14V18H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 18H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CircleRightIcon = ({ width = 8, className = "" }) => (
  <svg width={width} height={width} viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AdminHome = async () => {
  // Get counts directly from Prisma
  const productsCount = await db.product.count();
  const categoriesCount = await db.category.count();
  const brandsCount = await db.brand.count();

  // Get latest page visits
  const recentVisits = await db.pageVisit.findMany({
    take: 5,
    orderBy: {
      time: 'desc'
    }
  });

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return 'N/A';
    return dateString.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dashboard cards */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:border-gray-600 hover:shadow-md">
          <Link href="/admin/products">
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="bg-blue-600 w-10 h-10 min-w-10 rounded-md mr-3 flex items-center justify-center">
                  <BagIcon width={16} className="stroke-white" />
                </div>
                <div>
                  <h2 className="text-xl font-normal text-blue-900 tracking-wide">Products</h2>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{productsCount}</p>
                </div>
              </div>
              <div className="size-7 rounded-md bg-gray-100 flex items-center justify-center">
                <CircleRightIcon width={8} className="stroke-gray-800" />
              </div>
            </div>
          </Link>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:border-gray-600 hover:shadow-md">
          <Link href="/admin/categories">
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="bg-red-600 w-10 h-10 min-w-10 rounded-md mr-3 flex items-center justify-center">
                  <CategoryIcon width={16} className="stroke-white" />
                </div>
                <div>
                  <h2 className="text-xl font-normal text-red-900 tracking-wide">Categories</h2>
                  <p className="text-2xl font-bold text-red-600 mt-1">{categoriesCount}</p>
                </div>
              </div>
              <div className="size-7 rounded-md bg-gray-100 flex items-center justify-center">
                <CircleRightIcon width={8} className="stroke-gray-800" />
              </div>
            </div>
          </Link>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:border-gray-600 hover:shadow-md">
          <Link href="/admin/brands">
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="bg-yellow-600 w-10 h-10 min-w-10 rounded-md mr-3 flex items-center justify-center">
                  <BrandIcon width={16} className="stroke-white" />
                </div>
                <div>
                  <h2 className="text-xl font-normal text-yellow-900 tracking-wide">Brands</h2>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{brandsCount}</p>
                </div>
              </div>
              <div className="size-7 rounded-md bg-gray-100 flex items-center justify-center">
                <CircleRightIcon width={8} className="stroke-gray-800" />
              </div>
            </div>
          </Link>
        </div>
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
    </div>
  );
};

export default AdminHome;
