import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Payment from "@/models/Payment";

type ReqItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};
const uid = () => Math.random().toString(36).slice(2, 8);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const XENDIT_SECRET = process.env.XENDIT_SECRET_KEY;
  if (!XENDIT_SECRET)
    return res.status(500).json({ message: "Missing XENDIT_SECRET_KEY" });

  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || `http://${req.headers.host}`;
  const successUrl =
    process.env.XENDIT_SUCCESS_URL || `${BASE_URL}/payment/success`;
  const failureUrl =
    process.env.XENDIT_FAILURE_URL || `${BASE_URL}/payment/failed`;

  const { email, items } = req.body as { email: string; items: ReqItem[] };
  if (!email || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: "Email and items are required" });

  await connectDB();

  // cek harga dari DB (anti manipulasi)
  const normalized = [];
  for (const it of items) {
    const p = await Product.findOne({ slug: it.slug });
    if (!p)
      return res.status(400).json({ message: `Product not found: ${it.slug}` });
    normalized.push({
      productId: String(p._id),
      slug: p.slug,
      name: p.name,
      price: p.price,
      qty: it.qty,
      image: it.image,
    });
  }

  const amount = normalized.reduce((s, i) => s + i.price * i.qty, 0);
  const externalId = `order_${Date.now()}_${uid()}`;

  const order = await Order.create({
    email,
    items: normalized,
    amount,
    currency: "IDR",
    status: "PENDING",
    externalId,
  });

  const auth = Buffer.from(`${XENDIT_SECRET}:`).toString("base64");
  const resp = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: externalId,
      amount,
      payer_email: email,
      description: `Order #${externalId}`,
      success_redirect_url: successUrl,
      failure_redirect_url: failureUrl,
      currency: "IDR",
      items: normalized.map((i) => ({
        name: i.name,
        quantity: i.qty,
        price: i.price,
        category: "Footwear",
        url: `${BASE_URL}/products/${i.slug}`,
      })),
    }),
  });

  const data = await resp.json();
  if (!resp.ok)
    return res.status(resp.status).json({
      message:
        data?.error || data?.message || "Failed to create Xendit invoice",
      details: data,
    });

  const invoiceId = data.id as string;
  const invoiceUrl = data.invoice_url as string;

  await Payment.create({
    orderId: order._id,
    invoiceId,
    externalId,
    amount,
    currency: "IDR",
    status: "PENDING",
    raw: data,
  });

  order.invoiceId = invoiceId;
  order.invoiceUrl = invoiceUrl;
  await order.save();

  return res.status(200).json({ invoiceUrl, invoiceId, externalId });
}
