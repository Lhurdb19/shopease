import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flashlight, Zap, ShoppingCart, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-br from-[#f7f7f7] to-white py-10 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900">
            Discover Luxury, Comfort & <span className="text-[#1bbf15]">Exclusive Deals</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-lg">
            ShopEase brings you premium products, unbeatable flash sales, and a 
            seamless shopping experience made just for you.
          </p>

          {/* FLASH SALES BANNER */}
          <div className="bg-[#fff4e6] border border-orange-300 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <Zap className="text-green-500 w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Flash Sales Are Live!</h3>
              <p className="text-gray-600 text-sm">Hurry — limited stock and time!</p>
            </div>
            <Link href="/flashsales" className="ml-auto">
              <ChevronRight className="text-green-600 w-6 h-6" />
            </Link>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-2">
            <Link href="/products" className="cursor-pointer">
              <Button size="lg" className="bg-green-600 hover:bg-orange-500 text-white rounded-xl px-6  cursor-pointer">
                <ShoppingCart className="mr-2 w-5 h-5" /> Start Shopping
              </Button>
            </Link>
            <Link href="/flashsales">
              <Button size="lg" variant="outline" className="rounded-xl border-green-600 text-green-600 hover:bg-orange-500 px-6  cursor-pointer">
                Flash Sales
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute top-4 right-4 bg-white shadow-md rounded-full px-4 py-2 text-sm font-semibold text-gray-700 z-10">
            Trusted by 50,000+ Shoppers
          </div>
          <img
            src="https://res.cloudinary.com/damamkuye/image/upload/v1764049835/shop_xdbsnp.jpg"
            alt="ShopEase Hero"
            className="rounded-3xl w-full object-cover shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
