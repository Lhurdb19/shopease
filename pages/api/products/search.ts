import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  const query = String(req.query.q || "").trim();
  if (!query) return res.status(200).json([]);

  await connectDB();

  try {
    const products = await Product.find({
      active: true,
      title: { $regex: query, $options: "i" },
    })
      .select("title _id images price")
      .limit(8)
      .lean();

    return res.status(200).json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
