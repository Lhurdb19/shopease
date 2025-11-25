"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import CategorySection from "@/components/home/CategoriesSection";
import ProductOverlay from "@/components/home/ProductOverlay";
import { IProduct } from "@/models/Product";
import { Toaster } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, IProduct[]>>({});
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<IProduct | null>(null);
  const [similar, setSimilar] = useState<IProduct[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  /** Fetch categories */
  useEffect(() => {
    axios.get("/api/categories")
      .then(res => setCategories(res.data.categories || []))
      .catch(err => console.error(err));
  }, []);

  /** Fetch products for each category */
  useEffect(() => {
    if (!categories.length) return;

    const fetchProducts = async () => {
      try {
        const res = await Promise.all(
          categories.map(cat =>
            axios
              .get("/api/products", { params: { categoryId: cat.id, limit: 4 } })
              .then(r => ({ [cat.id]: r.data.products }))
          )
        );
        const combined: Record<string, IProduct[]> = {};
        res.forEach(r => Object.assign(combined, r));
        setProductsByCategory(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categories]);

  /** Open overlay and fetch similar products */
  const openOverlay = async (product: IProduct) => {
    setSelected(product);
    setSimilar([]);
    setLoadingSimilar(true);

    try {
      const params = new URLSearchParams({
        categoryId: product.categoryId || "",
        limit: "8",
        exclude: product._id,
      });
      const res = await fetch(`/api/products/similar?${params.toString()}`);
      const data = await res.json();
      setSimilar(data.products || []);
    } catch (err) {
      console.error(err);
      setSimilar([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  /** Close overlay */
  const closeOverlay = () => setSelected(null);

  /** Lock scroll when overlay open */
  useEffect(() => {
    if (selected) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  }, [selected]);

  return (
    <div className="bg-gray-50 min-h-screen px-4 md:px-8 lg:px-12 py-8">
      <Toaster position="top-center" richColors />
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">Shop by Category</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500">No categories available.</p>
      ) : (
        categories.map(category => (
          <CategorySection
            key={category.id}
            id={category.id} // ✅ use id
            title={category.name}
            products={productsByCategory[category.id] || []}
            loading={false}
            onOpen={openOverlay} // overlay callback
          />
        ))
      )}

      {selected && (
        <ProductOverlay
          product={selected}
          similar={similar}
          loadingSimilar={loadingSimilar}
          onClose={closeOverlay}
          onOpenProduct={openOverlay}
        />
      )}
    </div>
  );
}
