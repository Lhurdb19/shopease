"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import FlashSaleCard, { FlashSaleItem } from "@/components/FlashSaleCard";
import axios from "axios";

export default function FlashSalesCarousel() {
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
        console.error("flashsales carousel load err", err);
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="h-44 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return <p className="text-center text-gray-500">No flash sales right now.</p>;
  }

  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={12}
        slidesPerView={2}
        autoplay={{ delay: 2800, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
        }}
      >
        {items.map((it) => (
          <SwiperSlide key={it.id}>
            <div className="px-1">
              <FlashSaleCard item={it} compact />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
