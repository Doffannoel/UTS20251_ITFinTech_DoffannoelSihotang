import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Clear both user and admin tokens
  res.setHeader("Set-Cookie", [
    `user-token=; Path=/; HttpOnly; Max-Age=0`,
    `admin-token=; Path=/; HttpOnly; Max-Age=0`,
  ]);

  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
}
