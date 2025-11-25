import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { categoryId, limit, exclude } = req.query;
  const max = parseInt(limit as string) || 8;

  if (!categoryId) return res.status(400).json({ message: "Category ID is required" });

  try {
    await connectDB();
    const products = await Product.find({
      active: true,
      category: categoryId,
      _id: { $ne: exclude },
    })
      .limit(max)
      .select("title images price category")
      .lean();

    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching similar products" });
  }
}
