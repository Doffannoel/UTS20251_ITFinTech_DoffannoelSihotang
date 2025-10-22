import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyAdminToken } from "@/lib/auth";
import mongoose from "mongoose";
import { slugify } from "@/lib/slugify";

async function uniqueSlug(base: string, excludeId?: string) {
  let s = base;
  let i = 2;
  // hindari bentrok dgn dokumen lain
  // @ts-ignore
  // eslint-disable-next-line no-constant-condition
  while (await Product.findOne({ slug: s, _id: { $ne: excludeId } })) {
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

  const { id } = req.query;
  if (!id || typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  try {
    if (req.method === "GET") {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: "Not found" });
      return res.status(200).json({ product });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const update = req.body || {};

      // jika diminta auto ubah slug berdasarkan name baru
      if (update.autoFromName && update.name) {
        const base = slugify(String(update.name));
        update.slug = await uniqueSlug(base, id);
      }

      // kalau user memaksa kirim slug manual, tetap cek unik
      if (update.slug) {
        const dup = await Product.findOne({
          slug: update.slug,
          _id: { $ne: id },
        });
        if (dup) return res.status(409).json({ message: "Slug sudah dipakai" });
      }

      const product = await Product.findByIdAndUpdate(id, update, {
        new: true,
      });
      if (!product) return res.status(404).json({ message: "Not found" });
      return res.status(200).json({ product });
    }

    if (req.method === "DELETE") {
      const del = await Product.findByIdAndDelete(id);
      if (!del) return res.status(404).json({ message: "Not found" });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Internal error" });
  }
}
