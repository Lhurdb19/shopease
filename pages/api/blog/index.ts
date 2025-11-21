import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(blogs);
  }

  if (req.method === "POST") {
    const { title, content, slug, image, category, author, externalUrl } = req.body;
    if (!title || !content || !slug) return res.status(400).json({ message: "Missing fields" });

    const existing = await Blog.findOne({ slug });
    if (existing) return res.status(400).json({ message: "Slug exists" });

    const blog = await Blog.create({ title, content, slug, image, category, author, externalUrl });
    return res.status(201).json(blog);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
