import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IChatMessage extends Document {
  userId: string;
  from: "user" | "admin" | "bot";
  message: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: { type: String, required: true },
    from: { type: String, enum: ["user", "admin", "bot"], required: true },
    message: { type: String, required: true }
  },
  { timestamps: true }
);

export default models.ChatMessage || model<IChatMessage>("ChatMessage", ChatMessageSchema);
