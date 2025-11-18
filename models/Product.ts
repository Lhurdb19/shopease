import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
  createdBy: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // 🔥 FIXES PRODUCTION INDEX ISSUES
      trim: true,
      index: true,
    },

    description: { type: String },

    price: { type: Number, required: true },

    images: {
      type: [String],
      required: true,
      default: [],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    category: {
      type: String,
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ CRITICAL FIX FOR VERCEL
export default models.Product || model<IProduct>("Product", ProductSchema);
