// Authentication utilities
import jwt from "jsonwebtoken";
import { connectDB } from "./mongodb";
import User from "@/models/User";
import Admin from "@/models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
  id: string;
  type: "user" | "admin";
  email: string;
}

/**
 * Generate JWT token
 */
export function signToken(
  id: string,
  type: "user" | "admin",
  email?: string
): string {
  return jwt.sign({ id, type, email } as TokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token
 */
export async function verifyToken(
  token: string | undefined,
  expectedType?: "user" | "admin"
): Promise<TokenPayload | null> {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Check if token type matches expected type
    if (expectedType && decoded.type !== expectedType) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify admin token and return admin data
 */
export async function verifyAdminToken(token: string | undefined) {
  if (!token) return null;

  try {
    const decoded = await verifyToken(token, "admin");
    if (!decoded) return null;

    await connectDB();
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !admin.isActive) return null;

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    return admin;
  } catch (error) {
    return null;
  }
}

/**
 * Verify user token and return user data
 */
export async function verifyUserToken(token: string | undefined) {
  if (!token) return null;

  try {
    const decoded = await verifyToken(token, "user");
    if (!decoded) return null;

    await connectDB();
    const user = await User.findById(decoded.id).select(
      "-password -otp -otpExpiry"
    );

    if (!user) return null;

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Generate random password for demo accounts
 */
export function generateRandomPassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indonesian phone number
 */
export function isValidIndonesianPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
