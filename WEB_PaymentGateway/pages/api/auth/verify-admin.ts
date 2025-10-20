import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.cookies["admin-token"];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const admin = await verifyAdminToken(token);

  if (!admin) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  return res.status(200).json({
    success: true,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
}
