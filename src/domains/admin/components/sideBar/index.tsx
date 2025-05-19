"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminSidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/admin";
  };

  const linkClass = (path: string) => {
    return `w-full block px-4 py-2 rounded-lg transition-colors duration-300 ${isActive(path)
      ? "bg-indigo-100 text-indigo-700 font-medium"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`;
  };

  return (
    <aside className="w-64 h-screen bg-white p-6 border-r border-gray-200 shadow-sm overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bethany Marketplace Admin</h2>
        <p className="text-sm text-gray-500">Store Management</p>
      </div>

      <nav className="space-y-1">
        <Link className={linkClass("/admin")} href="/admin">
          Dashboard
        </Link>

        <Link className={linkClass("/admin/products")} href="/admin/products">
          Products
        </Link>

        <Link className={linkClass("/admin/images")} href="/admin/images">
          Images
        </Link>

        <Link className={linkClass("/admin/categories")} href="/admin/categories">
          Categories
        </Link>

        <Link className={linkClass("/admin/brands")} href="/admin/brands">
          Brands
        </Link>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <p className="text-xs uppercase font-semibold text-gray-500 mb-2 px-4">Homepage Content</p>

          <Link className={linkClass("/admin/homepage-slider")} href="/admin/homepage-slider">
            Homepage Slider
          </Link>

          <Link className={linkClass("/admin/homepage-banners")} href="/admin/homepage-banners">
            Homepage Banners
          </Link>

          <Link className={linkClass("/admin/homepage-brands")} href="/admin/homepage-brands">
            Homepage Brands
          </Link>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <p className="text-xs uppercase font-semibold text-gray-500 mb-2 px-4">Analytics</p>

          <Link className={linkClass("/admin/trafficView")} href="/admin/trafficView/1">
            Traffic Analytics
          </Link>
        </div>
      </nav>

      <div className="pt-8 mt-8 border-t border-gray-200">
        <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
          Admin Profile
        </Link>

        <Link href="/" className="block mt-2 text-sm text-gray-600 hover:text-gray-900">
          View Store
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
