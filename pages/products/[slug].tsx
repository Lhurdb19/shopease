"use client";

import { GetServerSideProps } from "next";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductPageProps {
  product: any;
}

export default function ProductPage({ product }: ProductPageProps) {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [mainImage, setMainImage] = useState<string>(product.images?.[0] || "");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!session) {
      toast.info("Please log in to add items to your cart.");
      return (window.location.href = "/auth/login");
    }

    if (product.stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    try {
      setIsAdding(true);
      await addToCart.mutateAsync({ productId: product._id, quantity: 1 });
      toast.success(`${product.title} added to your cart 🛒`);
    } catch {
      toast.error("Failed to add to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!session) {
      toast.info("Please log in to use wishlist ❤️");
      return (window.location.href = "/auth/login");
    }

    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        toast.success(`${product.title} removed from wishlist 💔`);
      } else {
        await addToWishlist(product);
        toast.success(`${product.title} added to wishlist ❤️`);
      }
    } catch {
      toast.error("Wishlist update failed.");
    }
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />

      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm sm:text-base font-medium mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* LEFT - Images */}
        <div className="space-y-4">
          <div className="relative w-full h-80 sm:h-96 lg:h-[420px] overflow-hidden rounded-xl shadow-md">
            <Image
              src={mainImage || "/placeholder.png"}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            {session && (
              <button
                onClick={handleToggleWishlist}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
              >
                <Heart
                  size={22}
                  className={`${isInWishlist(product._id) ? "text-red-500" : "text-gray-400"} transition-colors`}
                  fill={isInWishlist(product._id) ? "currentColor" : "none"}
                />
              </button>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {product.images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-full aspect-square overflow-hidden rounded-lg cursor-pointer border-2 ${
                    mainImage === img ? "border-blue-600" : "border-transparent hover:border-gray-300"
                  } transition-all duration-300`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT - Product Info */}
        <div className="flex flex-col justify-center space-y-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.title}</h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{product.description}</p>

          <div className="space-y-2">
            <p className="text-2xl font-semibold text-blue-600">₦{product.price?.toLocaleString()}</p>
            {product.discount && <p className="text-sm line-through text-gray-500">₦{product.oldPrice?.toLocaleString()}</p>}
            <p className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
            <p className="text-sm text-gray-500">Seller: {product.createdBy?.name || product.createdBy?.email}</p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock <= 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-md ${
                product.stock > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={20} />
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 border shadow-sm ${
                isInWishlist(product._id) ? "bg-red-500 text-white hover:bg-red-600" : "border-gray-400 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Heart size={20} fill={isInWishlist(product._id) ? "currentColor" : "none"} className="transition-colors" />
              {isInWishlist(product._id) ? "Wishlisted" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------
// SERVER-SIDE FETCH
// ----------------------
export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectDB();

  const slug = context.params?.slug as string;

  if (!slug) return { notFound: true };

  try {
    // ✅ Case-insensitive slug search
    const product = await Product.findOne({ slug: { $regex: `^${slug}$`, $options: "i" } })
      .populate("createdBy", "name email")
      .lean();

    if (!product) return { notFound: true };

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
      },
    };
  } catch (err) {
    console.error("Product page error:", err);
    return { notFound: true };
  }
};
