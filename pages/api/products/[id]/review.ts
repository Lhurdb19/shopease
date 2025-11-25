import Product from "@/models/Product";
import { connectDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ msg: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    /**
     * =========================================
     *                GET REVIEWS
     * =========================================
     */
    if (req.method === "GET") {
      const page = parseInt((req.query.page as string) || "1");
      const limit = parseInt((req.query.limit as string) || "5");
      const start = (page - 1) * limit;

      const reviews = product.reviews || [];
      const totalReviews = reviews.length;

      const paginatedReviews = reviews.slice(start, start + limit);

      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) /
          totalReviews
          : 0;

      return res.json({
        reviews: paginatedReviews,
        totalReviews,
        averageRating,
        page,
        totalPages: Math.ceil(totalReviews / limit),
      });
    }

    /**
     * =========================================
     *                POST REVIEW
     * =========================================
     */
    if (req.method === "POST") {
      const { name, rating, message } = req.body;

      if (!name || !message || rating == null)
        return res.status(400).json({ msg: "Fill all fields" });

      const newReview = {
        _id: new Date().getTime().toString(), // unique local ID
        name,
        rating: Number(rating),
        message,
        date: new Date(),
      };

      // Fix: ensure reviews array exists
      product.reviews = product.reviews || [];
      product.reviews.unshift(newReview);

      await product.save();

      return res.status(201).json({
        review: newReview,
        msg: "Review saved successfully",
      });
    }


    /**
     * =========================================
     *                UPDATE REVIEW
     * =========================================
     */
    if (req.method === "PUT") {
      const { reviewId, rating, message } = req.body;

      const index = product.reviews.findIndex((r: any) => r._id == reviewId);
      if (index === -1) return res.status(404).json({ msg: "Review not found" });

      product.reviews[index].rating = rating;
      product.reviews[index].message = message;

      await product.save();
      return res.json({ msg: "Review updated" });
    }

    /**
     * =========================================
     *                DELETE REVIEW
     * =========================================
     */
    if (req.method === "DELETE") {
      const { reviewId } = req.body;

      product.reviews = product.reviews.filter((r: any) => r._id != reviewId);
      await product.save();

      return res.json({ msg: "Review deleted" });
    }

    return res.status(405).json({ msg: "Method Not Allowed" });
  } catch (err) {
    console.error("Review Error:", err);
    return res.status(500).json({ msg: "Server Error" });
  }
}
