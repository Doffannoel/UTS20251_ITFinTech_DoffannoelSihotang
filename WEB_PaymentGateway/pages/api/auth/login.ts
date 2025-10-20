// ===== pages/api/auth/login.ts =====
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { sendWhatsAppOTP, generateOTP } from "@/lib/whatsapp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    // Find user with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If MFA is enabled, send OTP
    if (user.mfaEnabled && user.whatsapp) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save();

      // Send OTP via WhatsApp
      await sendWhatsAppOTP(user.whatsapp, otp);

      return res.status(200).json({
        requiresMFA: true,
        userId: user._id,
        message: "OTP sent to your WhatsApp",
      });
    }

    // Generate token if no MFA
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
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
}
