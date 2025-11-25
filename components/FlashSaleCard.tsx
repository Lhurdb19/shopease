"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export interface FlashSaleItem {
  id: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  discount: number;
  endsAt: string;
}

export default function FlashSaleCard({ item, compact = false } : { item: FlashSaleItem, compact?: boolean }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (iso?: string) => {
    if (!iso) return "00:00:00";
    const diff = new Date(iso).getTime() - now;
    if (diff <= 0) return "00 : 00 : 00";
    const hrs = Math.floor(diff / 1000 / 3600);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    return `${String(hrs).padStart(2,"0")} : ${String(mins).padStart(2,"0")} : ${String(secs).padStart(2,"0")}`;
  };

  return (
    <Link href={`/products/${item.id}`} className="block flex-1">
      <article className={`group bg-white dark:bg-gray-900 border rounded-xl shadow hover:shadow-md transition p-3 ${compact ? "w-40" : ""}`}>
        <div className="relative w-full h-28 md:h-36 flex items-center justify-center">
          <img
            src={item.image || "/placeholder.png"}
            alt={item.title}
            className="max-h-full object-contain rounded-md pointer-events-none"
            draggable={false}
          />
          <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full pointer-events-none">
            {item.discount}% OFF
          </span>
        </div>

        <div className="mt-2">
          <p className="text-sm font-semibold line-clamp-2 text-gray-800 dark:text-gray-100">{item.title}</p>

          <div className="mt-1 flex items-center gap-2">
            <div className="text-green-600 font-bold">₦{Number(item.price).toLocaleString()}</div>
            <div className="text-gray-400 text-xs line-through">₦{Number(item.oldPrice).toLocaleString()}</div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-lg inline-block">
              ⏳ {formatTime(item.endsAt)}
            </span>
            <button className="text-[11px] px-2 py-1 rounded-md bg-green-600 text-white hidden group-hover:inline-block">
              Buy
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
