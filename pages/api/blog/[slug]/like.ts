import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { slug } = req.query;

  if (typeof slug !== "string") return res.status(400).json({ message: "Invalid slug" });
  if (req.method !== "PATCH") return res.status(405).end("Method Not Allowed");

  const blog = await Blog.findOneAndUpdate({ slug }, { $inc: { likes: 1 } }, { new: true });
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  res.status(200).json(blog);
}
