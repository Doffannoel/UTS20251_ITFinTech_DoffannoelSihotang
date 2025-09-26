import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Payment from "@/models/Payment";

function basicAuth(secret: string) {
  return "Basic " + Buffer.from(`${secret}:`).toString("base64");
}

export async function POST(req: Request) {
  try {
    const { email, items } = await req.json();

    if (!email || !items?.length) {
      return NextResponse.json(
        { message: "Email/items kosong" },
        { status: 400 }
      );
    }

    await connectDB();

    // validasi harga dari DB
    const dbProducts = await Product.find({
      slug: { $in: items.map((i: any) => i.slug) },
    }).lean();
    const withPrice = items.map((i: any) => {
      const p = dbProducts.find((d) => d.slug === i.slug);
      return { ...i, price: p?.price ?? i.price };
    });
    const amount = withPrice.reduce(
      (s: number, i: any) => s + i.price * i.qty,
      0
    );

    const externalId = `order_${Date.now()}`;
    const order = await Order.create({
      externalId,
      email,
      items: withPrice,
      amount,
      status: "PENDING",
    });

    const payload = {
      external_id: order.externalId,
      amount,
      payer_email: email,
      items: withPrice.map((i: any) => ({
        name: i.name,
        quantity: i.qty,
        price: i.price,
        category: "Footwear",
      })),
      currency: "IDR",
      success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
      metadata: { orderId: String(order._id) },
    };

    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization: basicAuth(process.env.XENDIT_SECRET_KEY!),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Xendit error");

    await Order.updateOne(
      { _id: order._id },
      { invoiceId: data.id, invoiceUrl: data.invoice_url }
    );
    await Payment.create({
      orderId: order._id,
      invoiceId: data.id,
      status: "PENDING",
    });

    return NextResponse.json({ invoiceUrl: data.invoice_url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
