import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendWelcomeMessage } from "@/lib/whatsapp";
import { isValidEmail, isValidIndonesianPhone } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  const { name, email, password, phone, whatsapp } = req.body;

  // Validation
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!isValidIndonesianPhone(phone)) {
    return res.status(400).json({ message: "Invalid Indonesian phone number" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      whatsapp: whatsapp || phone,
      mfaEnabled: true, // Enable MFA by default
    });

    // Send welcome message via WhatsApp
    if (user.whatsapp) {
      await sendWelcomeMessage(user.whatsapp, user.name);
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful! Check your WhatsApp for welcome message.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({ message: "Registration failed" });
  }
}
