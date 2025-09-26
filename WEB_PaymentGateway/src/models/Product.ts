import mongoose, { Schema, model, models } from "mongoose";

const shipmentSchema = new Schema(
  {
    title: String,
    description: String,
    icon: String, // simpan string nama icon (misal "percent", "calendar")
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    previousPrice: {
      type: Number,
      default: function (this: any) {
        return this.price * 1.15;
      },
    },
    image: { type: String }, // cover
    images: [{ type: String }], // galeri (shots)
    category: String,
    overview: String,
    shipment_details: [shipmentSchema],
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    pieces_sold: { type: Number, default: 0 },
    justIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Product || model("Product", productSchema);
