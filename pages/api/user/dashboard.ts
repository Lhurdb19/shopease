// pages/api/users/dashboard.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Order from "@/models/Order";
import Wishlist from "@/models/Wishlist";
import Notification from "@/models/Notification";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ msg: "Not authenticated" });

  try {
    const userId = session.user.id;

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ msg: "User not found" });

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalWishlist = await Wishlist.countDocuments({ user: userId });
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      user,
      totalOrders,
      totalWishlist,
      notifications,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}
