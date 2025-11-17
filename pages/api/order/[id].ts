// pages/api/order/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) return res.status(401).json({ message: "Unauthorized" });

  const order = await Order.findById(id).populate("items.product");
  if (!order) return res.status(404).json({ message: "Order not found" });

  res.status(200).json({ order });
}
