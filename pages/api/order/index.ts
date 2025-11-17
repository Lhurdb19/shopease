import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/user";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ========================
    // GET USER ORDERS
    // ========================
    if (req.method === "GET") {
      const orders = await Order.find({ user: user._id })
        .populate("items.product")
        .sort({ createdAt: -1 });

      return res.status(200).json(orders);
    }

    // ========================
    // CREATE ORDER
    // ========================
    if (req.method === "POST") {
      const { items, total, shipping, paymentMethod, reference } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ message: "Order items are required" });

      if (!total)
        return res.status(400).json({ message: "Order total is required" });

      if (!shipping?.name || !shipping?.email || !shipping?.phone || !shipping?.address)
        return res.status(400).json({ message: "Shipping details incomplete" });

      // 1️⃣ CHECK STOCK BEFORE ANY ORDER IS CREATED
      for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product)
          return res.status(404).json({ message: "Product not found" });

        if (product.stock < item.quantity)
          return res.status(400).json({
            message: `${product.title} has only ${product.stock} left in stock`,
          });
      }

      // 2️⃣ CREATE ORDER (pending, unpaid)
      const newOrder = await Order.create({
        user: user._id,
        items,
        total,
        shipping,
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod,
        reference: reference || null,
      });

      // 3️⃣ CASH ON DELIVERY IMMEDIATE STOCK DEDUCTION
      if (paymentMethod === "cod") {
        for (const item of items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        }

        await Order.findByIdAndUpdate(newOrder._id, {
          status: "processing",
          paymentStatus: "pending",
        });
      }

      return res.status(201).json({
        message: "Order created successfully",
        order: newOrder,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("ORDER API ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
