"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import { IProduct } from "@/models/Product";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  id: string; // category id
  title: string;
  products?: IProduct[];
  loading: boolean;
  wishlist?: string[];
  toggleWishlist?: (productId: string, title: string) => void;
}

export default function CategorySection({ id, title, products = [], loading }: Props) {
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold capitalize">{title}</h2>
        <Link href={`/category/${id}`} className="text-green-600 hover:underline">
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-[200px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:gap-10 xl:gap-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
