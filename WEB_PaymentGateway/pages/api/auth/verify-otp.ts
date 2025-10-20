// ===== pages/api/auth/verify-otp.ts =====
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ message: "User ID and OTP required" });
  }

  try {
    const user = await User.findById(userId).select("+otp +otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Check expiry
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(401).json({ message: "OTP expired" });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();

    // Generate token
    const token = signToken(user._id.toString(), "user", user.email);

    // Set cookie
    res.setHeader(
      "Set-Cookie",
      `user-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${
        7 * 24 * 60 * 60
      }`
    );

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
}
