"use client";
import { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaMoneyBillWave,
  FaBox,
  FaClock,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import AdminLayout from "./layout";
import { formatIDR } from "@/lib/format";

interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  totalProducts: number;
  lowStockProducts: number;
}

interface SalesData {
  _id: string;
  total: number;
  count: number;
}

interface RecentOrder {
  _id: string;
  externalId: string;
  email: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesChart, setSalesChart] = useState<SalesData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await res.json();
      setStats(data.stats);
      setSalesChart(data.salesChart || []);
      setRecentOrders(data.recentOrders || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    change,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    change?: { value: number; isPositive: boolean };
  }) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {change.isPositive ? (
                <FaArrowUp className="text-green-500 text-xs mr-1" />
              ) : (
                <FaArrowDown className="text-red-500 text-xs mr-1" />
              )}
              <span
                className={`text-xs font-medium ${
                  change.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(change.value)}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loader mx-auto">
            <div className="circle" />
            <div className="circle" />
            <div className="circle" />
            <div className="circle" />
          </div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome Back to Dashboard! 👋</h1>
          <p className="mt-2 opacity-90">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatIDR(stats?.totalRevenue || 0)}
            icon={<FaMoneyBillWave className="text-xl" />}
            color="bg-green-500"
            change={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={<FaShoppingCart className="text-xl" />}
            color="bg-blue-500"
            change={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            title="Pending Orders"
            value={stats?.pendingOrders || 0}
            icon={<FaClock className="text-xl" />}
            color="bg-yellow-500"
            change={{ value: 3.1, isPositive: false }}
          />
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={<FaBox className="text-xl" />}
            color="bg-purple-500"
            change={{ value: 5.0, isPositive: true }}
          />
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Revenue */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Revenue
            </h3>
            <div className="text-3xl font-bold text-green-600">
              {formatIDR(stats?.todayRevenue || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Updated at {new Date().toLocaleTimeString("id-ID")}
            </p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Revenue
            </h3>
            <div className="text-3xl font-bold text-blue-600">
              {formatIDR(stats?.monthlyRevenue || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {new Date().toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Overview (Last 7 Days)
          </h3>
          <div className="h-64 flex items-end justify-around">
            {salesChart.length > 0 ? (
              salesChart.map((item, index) => {
                const maxTotal = Math.max(...salesChart.map((s) => s.total));
                const heightPercent = (item.total / maxTotal) * 100;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 mx-1"
                  >
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {formatIDR(item.total)}
                    </div>
                    <div
                      className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors"
                      style={{ height: `${heightPercent}%`, minHeight: "20px" }}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(item._id).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                No sales data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.externalId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatIDR(order.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "EXPIRED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-900">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
