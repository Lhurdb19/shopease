import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "Missing product id" });

  try {
    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    return res.status(200).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
