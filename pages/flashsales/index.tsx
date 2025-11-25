import React, { useEffect, useState } from "react";
import axios from "axios";
import FlashSaleCard, { FlashSaleItem } from "@/components/FlashSaleCard";
import { motion } from "framer-motion";

export default function FlashSalesPage() {
  const [items, setItems] = useState<FlashSaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get("/api/flashsales");
        if (!mounted) return;
        setItems(res.data || []);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold">🔥 Flash Sales</h1>
          <p className="text-sm text-gray-500">Limited time offers — while stocks last</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({length:8}).map((_,i)=>(
              <div key={i} className="h-44 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No flash sales available</p>
        ) : (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map(it => <FlashSaleCard key={it.id} item={it} />)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
