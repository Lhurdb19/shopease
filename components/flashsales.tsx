"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

// Types
interface FlashSaleItem {
  id: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  discount: number;
  endsAt: string;    // ISO date string
}

export default function FlashSales() {
  const [products, setProducts] = useState<FlashSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now()); // for live countdown

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

  // Live countdown update every second
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
    <section className="mt-10 px-4 lg:px-25 max-w-8xl mx-auto">
      {/* TITLE */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl lg:text-2xl font-bold">🔥 Flash Sales</h2>
      </div>

      {/* LOADING SKELETON */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-40 rounded-xl" />
            ))}
        </div>
      )}

      {/* NO DATA */}
      {!loading && products.length === 0 && (
        <p className="text-center text-gray-500 py-10">No flash sales available.</p>
      )}

      {/* FLASH SALES GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-gray-900 border rounded-xl shadow hover:shadow-lg p-3 relative"
          >
            {/* IMAGE */}
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-28 object-contain rounded-lg"
            />

            {/* TITLE */}
            <p className="mt-2 text-sm font-semibold line-clamp-2">{product.title}</p>

            {/* PRICES */}
            <div className="mt-1">
              <p className="text-green-600 font-bold text-sm">₦{product.price}</p>
              <p className="text-gray-400 text-xs line-through">₦{product.oldPrice}</p>
            </div>

            {/* COUNTDOWN */}
            <p className="mt-2 text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-lg inline-block">
              ⏳ {formatTime(product.endsAt)}
            </p>

            {/* DISCOUNT BADGE */}
            <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
              {product.discount}% OFF
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
