"use client";

import Image from "next/image";
import type { IProduct } from "@/types/product";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ProductCardProps {
  product?: IProduct;
  loading?: boolean;
  onOpen?: (product: IProduct) => void;
}

export default function ProductCard({ product, loading, onOpen }: ProductCardProps) {
  const { data: session } = useSession();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const router = useRouter();

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return (window.location.href = "/auth/login");

    try {
      if (isInWishlist(product!._id)) {
        await removeFromWishlist(product!._id);
        toast.info(`${product!.title} removed from wishlist ❤️`);
      } else {
        await addToWishlist(product!);
        toast.success(`${product!.title} added to wishlist ❤️`);
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return (window.location.href = "/auth/login");

    try {
      await addToCart.mutateAsync({ productId: product!._id, quantity: 1 });
      toast.success(`${product!.title} added to cart 🛒`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleClick = () => {
    if (onOpen && product) return onOpen(product);
    if (product) router.push(`/products/${product._id}`);
  };

  if (loading) {
    return (
      <article className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-pulse">
        <div className="w-full h-44 bg-gray-300" />
        <div className="p-3">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="flex justify-between items-center mt-3">
            <div className="h-4 bg-gray-300 rounded w-1/4" />
            <div className="h-6 bg-gray-300 rounded w-16" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={handleClick}
      className="shadow-[#272d28] rounded-2xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-lg transition"
    >
      <div className="relative w-full h-35 md:h-[260px]">
        <Image
          src={product?.images?.[0] || "/placeholder.png"}
          alt={product?.title || "Product"}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xs md:text-sm font-semibold line-clamp-2 text-gray-700">{product?.title}</h3>
          {session && (
            <button onClick={toggleWishlist} className="p-1 rounded-full bg-white shadow">
              <Heart
                size={16}
                className={isInWishlist(product!._id) ? "text-red-500" : "text-gray-400"}
                fill={isInWishlist(product!._id) ? "currentColor" : "none"}
              />
            </button>
          )}
        </div>
        <p className="text-[8px] text-gray-500 line-clamp-2">
          {product?.category ?? "Uncategorized"}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="text-[11px] md:text-sm font-bold text-gray-700">
            ₦{Number(product?.price || 0).toLocaleString()}
          </div>
          <button
            onClick={handleAddToCart}
            className={`text-white text-[9px] md:text-sm px-1.5 py-1 rounded-md ${
              isInCart(product!._id) ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-blue-700"
            }`}
            disabled={isInCart(product!._id)}
          >
            {isInCart(product!._id) ? "In Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
