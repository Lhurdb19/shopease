import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== "PUT")
    return res.status(405).json({ message: "Method Not Allowed" });

  const { id } = req.query;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required" });

  try {
    const order = await Order.findById(id).populate("user");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;

    // Update paymentStatus automatically
    if (status === "paid" || status === "cod_delivered") {
      order.paymentStatus = "paid";
    }

    await order.save();

    // Send notification to user
    await sendOrderNotification(order.user.email, order._id, status);

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}

// Example notification function
async function sendOrderNotification(email: string, orderId: string, status: string) {
  const messages: Record<string, string> = {
    pending: "Your order is received and pending confirmation.",
    paid: "Payment successful! Your order is confirmed.",
    processing: "Your order is being prepared.",
    shipping: "Your order is on the way!",
    delivered: "Your order has been delivered.",
    received: "Thank you for confirming delivery.",
    cod_pending: "Your COD order is awaiting confirmation.",
    cod_on_delivery: "Your COD order is on the way.",
    cod_delivered: "Your COD payment has been received.",
    cancelled: "Your order has been cancelled.",
  };

  const message = messages[status] || "Order status updated";

  // Example: you can replace this with actual email logic
  console.log(`NOTIFY ${email}: ${message} (Order #${orderId.slice(-6)})`);
}
