import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-callback-token");
    if (token !== process.env.XENDIT_CALLBACK_TOKEN) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const status = (body.status || "").toUpperCase();
    const invoiceId = body.id;
    const externalId = body.external_id;

    await connectDB();
    const order = await Order.findOne({ externalId });
    if (!order)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    let newStatus: "PENDING" | "PAID" | "EXPIRED" | "FAILED" = "PENDING";
    if (status === "PAID") newStatus = "PAID";
    else if (status === "EXPIRED") newStatus = "EXPIRED";
    else if (status === "FAILED") newStatus = "FAILED";

    await Order.updateOne({ _id: order._id }, { status: newStatus });
    await Payment.findOneAndUpdate(
      { invoiceId },
      { orderId: order._id, status: newStatus, raw: body },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
