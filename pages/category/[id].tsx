"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProductCard from "@/components/home/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { IProduct } from "@/models/Product";
import { toast } from "sonner";

export default function CategoryPage() {
  const router = useRouter();
  const { id } = router.query;

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?categoryId=${id}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products for this category");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  return (
    <div className="px-6 lg:px-25 xl:px-25 py-10 max-w-8xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 capitalize">
        Category Products
      </h1>

      {loading ? (
        <div className="grid gap-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-[250px] rounded-lg" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-4 lg:gap-10 xl:gap-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No products found in this category.</p>
      )}
    </div>
  );
}
