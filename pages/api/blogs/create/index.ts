// api/blog/create/index.ts

import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";
import { uploadBase64 } from "@/lib/cloudinary";
import { NextApiRequest, NextApiResponse } from "next";
import { create } from "domain";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  await connectDB();
  const { title, content, image, author } = req.body;

  try {
    const imageUrl = await uploadBase64(image, "mystore/blogs");
    const blog = await Blog.create({ title, content, image: imageUrl, author });
    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating blog", error });
  }
}
