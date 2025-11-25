import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  await connectDB();

  try {
    // Ensure slug is always a string
    const slugStr = Array.isArray(slug) ? slug[0] : slug;

    const product = await Product.findOne({ slug: slugStr })
      .populate("createdBy", "name email")
      .lean();

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ product });
  } catch (err) {
    console.error("Product fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
