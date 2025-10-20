import type { NextApiRequest, NextApiResponse } from "next";
import { verifyUserToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.cookies["user-token"];

  if (!token) {
    return res.status(200).json({ user: null });
  }

  const user = await verifyUserToken(token);

  if (!user) {
    return res.status(200).json({ user: null });
  }

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      whatsapp: user.whatsapp,
      isVerified: user.isVerified,
    },
  });
}
