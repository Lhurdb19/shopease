import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { IncomingForm, File } from "formidable";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: { bodyParser: false },
};

// promisify formidable
const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: Record<string, File> }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files: any) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== "POST") return res.status(405).json({ msg: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ msg: "Not authenticated" });

  try {
    const { files } = await parseForm(req);
    const file: File | undefined = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;

    if (!file) return res.status(400).json({ msg: "No file uploaded" });

    const result = await cloudinary.v2.uploader.upload(file.filepath, {
      folder: "avatars",
      width: 500,
      height: 500,
      crop: "fill",
    });

    const user = await User.findById(session.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.avatar = result.secure_url;
    await user.save();

    return res.status(200).json({ success: true, avatar: user.avatar });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ msg: error.message || "Upload failed" });
  }
}
