import mongoose, { Schema, models, model } from "mongoose";
import type { OrderStatus } from "./Order";

export interface IPayment {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  invoiceId: string;
  externalId: string;
  amount: number;
  currency: string;
  status: OrderStatus | "PENDING";
  paidAt?: Date | null;
  failureCode?: string | null;
  raw?: any;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    invoiceId: { type: String, required: true, index: true },
    externalId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "IDR" },
    status: { type: String, default: "PENDING" },
    paidAt: Date,
    failureCode: String,
    raw: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default models.Payment || model<IPayment>("Payment", PaymentSchema);
