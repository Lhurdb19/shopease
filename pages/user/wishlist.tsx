"use client";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/hooks/useCart";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Toaster, toast } from "sonner";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (loading) return <p className="flex justify-center mt-10">Loading wishlist...</p>;

  if (!wishlist?.length)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Heart size={60} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-6">
          Browse our products and save the ones you love.
        </p>
        <Link
          href="/products"
          className="text-blue-600 hover:text-blue-800 font-medium underline"
        >
          Browse Products
        </Link>
      </div>
    );

  // ✅ Add to cart logic (same as ProductPage)
  const handleAddToCart = async (product: any) => {
    try {
      if (product.stock <= 0) {
        toast.error("This product is out of stock.");
        return;
      }

      await addToCart.mutateAsync({ productId: product._id, quantity: 1 });
      toast.success(`${product.title} added to your cart 🛒`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="px-6 lg:px-25 xl:px-25 py-10 max-w-8xl mx-auto">
      <Toaster position="top-center" richColors />

      <h1 className="text-3xl font-bold mb-8 text-center">My Wishlist ❤️</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((item) => {
          const product = item.product || item; // Fallback for structure differences

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative w-full h-56">
                <Image
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="px-4 py-2">
                <h3 className="text-lg text-black font-semibold mb-2">{product.title}</h3>
                <p className="text-gray-600 font-medium mb-4">
                  ₦{product.price.toLocaleString()}
                </p>

                <div className="flex justify-between gap-2">
                  <Button
                    onClick={() => removeFromWishlist(product._id)}
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Remove
                  </Button>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    variant="default"
                    className="flex items-center gap-1 bg-green-600 hover:bg-blue-700 text-white"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
