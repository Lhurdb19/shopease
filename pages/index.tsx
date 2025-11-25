"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/home/hero";
import CategorySection from "@/components/home/CategoriesSection";
import Testimonials from "@/components/home/Testimonials";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import FlashSales from "@/components/flashsales";

export default function HomePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]); // product IDs

  // Fetch categories & products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories);

        const results: Record<string, any[]> = {};
        for (const cat of data.categories) {
          const res = await fetch(`/api/products?categoryId=${cat.id}&limit=4`);
          const productsData = await res.json();
          results[cat.id] = productsData.products || [];
        }

        setCategoryProducts(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch user's wishlist
  useEffect(() => {
    if (!session?.user) return;

    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/user/wishlist");
        const data = await res.json();
        if (data.success) setWishlist(data.wishlist.map((w: any) => w.product._id));
      } catch (err) {
        console.error(err);
      }
    };

    fetchWishlist();
  }, [session]);

  const toggleWishlist = async (productId: string, title: string) => {
    if (!session?.user) {
      toast.error("Please login to manage wishlist");
      return;
    }

    try {
      const isInWishlist = wishlist.includes(productId);
      const res = await fetch("/api/user/wishlist", {
        method: isInWishlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (data.success) {
        setWishlist((prev) =>
          isInWishlist ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
        toast.success(
          isInWishlist ? `${title} removed from wishlist ❤️` : `${title} added to wishlist ❤️`
        );
      } else {
        toast.error(data.message || "Failed to update wishlist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div>
      <Hero />
      <FlashSales/>
      <div className="px-4 lg:px-25 xl:px-25 py-10 max-w-8xl">
        {categories.map((cat) => (
          <CategorySection
            key={cat.id}
            id={cat.id}
            title={cat.name}
            products={categoryProducts[cat.id] || []}
            loading={loading}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        ))}
      </div>
      <Testimonials />
    </div>
  );
}
