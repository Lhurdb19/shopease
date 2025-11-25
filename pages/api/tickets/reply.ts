import Ticket from "@/models/Ticket";
import { connectDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  await connectDB();

  if (req.method !== "POST")
    return res.status(405).end();

  const { ticketId, message } = req.body;

  const ticket = await Ticket.findById(ticketId);
  
  ticket.replies.push({
    from: "admin",
    message,
  });

  ticket.status = "resolved";
  await ticket.save();

  return res.status(200).json(ticket);
}
