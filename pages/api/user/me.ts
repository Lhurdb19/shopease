// pages/api/users/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ msg: "Not authenticated" });

  try {
    const user = await User.findById(session.user.id).lean();
    if (!user) return res.status(404).json({ msg: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
}
