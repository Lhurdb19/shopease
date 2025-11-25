// import mongoose, { Schema, Document, model, models } from "mongoose";

// export interface ITicket extends Document {
//   userId: string;
//   subject: string;
//   message: string;
//   status: "open" | "resolved";
//   replies: {
//     from: "user" | "admin";
//     message: string;
//     createdAt: Date;
//   }[];
// }

// const TicketSchema = new Schema<ITicket>(
//   {
//     userId: { type: String, required: true },
//     subject: { type: String, required: true },
//     message: { type: String, required: true },
//     status: { type: String, default: "open" },
//     replies: [
//       {
//         from: { type: String, enum: ["user", "admin"] },
//         message: String,
//         createdAt: { type: Date, default: Date.now }
//       }
//     ]
//   },
//   { timestamps: true }
// );

// export default models.Ticket || model<ITicket>("Ticket", TicketSchema);
