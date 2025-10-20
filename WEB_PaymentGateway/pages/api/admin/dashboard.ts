import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { verifyAdminToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Verify admin token
  const token = req.cookies["admin-token"];
  const admin = await verifyAdminToken(token);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await connectDB();

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "PENDING" });
    const paidOrders = await Order.countDocuments({ status: "PAID" });
    const expiredOrders = await Order.countDocuments({ status: "EXPIRED" });
    const failedOrders = await Order.countDocuments({ status: "FAILED" });

    // Get revenue statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const todayRevenue = await Payment.aggregate([
      {
        $match: {
          status: "PAID",
          paidAt: { $gte: today },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "PAID",
          paidAt: { $gte: thisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get sales chart data (last 7 days)
    const salesData = await Payment.aggregate([
      {
        $match: {
          status: "PAID",
          paidAt: { $gte: lastWeek },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$paidAt",
              timezone: "Asia/Jakarta",
            },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("externalId email amount status createdAt")
      .lean();

    // Get product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({
      isActive: { $ne: false },
    });

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    // Prepare response
    const stats = {
      totalOrders,
      pendingOrders,
      paidOrders,
      expiredOrders,
      failedOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalProducts,
      activeProducts,
      totalUsers,
      verifiedUsers,
    };

    return res.status(200).json({
      stats,
      salesChart: salesData,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
}
