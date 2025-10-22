import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyAdminToken } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

async function uniqueSlug(base: string) {
  let s = base;
  let i = 2;
  while (await Product.findOne({ slug: s })) {
    s = `${base}-${i++}`;
  }
  return s;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const token = req.cookies["admin-token"];
  const admin = await verifyAdminToken(token);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const products = await Product.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ products });
    }

    if (req.method === "POST") {
      const {
        name,
        price, // wajib
        image,
        images = [],
        category,
        overview,
        shipment_details = [],
        justIn = false,
        previousPrice,
        rating,
        reviews,
        pieces_sold,
      } = req.body || {};

      if (!name || price == null) {
        return res.status(400).json({ message: "name dan price wajib" });
      }

      const base = slugify(String(name));
      const slug = await uniqueSlug(base);

      const doc = await Product.create({
        name,
        slug, // auto
        price,
        image,
        images,
        category,
        overview,
        shipment_details,
        justIn,
        previousPrice,
        rating,
        reviews,
        pieces_sold,
      });

      return res.status(201).json({ product: doc });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Internal error" });
  }
}
