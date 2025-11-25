"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  return (
    <div className="min-h-150 flex items-center justify-center bg-gray-50 px-4 py-5">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center animate-fadeIn">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Order Successful 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for shopping with us! Your order has been received and is being processed.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
          >
            Continue Shopping
          </Link>

          <Link
            href="/user/orders"
            className="block w-full py-3 rounded-xl border border-green-600 text-green-600 font-medium hover:bg-green-50 transition"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
