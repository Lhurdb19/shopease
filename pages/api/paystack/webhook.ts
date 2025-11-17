import { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendOrderNotification } from "@/lib/mailer";

export const config = {
  api: {
    bodyParser: false, // Paystack sends raw body
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== "POST") return res.status(405).end();

  const buf = await buffer(req);
  const payload = buf.toString();
  const signature = req.headers["x-paystack-signature"] as string;

  // Verify signature
  const crypto = require("crypto");
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex");

  if (hash !== signature) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(payload);

  if (event.event === "charge.success") {
    const reference = event.data.reference;

    // Update order in DB
    const order = await Order.findOne({ reference });
    if (order) {
      order.status = "paid";
      order.paymentStatus = "paid";
      await order.save();

      // Send email notification
      await sendOrderNotification(order.shipping.email, order._id, order.status);
    }
  }

  res.status(200).send("Webhook received");
}
