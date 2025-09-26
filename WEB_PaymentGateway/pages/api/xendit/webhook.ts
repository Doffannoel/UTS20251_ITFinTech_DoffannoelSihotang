import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Order from "@/models/Order";

function isAuthorized(req: NextApiRequest) {
  const expected = process.env.XENDIT_CALLBACK_TOKEN;
  if (!expected) return true;
  const got =
    (req.headers["x-callback-token"] as string) ||
    (req.headers["X-Callback-Token"] as any);
  return got === expected;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });
  if (!isAuthorized(req))
    return res.status(401).json({ message: "Invalid callback token" });

  await connectDB();
  const body = req.body || {};
  const invoiceId: string | undefined = body.id || body.invoice_id;
  const externalId: string | undefined = body.external_id;
  const statusRaw: string = String(body.status || "").toUpperCase();
  if (!invoiceId && !externalId)
    return res
      .status(400)
      .json({ message: "Missing invoice id / external id" });

  const payment =
    (invoiceId && (await Payment.findOne({ invoiceId }))) ||
    (externalId && (await Payment.findOne({ externalId })));

  if (!payment)
    return res.status(200).json({ message: "No payment doc matched, ignored" });

  let orderStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" = "PENDING";
  if (statusRaw === "PAID" || statusRaw === "SETTLED") orderStatus = "PAID";
  else if (statusRaw === "EXPIRED") orderStatus = "EXPIRED";
  else if (statusRaw === "FAILED") orderStatus = "FAILED";

  payment.status = orderStatus;
  payment.paidAt = body.paid_at
    ? new Date(body.paid_at)
    : payment.paidAt || null;
  payment.failureCode = body.failure_code || null;
  payment.raw = body;
  await payment.save();

  const order = await Order.findById(payment.orderId);
  if (order) {
    order.status = orderStatus;
    await order.save();
  }

  return res.status(200).json({ ok: true });
}
