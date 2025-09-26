import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();
  if (req.method === "GET") {
    const { slug } = req.query;
    if (slug) {
      const product = await Product.findOne({ slug: String(slug) });
      if (!product) return res.status(404).json({ message: "Not found" });
      return res.status(200).json({ product });
    }
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ products });
  }
  return res.status(405).json({ message: "Method not allowed" });
}
