// pages/api/users/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { getSession } from "next-auth/react";
import bcrypt from "bcryptjs";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== "PUT") return res.status(405).json({ msg: "Method not allowed" });

//   const session = await getSession({ req });
const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ msg: "Not authenticated" });

  const { name, phone, address, password } = req.body;

  try {
    const user = await User.findById(session.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name) user.name = name;
    if (phone) user.meta = { ...user.meta, phone };
    if (address) user.meta = { ...user.meta, address };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    return res.status(200).json({ success: true, msg: "Profile updated", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}
