import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendThankYouEmail } from "@/lib/mailer";
import { sendSMS } from "@/lib/sms";
import { sendWhatsApp } from "@/lib/whatsapp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== "PUT") return res.status(405).end();

  const { id } = req.query;
  const { status, trackingNumber, trackingUrl } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;

  // Ensure history is an array
  if (!order.history) order.history = [];

  order.history.push({
    status: "shipping",
    message: `Tracking number assigned: ${trackingNumber}`,
    timestamp: new Date(),
  });
  await order.save();



  await order.save();

  try {
    let update: any = { status };

    // update payment status when needed
    if (status === "paid") update.paymentStatus = "paid";
    if (status === "cancelled") update.paymentStatus = "failed";

    const updatedOrder = await Order.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: false, // important fix!!
    });

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    // email notifications
    if (["shipped", "delivered"].includes(status)) {
      await sendThankYouEmail(updatedOrder.shipping.email, updatedOrder._id.toString());
    }

    // SMS Notification
    await sendSMS(order.shipping.phone, `Your order ${order._id} is now ${status}.`);

    // WhatsApp Notification
    await sendWhatsApp(order.shipping.phone, `Your order ${order._id} is now ${status}.`);

    return res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("UPDATE ORDER ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
