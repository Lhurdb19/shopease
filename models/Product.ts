import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  images: {
    type: [String],
    required: true,
    default: [],
  };
  stock: { type: Number, required: true, default: 0 },
  category: string; // category now stored as a string
  createdBy: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true }, // simple string category
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
