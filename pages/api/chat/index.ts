// /pages/api/chat.ts

import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import ChatWidget from "@/models/ChatWidget";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    const { userId } = req.query;
    const messages = await ChatWidget.find({ userId }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  }

  if (req.method === "POST") {
    const { userId, from, message } = req.body;

    // Save user message
    await ChatWidget.create({ userId, from, message });

    // AUTO-BOT RESPONSE (simple logic)
    const botReply = getBotResponse(message);

    // Delay bot reply by 1.5 sec for realistic typing feel
    setTimeout(async () => {
      await ChatWidget.create({
        userId,
        from: "bot",
        message: botReply,
      });
    }, 1500);

    return res.status(201).json({ status: "sent" });
  }

  res.status(405).json({ error: "Method not allowed" });
}

// --- BASIC AI BOT LOGIC ---
function getBotResponse(msg: string) {
  msg = msg.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi"))
    return "Hello 👋! How can I help you today?";

  if (msg.includes("order"))
    return "You can check your orders under *My Orders* page. Want me to guide you?";

  if (msg.includes("refund"))
    return "Refunds are processed within 24–72 hours. Please provide your order ID.";

  if (msg.includes("payment"))
    return "We support card, bank transfer & USSD payments. Which one are you using?";

  return "I'm not sure I understood that 😊. Can you rephrase?";
}
