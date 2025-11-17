import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendOrderNotification } from "@/lib/mailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  if (req.method !== "POST") return res.status(405).end();

  const { amount, reason, gateway } = req.body; // gateway: 'paystack' | 'flutterwave' | 'manual'
  if (!amount) return res.status(400).json({ message: "Refund amount required" });

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  // Mark refund requested/processing
  order.refund = {
    status: "processing",
    amount,
    reason,
    gateway: gateway || "manual",
  };

  await order.save();

  // If gateway refund requested, call provider API
  let gatewayResponse = null;
  try {
    if (gateway === "paystack") {
      // Paystack refund by transaction or charge id
      // If you have transaction id in order.reference or order.paymentReference
      const resp = await axios.post(
        "https://api.paystack.co/refund",
        { transaction: order.reference, amount: Math.round(amount) }, // amount in kobo for NGN? Paystack accepts amount in kobo
        {
          headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        }
      );
      gatewayResponse = resp.data;
    } else if (gateway === "flutterwave") {
      // Flutterwave refund example (adjust per their API)
      const resp = await axios.post(
        "https://api.flutterwave.com/v3/refunds",
        { transaction: order.reference, amount },
        { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
      );
      gatewayResponse = resp.data;
    }
    // If successful, update DB
    order.refund.status = "completed";
    order.refund.gatewayResponse = gatewayResponse;
    await order.save();

    // notify user via email
    await sendOrderNotification(order.shipping.email, order._id.toString(), "refund");
    return res.status(200).json({ message: "Refund processed", gatewayResponse, order });
  } catch (err: any) {
    console.error("REFUND ERROR:", err?.response?.data || err.message || err);
    // mark failed
    order.refund.status = "failed";
    order.refund.gatewayResponse = err?.response?.data || { error: err.message };
    await order.save();
    await sendOrderNotification(order.shipping.email, order._id.toString(), "refund_failed");
    return res.status(500).json({ message: "Refund failed", error: err?.response?.data || err.message });
  }
}
