import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    const slug = (Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug)?.toLowerCase().trim();
    if (!slug) return res.status(400).json({ message: "Invalid slug" });

    const product = await Product.findOne({ slug: slug.toLowerCase() })
      .populate("createdBy", "name email")
      .lean();

    // console.log("Fetched product:", product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
    
  } catch (error) {
    console.error("SLUG API ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
