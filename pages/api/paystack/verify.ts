import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  try {
    await connectDB();

    const { reference, orderId } = req.body;

    // Debug log
    console.log("REFERENCE:", reference);
    console.log("PAYSTACK_SECRET_KEY:", process.env.PAYSTACK_SECRET_KEY);

    const verify = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (verify.data.data.status !== "success") {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "paid";
    order.paymentStatus = "paid";
    await order.save();

    // Deduct stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    return res.json({ success: true, message: "Payment Verified" });
  } catch (error: any) {
    console.log("VERIFY ERROR:", error.response?.data || error);
    return res.status(500).json({ message: "Server Error" });
  }
}
