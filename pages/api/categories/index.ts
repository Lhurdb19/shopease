import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    // Get all unique categories with their IDs
    const products = await Product.find({ active: true }).select("category").lean();
    const categoryMap: Record<string, string> = {};

    products.forEach(p => {
      if (p.category && !categoryMap[p.category]) {
        categoryMap[p.category] = p.category;
      }
    });

    // Convert to array of { id, name } objects
    const categories = Object.keys(categoryMap).map(name => ({
      id: name, // or _id if you have a separate Category model
      name,
    }));

    res.status(200).json({ categories });
  } catch (err: any) {
    console.error("Error loading categories:", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
}
