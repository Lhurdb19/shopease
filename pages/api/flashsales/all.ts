import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import FlashSale from "@/models/FlashSale";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  const sales = await FlashSale.find().sort({ createdAt: -1 });

  const populated = await Promise.all(
    sales.map(async (sale) => {
      const product = await Product.findById(sale.productId);
      return { ...sale.toObject(), product };
    })
  );

  return res.status(200).json(populated);
}
