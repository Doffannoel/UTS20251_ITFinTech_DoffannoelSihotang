import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

// Demo admin accounts
const demoAdmins = [
  {
    name: "Super Admin",
    email: "superadmin@hotkicks.com",
    password: "SuperAdmin123!",
    role: "super_admin",
  },
  {
    name: "Admin Demo",
    email: "admin@hotkicks.com",
    password: "Admin123!",
    role: "admin",
  },
  {
    name: "Staff Demo",
    email: "staff@hotkicks.com",
    password: "Staff123!",
    role: "staff",
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development mode
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      message: "This endpoint is only available in development mode",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    // Check if admins already exist
    const existingAdmins = await Admin.countDocuments();
    if (existingAdmins > 0) {
      return res.status(400).json({
        message: "Admin accounts already exist",
        info: "Use the following credentials to login:",
        credentials: demoAdmins.map((admin) => ({
          email: admin.email,
          password: admin.password,
          role: admin.role,
        })),
      });
    }

    // Create admin accounts
    const createdAdmins = [];
    for (const adminData of demoAdmins) {
      const admin = await Admin.create(adminData);
      createdAdmins.push({
        name: admin.name,
        email: admin.email,
        role: admin.role,
        password: adminData.password, // Return plain password for demo purposes
      });
    }

    return res.status(200).json({
      message: "Admin accounts created successfully",
      admins: createdAdmins,
      note: "Save these credentials! Passwords are hashed in the database.",
    });
  } catch (error: any) {
    console.error("Seed admin error:", error);
    return res.status(500).json({
      message: "Failed to create admin accounts",
      error: error.message,
    });
  }
}
