import mongoose, { Schema, models, model } from "mongoose";

export type OrderStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  slug: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  email: string;
  items: IOrderItem[];
  amount: number;
  currency: string;
  status: OrderStatus;
  externalId: string;
  invoiceId?: string;
  invoiceUrl?: string;
  userId?: mongoose.Types.ObjectId;
  phone?: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: String,
    name: String,
    price: Number,
    qty: Number,
    image: String,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    email: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "IDR" },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "EXPIRED", "FAILED"],
      default: "PENDING",
    },
    externalId: { type: String, required: true, unique: true, index: true },
    invoiceId: String,
    invoiceUrl: String,
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // NEW
    phone: String, // NEW - untuk notifikasi WA
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>("Order", OrderSchema);
