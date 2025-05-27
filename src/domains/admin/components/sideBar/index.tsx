"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const AdminSidebar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu toggle button - only visible on small screens */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md border border-gray-200"
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar - hidden on mobile unless toggled */}
      <aside
        className={`${isMobileView
          ? isMobileMenuOpen
            ? "translate-x-0 fixed z-40"
            : "-translate-x-full fixed z-40"
          : "translate-x-0 relative"
          } w-64 h-screen bg-white p-6 border-r border-gray-200 shadow-sm overflow-y-auto transition-transform duration-300 ease-in-out`}
      >
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bethany Marketplace Admin</h2>
          <p className="text-sm text-gray-500">Store Management</p>
        </div>

        <nav className="space-y-1">
          <Link className={linkClass("/admin")} href="/admin" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
            Dashboard
          </Link>

          <Link className={linkClass("/admin/products")} href="/admin/products" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
            Products
          </Link>

          <Link className={linkClass("/admin/images")} href="/admin/images" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
            Images
          </Link>

          <Link className={linkClass("/admin/categories")} href="/admin/categories" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
            Categories
          </Link>

          <Link className={linkClass("/admin/brands")} href="/admin/brands" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
            Brands
          </Link>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs uppercase font-semibold text-gray-500 mb-2 px-4">Homepage Content</p>

            <Link className={linkClass("/admin/homepage-slider")} href="/admin/homepage-slider" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
              Homepage Slider
            </Link>

            <Link className={linkClass("/admin/homepage-banners")} href="/admin/homepage-banners" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
              Homepage Banners
            </Link>

            <Link className={linkClass("/admin/homepage-brands")} href="/admin/homepage-brands" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
              Homepage Brands
            </Link>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs uppercase font-semibold text-gray-500 mb-2 px-4">Analytics</p>

            <Link className={linkClass("/admin/trafficView")} href="/admin/trafficView/1" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
              Traffic Analytics
            </Link>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs uppercase font-semibold text-gray-500 mb-2 px-4">Configuration</p>

            <Link className={linkClass("/admin/settings")} href="/admin/settings" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
              Site Settings
            </Link>

            <Link className={linkClass("/admin/footer")} href="/admin/footer" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
              Footer Settings
            </Link>

            <Link className={linkClass("/admin/users")} href="/admin/users" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
              User Management
            </Link>

            <Link className={linkClass("/admin/contact")} href="/admin/contact" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
              Contact Settings
            </Link>
          </div>
        </nav>

        <div className="pt-8 mt-8 border-t border-gray-200">
          <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
            Admin Profile
          </Link>

          <Link href="/" className="block mt-2 text-sm text-gray-600 hover:text-gray-900" onClick={() => isMobileView && setIsMobileMenuOpen(false)}>
            View Store
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileView && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
