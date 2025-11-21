//blog/[slug].ts

import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const blog = await Blog.findById(id);
      if (!blog) return res.status(404).json({ message: "Blog not found" });
      return res.status(200).json(blog);
    }

    if (req.method === "PATCH") {
      const blog = await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
      return res.status(200).json(blog);
    }

    if (req.method === "PUT") {
      const { category } = req.body;
      const updated = await Blog.findByIdAndUpdate(id, { category }, { new: true });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await Blog.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted successfully" });
    }

    res.setHeader("Allow", ["GET", "PATCH", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
