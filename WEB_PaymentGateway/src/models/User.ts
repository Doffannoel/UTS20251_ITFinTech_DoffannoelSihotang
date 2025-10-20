import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  whatsapp: string;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  mfaEnabled: boolean;
  orders: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(v);
        },
        message: "Please enter a valid Indonesian phone number",
      },
    },
    whatsapp: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(v);
        },
        message: "Please enter a valid WhatsApp number",
      },
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    mfaEnabled: { type: Boolean, default: true },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    return false;
  }
};

// Format phone number to Indonesian format
userSchema.pre("save", function (next) {
  // Convert phone number to Indonesian format
  if (this.phone) {
    this.phone = this.phone.replace(/^0/, "62");
    this.phone = this.phone.replace(/^\+/, "");
  }
  if (this.whatsapp) {
    this.whatsapp = this.whatsapp.replace(/^0/, "62");
    this.whatsapp = this.whatsapp.replace(/^\+/, "");
  }
  next();
});

export default models.User || model<IUser>("User", userSchema);
