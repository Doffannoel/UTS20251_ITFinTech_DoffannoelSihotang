"use client";
import { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Assuming there's an API endpoint for analytics, e.g., /api/admin/analytics
      // For now, using placeholder data or dashboard data
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      } else {
        // Placeholder data if API not available
        setAnalyticsData({
          totalSales: 125000,
          totalOrders: 450,
          totalCustomers: 320,
          salesData: [
            { month: "Jan", sales: 12000 },
            { month: "Feb", sales: 15000 },
            { month: "Mar", sales: 18000 },
            { month: "Apr", sales: 22000 },
            { month: "May", sales: 25000 },
            { month: "Jun", sales: 28000 },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setAnalyticsData({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        salesData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loader">
            <div className="circle" />
            <div className="circle" />
            <div className="circle" />
            <div className="circle" />
          </div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Sales</h3>
          <p className="text-2xl font-bold text-green-600">
            Rp {analyticsData?.totalSales?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-600">
            {analyticsData?.totalOrders || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Customers</h3>
          <p className="text-2xl font-bold text-purple-600">
            {analyticsData?.totalCustomers || 0}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chart component would be rendered here
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Analytics</h3>
        <p className="text-gray-600">More detailed analytics can be added here.</p>
      </div>
    </div>
  );
}
