"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface FlashSaleItem {
  id: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  discount: number;
  endsAt: string;
}

export default function FlashSales() {
  const [products, setProducts] = useState<FlashSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const res = await axios.get("/api/flashsales");
        setProducts(res.data || []);
      } catch (err) {
        console.log(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (endTime: string) => {
    const diff = new Date(endTime).getTime() - now;
    if (diff <= 0) return "00 : 00 : 00";

    const hrs = Math.floor(diff / 1000 / 3600);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    return `${hrs.toString().padStart(2, "0")} : ${mins
      .toString()
      .padStart(2, "0")} : ${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section className="mt-10 px-4 lg:px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl lg:text-2xl font-bold">🔥 Flash Sales</h2>

        <Link
          href="/components/flashsales"
          className="text-green-600 font-semibold flex items-center gap-1 hover:underline"
        >
          See All <ChevronRight size={18} />
        </Link>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-40 rounded-xl"
            />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No flash sales available.
        </p>
      )}

      {/* FLASH SALES GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="block"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-900 border rounded-xl shadow p-3 relative cursor-pointer"
            >
              {/* IMAGE */}
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-28 object-contain rounded-lg pointer-events-none"
              />

              {/* TITLE */}
              <p className="mt-2 text-sm font-semibold line-clamp-2">
                {product.title}
              </p>

              {/* PRICES */}
              <div className="mt-1">
                <p className="text-green-600 font-bold text-sm">
                  ₦{product.price}
                </p>
                <p className="text-gray-400 text-xs line-through">
                  ₦{product.oldPrice}
                </p>
              </div>

              {/* COUNTDOWN */}
              <p className="mt-2 text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-lg inline-block">
                ⏳ {formatTime(product.endsAt)}
              </p>

              {/* DISCOUNT BADGE */}
              <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full pointer-events-none">
                {product.discount}% OFF
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
