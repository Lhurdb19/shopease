import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  content: string;
  image: string;
  category: string;
  author: string;
  views: number;
  likes: number;
  comments: {
    name: string;
    message: string;
    date: Date;
  }[];
  slug: string;
  externalUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    category: {
      type: String,
      enum: ["News", "Tips", "Announcements", "Tutorials", "Other"],
      default: "Other",
    },
    author: { type: String, default: "Admin" },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: {
      type: [
        {
          name: String,
          message: String,
          date: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    slug: { type: String, required: true, unique: true },
    externalUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Blog || model<IBlog>("Blog", BlogSchema);
