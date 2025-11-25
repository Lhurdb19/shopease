import mongoose, { Schema, Document, models, model, Types } from "mongoose";

export interface IReview {
  name: string;
  rating: number;
  message: string;
  date: Date;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
  createdBy: Types.ObjectId;
  active: boolean;
  reviews: IReview[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    active: { type: Boolean, default: true },
    reviews: { type: [ReviewSchema], default: [] },
  },
  { timestamps: true }
);

export default models.Product || model<IProduct>("Product", ProductSchema);
