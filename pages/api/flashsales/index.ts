// pages/api/flashsales.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import FlashSale from "@/models/FlashSale";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    if (req.method === "GET") {
      const adminMode = req.query.admin === "true";
      const now = new Date();

      // auto-disable expired (set active=false) to keep DB consistent
      await FlashSale.updateMany({ endTime: { $lt: now }, active: true }, { $set: { active: false } });

      if (adminMode) {
        // Return all sales, populated with product
        const sales = await FlashSale.find().sort({ createdAt: -1 }).lean();
        const populated = await Promise.all(
          sales.map(async (sale) => {
            const product = await Product.findById(sale.productId).lean();
            return { ...sale, product: product ? product : null };
          })
        );
        // Ensure date fields are strings for the client
        return res.status(200).json(
          populated.map((s) => ({
            ...s,
            startTime: s.startTime ? new Date(s.startTime).toISOString() : null,
            endTime: s.endTime ? new Date(s.endTime).toISOString() : null,
          }))
        );
      }

      // default: return currently active flash sales with transformed product info
      const flashSales = await FlashSale.find({
        active: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
      }).lean();

      const products = await Promise.all(
        flashSales.map(async (sale) => {
          const product = await Product.findById(sale.productId).lean();
          if (!product) return null;
          return {
            id: String(product._id),
            title: product.title,
            image: product.images?.[0] ?? "",
            price: sale.salePrice,
            oldPrice: product.price,
            discount: Math.round(((product.price - sale.salePrice) / product.price) * 100),
            endsAt: sale.endTime ? new Date(sale.endTime).toISOString() : null,
          };
        })
      );

      return res.status(200).json(products.filter(Boolean));
    }

    if (req.method === "POST") {
      const { productId, salePrice, startTime, endTime } = req.body;

      // Basic validation
      if (!productId || !salePrice || !startTime || !endTime) {
        return res.status(400).json({ message: "productId, salePrice, startTime and endTime are required" });
      }

      const sTime = new Date(startTime);
      const eTime = new Date(endTime);
      if (Number.isNaN(sTime.getTime()) || Number.isNaN(eTime.getTime())) {
        return res.status(400).json({ message: "Invalid startTime or endTime" });
      }
      if (sTime.getTime() >= eTime.getTime()) {
        return res.status(400).json({ message: "startTime must be before endTime" });
      }

      // fetch product and validate salePrice
      const product = await Product.findById(productId).lean();
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (Number(salePrice) <= 0 || Number(salePrice) >= product.price) {
        return res.status(400).json({ message: "salePrice must be > 0 and less than original product price" });
      }

      // Prevent overlapping sales for same product
      // Case: new sale [sTime, eTime] must not overlap any existing sale (active or upcoming)
      const overlapping = await FlashSale.findOne({
        productId,
        // overlap condition: existing.start <= new.end && existing.end >= new.start
        $expr: {
          $and: [
            { $lte: ["$startTime", eTime] },
            { $gte: ["$endTime", sTime] },
          ],
        },
      }).lean();

      if (overlapping) {
        return res.status(409).json({
          message:
            "This product already has a flash sale that overlaps with the selected time window. Please choose a different time.",
          overlapping,
        });
      }

      const newSale = await FlashSale.create({
        productId,
        salePrice: Number(salePrice),
        startTime: sTime,
        endTime: eTime,
        active: true,
      });

      // Return populated sale for immediate UI update
      const populatedProduct = await Product.findById(productId).lean();
      const payload = {
        ...newSale.toObject(),
        product: populatedProduct || null,
        startTime: newSale.startTime?.toISOString(),
        endTime: newSale.endTime?.toISOString(),
      };

      return res.status(201).json(payload);
    }

    if (req.method === "DELETE") {
      const { saleId } = req.body;
      if (!saleId) return res.status(400).json({ message: "saleId is required" });
      await FlashSale.findByIdAndDelete(saleId);
      return res.status(200).json({ success: true });
    }

    if (req.method === "PATCH") {
      const { saleId, active, startTime, endTime } = req.body;
      if (!saleId) return res.status(400).json({ message: "saleId is required" });
      const update: any = {};
      if (typeof active === "boolean") update.active = active;
      if (startTime) update.startTime = new Date(startTime);
      if (endTime) update.endTime = new Date(endTime);
      const updated = await FlashSale.findByIdAndUpdate(saleId, update, { new: true }).lean();
      return res.status(200).json(updated);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("flashsales handler error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
