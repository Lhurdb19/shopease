import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import User from "@/models/user"; // ✅ added

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    // ✅ get the current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ GET - fetch user's cart
    if (req.method === "GET") {
      const cart = await Cart.findOne({ user: user._id }).populate("items.product");
      return res.status(200).json(cart || { items: [] });
    }

    // ✅ PUT - add or update product in cart
    if (req.method === "PUT") {
      const { productId, quantity, setExact } = req.body;
      if (!productId || quantity == null)
        return res.status(400).json({ message: "Product ID and quantity required" });

      let cart = await Cart.findOne({ user: user._id });
      if (!cart) {
        cart = new Cart({ user: user._id, items: [] });
      }

      const existingItem = cart.items.find(
        (item: { product: any }) => item.product.toString() === productId
      );

      if (existingItem) {
        if (setExact) {
          existingItem.quantity = quantity;
        } else {
          existingItem.quantity += quantity;
        }
      } else {
        // ✅ Add new product if not in cart
        cart.items.push({ product: productId, quantity });
      }

      // Remove any invalid items
      cart.items = cart.items.filter((item: { quantity: number }) => item.quantity > 0);

      await cart.save();
      const populatedCart = await cart.populate("items.product");
      return res.status(200).json(populatedCart);
    }

    // DELETE /api/cart?productId=xxx  -> remove single item
    if (req.method === "DELETE" && req.query.productId) {
      const { productId } = req.query;

      const cart = await Cart.findOne({ user: user._id });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      cart.items = cart.items.filter(
        (item: any) => item.product.toString() !== productId
      );

      await cart.save();
      const updatedCart = await cart.populate("items.product");
      return res.status(200).json(updatedCart);
    }

    // DELETE /api/cart - clear entire cart
    if (req.method === "DELETE" && req.query.clear === "all") {
      const cart = await Cart.findOne({ user: user._id });
      if (!cart) return res.status(404).json({ message: "Cart not found" });
      cart.items = [];
      await cart.save();
      return res.status(200).json({ items: [] });
    }


    // ❌ anything else
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Cart API Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
