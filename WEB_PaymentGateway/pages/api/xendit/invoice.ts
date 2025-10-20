import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { sendOrderNotification } from "@/lib/whatsapp";
import { verifyUserToken } from "@/lib/auth";

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

  const { email, items, phone } = req.body as {
    email: string;
    items: ReqItem[];
    phone?: string; // Optional phone for guest checkout
  };

  if (!email || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: "Email and items are required" });

  await connectDB();

  // Check if user is logged in
  const token = req.cookies["user-token"];
  let user = null;
  let userPhone = phone;

  if (token) {
    user = await verifyUserToken(token);
    if (user) {
      // Use user's registered WhatsApp number
      userPhone = user.whatsapp || user.phone;
    }
  }

  // Verify product prices from DB (anti manipulation)
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
      image: it.image || p.image,
    });
  }

  const amount = normalized.reduce((s, i) => s + i.price * i.qty, 0);
  const externalId = `order_${Date.now()}_${uid()}`;

  // Create order
  const order = await Order.create({
    email,
    userId: user?._id || null, // Link to user if logged in
    items: normalized,
    amount,
    currency: "IDR",
    status: "PENDING",
    externalId,
    phone: userPhone, // Store phone for notifications
  });

  // Add order to user's order history if logged in
  if (user) {
    user.orders.push(order._id);
    await user.save();
  }

  // Create Xendit invoice
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
      customer: {
        given_names: user?.name || "Guest",
        email: email,
        mobile_number: userPhone ? `+${userPhone}` : undefined,
      },
      // Invoice expires in 24 hours
      invoice_duration: 86400,
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

  // Create payment record
  await Payment.create({
    orderId: order._id,
    invoiceId,
    externalId,
    amount,
    currency: "IDR",
    status: "PENDING",
    raw: data,
  });

  // Update order with invoice details
  order.invoiceId = invoiceId;
  order.invoiceUrl = invoiceUrl;
  await order.save();

  // Send WhatsApp notification if phone number available
  if (userPhone) {
    try {
      const orderData = {
        externalId,
        amount,
        status: "PENDING",
        invoiceUrl,
        items: normalized.map((i) => ({
          name: i.name,
          qty: i.qty,
          price: i.price,
        })),
      };

      await sendOrderNotification(userPhone, orderData);
      console.log(`Order notification sent to ${userPhone}`);
    } catch (error) {
      console.error("Failed to send WhatsApp notification:", error);
      // Don't fail the request if notification fails
    }
  }

  return res.status(200).json({
    invoiceUrl,
    invoiceId,
    externalId,
    message: userPhone
      ? "Invoice created. Check your WhatsApp for details!"
      : "Invoice created successfully!",
  });
}
