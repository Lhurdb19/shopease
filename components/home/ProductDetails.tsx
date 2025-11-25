"use client";

import type { IProduct } from "@/models/Product";
import Image from "next/image";
import ThumbnailSlider from "./thumbnailslider";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSession } from "next-auth/react";
import ReviewSection from "./ReviewSection";

export default function ProductDetails({ product }: { product: IProduct }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { data: session } = useSession();

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({
        productId: String(product._id),
        quantity: 1,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleWishlist = async () => {
    if (!session) return (window.location.href = "/auth/login");

    if (isInWishlist(String(product._id)))
      await removeFromWishlist(String(product._id));
    else await addToWishlist(product);
  };

  return (
    <div className="bg-white rounded-2xl py-2 w-8xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Images */}
        <div>
          <ThumbnailSlider images={product.images ?? []} />
        </div>

        {/* Text Section */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
          <p className="text-sm text-gray-500">{product.category}</p>

          <div className="text-2xl font-extrabold text-green-700 mt-4">
            ₦{Number(product.price).toLocaleString()}
          </div>

          <div
            className="prose max-w-none mt-4 text-gray-700"
            dangerouslySetInnerHTML={{
              __html: product.description || "<p>No description</p>",
            }}
          />

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              className="bg-green-600 text-white py-2 px-4 rounded-lg"
            >
              Add to cart
            </button>

            <button
              onClick={handleWishlist}
              className="py-2 px-4 border rounded-lg"
            >
              {isInWishlist(String(product._id))
                ? "Remove wishlist"
                : "Add to wishlist"}
            </button>
          </div>

          {/* Reviews */}
          <div className="mt-6">
            <ReviewSection _id={String(product._id)} />
          </div>
        </div>
      </div>
    </div>
  );
}
