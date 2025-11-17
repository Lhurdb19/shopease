// import { NextApiRequest, NextApiResponse } from "next";
// import PDFDocument from "pdfkit";
// import { connectDB } from "@/lib/db";
// import Order from "@/models/Order";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   await connectDB();
//   const { id } = req.query;
//   const order = await Order.findById(id).populate("items.product");
//   if (!order) return res.status(404).json({ message: "Order not found" });

//   // Set headers
//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", `attachment; filename=receipt_${order._id}.pdf`);

//   const doc = new PDFDocument({ margin: 30 });
//   doc.pipe(res);

//   // Header
//   doc.fontSize(20).text("ShopEase - Receipt", { align: "center" });
//   doc.moveDown();

//   doc.fontSize(12).text(`Order ID: ${order._id}`);
//   doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
//   doc.text(`Customer: ${order.shipping.name} (${order.shipping.email})`);
//   doc.moveDown();

//   // Items
//   doc.fontSize(14).text("Items:");
//   order.items.forEach((it: any) => {
//     const name = it.product?.name || "Product";
//     doc.fontSize(12).text(`${name} x ${it.quantity} — ₦${(it.price * it.quantity).toLocaleString()}`);
//   });

//   doc.moveDown();
//   doc.fontSize(12).text(`Total: ₦${order.total.toLocaleString()}`);
//   doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`);

//   doc.moveDown();
//   doc.fontSize(10).text("Thank you for shopping with ShopEase.", { align: "center" });

//   doc.end();
// }
