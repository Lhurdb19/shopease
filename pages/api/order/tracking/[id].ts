import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendOrderNotification } from "@/lib/mailer"; // sends email to user
import { sendSMS } from "@/lib/sms"; // sends SMS to user

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  if (req.method !== "PUT") return res.status(405).end();

  const { trackingNumber, trackingUrl } = req.body;
  if (!trackingNumber) return res.status(400).json({ message: "trackingNumber required" });

  const order = await Order.findByIdAndUpdate(
    id,
    { trackingNumber, trackingUrl },
    { new: true, runValidators: false }
  );

  if (!order) return res.status(404).json({ message: "Order not found" });

  // notify user by email
  try {
    await sendOrderNotification(order.shipping.email, order._id.toString(), "shipping");
    await sendSMS(order.shipping.phone, `Your order ${order._id} is now shipping. Tracking number: ${trackingNumber}`);
  } catch (e) {
    console.error("Failed send tracking email:", e);
  }

  return res.status(200).json({ message: "Tracking updated", order });
}
