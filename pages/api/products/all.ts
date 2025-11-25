// pages/api/products/all.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

/**
 * Returns all active products for admin selects.
 * Response: array of product objects
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    await connectDB();
    const products = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();
    // Return minimal fields for the select (but full product is OK too)
    const simplified = products.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      images: p.images,
      category: p.category,
    }));
    return res.status(200).json(simplified);
  } catch (err) {
    console.error("GET /api/products/all error:", err);
    return res.status(500).json({ message: "Server error fetching products" });
  }
}
