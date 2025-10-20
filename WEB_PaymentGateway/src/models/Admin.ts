import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "admin" | "staff";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "staff"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
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
adminSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    return false;
  }
};

// Virtual for display role
adminSchema.virtual("displayRole").get(function () {
  return this.role
    .replace("_", " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
});

export default models.Admin || model<IAdmin>("Admin", adminSchema);
