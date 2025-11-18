// import axios from "axios";
// import type { NextApiRequest, NextApiResponse } from "next";
// import { connectDB } from "@/lib/db";
// import Order from "@/models/Order";
// import Product from "@/models/Product";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

//   try {
//     await connectDB();

//     const { transaction_id, orderId } = req.body;

//     const verify = await axios.get(
//       `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
//         },
//       }
//     );

//     if (verify.data.status !== "success") {
//       return res.status(400).json({ message: "Verification failed" });
//     }

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     order.status = "paid";
//     order.paymentStatus = "paid";
//     await order.save();

//     // Deduct stock
//     for (const item of order.items) {
//       await Product.findByIdAndUpdate(item.product, {
//         $inc: { stock: -item.quantity },
//       });
//     }

//     return res.json({ success: true, message: "Payment Verified" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// }
