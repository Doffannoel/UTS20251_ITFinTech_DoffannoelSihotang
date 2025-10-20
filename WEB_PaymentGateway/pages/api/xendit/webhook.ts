import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendPaymentSuccessNotification } from "@/lib/whatsapp";

function isAuthorized(req: NextApiRequest) {
  const expected = process.env.XENDIT_CALLBACK_TOKEN;
  if (!expected) return false;
  const got = req.headers["x-callback-token"] as string;
  return got === expected;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ message: "Invalid callback token" });
  }

  await connectDB();
  const body = req.body || {};

  const invoiceId: string | undefined = body.id || body.invoice_id;
  const externalId: string | undefined = body.external_id;
  const statusRaw: string = String(body.status || "").toUpperCase();

  if (!invoiceId && !externalId) {
    return res
      .status(400)
      .json({ message: "Missing invoice id / external id" });
  }

  // Find payment record
  const payment =
    (invoiceId && (await Payment.findOne({ invoiceId }))) ||
    (externalId && (await Payment.findOne({ externalId })));

  if (!payment) {
    return res.status(200).json({ message: "No payment doc matched, ignored" });
  }

  // Determine order status
  let orderStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" = "PENDING";
  if (statusRaw === "PAID" || statusRaw === "SETTLED") orderStatus = "PAID";
  else if (statusRaw === "EXPIRED") orderStatus = "EXPIRED";
  else if (statusRaw === "FAILED") orderStatus = "FAILED";

  // Update payment record
  payment.status = orderStatus;
  payment.paidAt = body.paid_at
    ? new Date(body.paid_at)
    : payment.paidAt || null;
  payment.failureCode = body.failure_code || null;
  payment.raw = body;
  await payment.save();

  // Update order record
  const order = await Order.findById(payment.orderId);
  if (order) {
    order.status = orderStatus;
    await order.save();

    // Send WhatsApp notification for successful payment
    if (orderStatus === "PAID") {
      try {
        // Find user by email from order
        const user = await User.findOne({ email: order.email });

        if (user && user.whatsapp) {
          // Prepare order data for notification
          const orderData = {
            externalId: order.externalId,
            amount: order.amount,
            paidAt: payment.paidAt || new Date(),
            items: order.items.map((item: any) => ({
              name: item.name,
              qty: item.qty,
            })),
          };

          // Send WhatsApp notification
          await sendPaymentSuccessNotification(user.whatsapp, orderData);
          console.log(`Payment success notification sent to ${user.whatsapp}`);
        } else {
          // If user not found or no WhatsApp, try to extract phone from order metadata
          // You might store phone number in order for guest checkouts
          if (body.payer_email) {
            console.log(`No WhatsApp found for order ${order.externalId}`);
          }
        }
      } catch (error) {
        console.error("Failed to send WhatsApp notification:", error);
        // Don't fail the webhook if notification fails
      }
    }
  }

  return res.status(200).json({ ok: true });
}
