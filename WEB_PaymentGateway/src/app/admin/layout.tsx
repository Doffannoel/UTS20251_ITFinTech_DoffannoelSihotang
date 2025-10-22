"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaPlus,
  FaClipboardList,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const res = await fetch("/api/auth/verify-admin", {
        credentials: "include",
      });

      if (!res.ok) {
        router.push("/login/admin");
        return;
      }

      const data = await res.json();
      setAdminData(data.admin);
    } catch (error) {
      router.push("/login/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <MdDashboard className="text-xl" />,
      color: "text-blue-500",
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: <FaBox className="text-xl" />,
      color: "text-purple-500",
      subItems: [
        {
          label: "All Products",
          href: "/admin/products",
          icon: <FaClipboardList className="text-sm" />,
        },
        {
          label: "Add Product",
          href: "/admin/products/add",
          icon: <FaPlus className="text-sm" />,
        },
      ],
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: <FaChartBar className="text-xl" />,
      color: "text-red-500",
    },
    // {
    //   label: "Orders",
    //   href: "/admin/orders",
    //   icon: <FaShoppingCart className="text-xl" />,
    //   color: "text-green-500",
    // },
    // {
    //   label: "Customers",
    //   href: "/admin/customers",
    //   icon: <FaUsers className="text-xl" />,
    //   color: "text-yellow-500",
    // },
    // {
    //   label: "Settings",
    //   href: "/admin/settings",
    //   icon: <FaCog className="text-xl" />,
    //   color: "text-gray-500",
    // },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="loader">
            <div className="circle" />
            <div className="circle" />
            <div className="circle" />
            <div className="circle" />
          </div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gray-800">
            <Link href="/admin" className="flex items-center">
              <div className="text-2xl font-bold text-white">
                HotKicks <span className="text-red-500">Admin</span>
              </div>
            </Link>
          </div>

          {/* Admin Info */}
          <div className="px-4 py-6 border-b border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                {adminData?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {adminData?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {adminData?.role?.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? "bg-white text-gray-900 font-semibold shadow"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span className={`mr-3 ${item.color}`}>{item.icon}</span>
                  {item.label}
                </Link>

                {/* Sub Items */}
                {item.subItems && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                          pathname === subItem.href
                            ? "bg-gray-700 text-white"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        <span className="mr-2">{subItem.icon}</span>
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="px-2 py-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
            >
              <FaSignOutAlt className="mr-3 text-xl text-red-500" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold text-gray-900">
                {pathname === "/admin" && "Dashboard Overview"}
                {pathname === "/admin/products" && "Product Management"}
                {pathname === "/admin/products/add" && "Add New Product"}
                {pathname === "/admin/analytics" && "Analytics & Reports"}
              </h1>

              <div className="flex items-center space-x-4">
                {/* Quick Actions */}
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>

                <Link
                  href="/"
                  target="_blank"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  View Store
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-hidden">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="px-4 py-3 text-center text-sm text-gray-500">
            © 2024 HotKicks Admin. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
