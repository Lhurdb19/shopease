"use client";

import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import ProductCard from "@/components/home/ProductCard";
import { IProduct } from "@/models/Product";
import { Toaster } from "sonner";
import Link from "next/link";

type Props = {
  products: IProduct[];
};

export default function ProductsPage({ products: initialProducts }: Props) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts || []);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setProducts(initialProducts || []);
  }, [initialProducts]);

  useEffect(() => {
    if (!search) {
      setProducts(initialProducts);
      return;
    }
    const q = search.toLowerCase();
    setProducts(
      (initialProducts || []).filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      )
    );
  }, [search, initialProducts]);

  return (
    <div className="dark:bg-black min-h-screen px-4 md:px-5 lg:px-25 py-8">
      <Toaster position="top-center" richColors />
      <div className="max-w-8xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-black">All Products</h1>
          <div className="flex gap-3 items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="border rounded-full px-4 py-2 w-full max-w-xs focus:outline-none border-black text-black focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link key={p._id} href={`/products/${p._id}`}>
                <ProductCard product={p} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Server-side fetch for initial render
 */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { connectDB } = await import("@/lib/db");
    const ProductModel = (await import("@/models/Product")).default;
    await connectDB();

    const q = ctx.query.search ? String(ctx.query.search).trim() : "";
    let products;
    if (!q) {
      products = await ProductModel.find({ active: true }).sort({ createdAt: -1 }).lean();
    } else {
      products = await ProductModel.find({
        active: true,
        title: { $regex: q, $options: "i" },
      }).sort({ createdAt: -1 }).lean();
    }

    return { props: { products: JSON.parse(JSON.stringify(products || [])) } };
  } catch (error) {
    console.error("Products page getServerSideProps error:", error);
    return { props: { products: [] } };
  }
};
