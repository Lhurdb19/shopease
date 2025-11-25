"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { useCart } from "@/hooks/useCart";
// import PaystackPop from "@paystack/inline-js";

interface CartItem {
  productId?: string;
  product?: { _id: string };
  quantity: number;
  price: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  const [selected, setSelected] = useState("");
  const [shipping, setShipping] = useState<any>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  // const [flutterLoaded, setFlutterLoaded] = useState(false);
  const [PaystackPop, setPaystackPop] = useState<any>(null);

  // Load Flutterwave
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "https://checkout.flutterwave.com/v3.js";
  //   script.onload = () => setFlutterLoaded(true);
  //   document.body.appendChild(script);
  // }, []);

  // Load query params
  useEffect(() => {
    if (!router.isReady) return;

    const { shipping, items, total } = router.query;

    try {
      setShipping(JSON.parse(String(shipping)));
      setItems(JSON.parse(String(items)));
      setTotal(Number(total));
    } catch {
      toast.error("Failed to load payment details");
    }
  }, [router.isReady]);

  const paymentMethods = [
    { id: "paystack", label: "Paystack" },
    // { id: "flutterwave", label: "Flutterwave" },
    { id: "cod", label: "Cash on Delivery" },
  ];

  // PAYSTACK PAYMENT
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@paystack/inline-js").then((module) => {
        setPaystackPop(() => module.default);
      });
    }
  }, []);

  const handlePaystackPayment = () => {
    if (!PaystackPop) {
      return toast.error("Paystack is still loading...");
    }

    const paystack = new PaystackPop();

    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: shipping.email,
      amount: total * 100,
      currency: "NGN",

      onSuccess: async (response: any) => {
        try {
          const orderRes = await axios.post("/api/order", {
            items: items.map((i: CartItem) => ({
              product: i.productId || i.product?._id,
              quantity: i.quantity,
              price: i.price,
            })),
            shipping,
            total,
            paymentMethod: "paystack",
            reference: response.reference,
          });

          const orderId = orderRes.data.order._id;

          await axios.post("/api/paystack/verify", {
            reference: response.reference,
            orderId,
          });

          await clearCart.mutateAsync();
          router.push("/order-success");
        } catch (err) {
          toast.error("Order saving failed.");
        }
      },

      onCancel: () => toast.error("Payment cancelled."),
    });
  };

  // FLUTTERWAVE PAYMENT
  // const handleFlutterwave = () => {
  //   if (!flutterLoaded) return toast.error("Flutterwave loading...");

  //   // @ts-ignore
  //   window.FlutterwaveCheckout({
  //     public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
  //     tx_ref: `tx-${Date.now()}`,
  //     amount: total,
  //     currency: "NGN",
  //     customer: {
  //       email: shipping.email,
  //       phone_number: shipping.phone,
  //       name: shipping.name,
  //     },

  //     callback: async (response: any) => {
  //       const orderRes = await axios.post("/api/order", {
  //         items: items.map((i: CartItem) => ({
  //           product: i.productId || i.product?._id,
  //           quantity: i.quantity,
  //           price: i.price,
  //         })),
  //         shipping,
  //         total,
  //         paymentMethod: "flutterwave",
  //         reference: response.tx_ref,
  //       });

  //       const orderId = orderRes.data.order._id;

  //       await axios.post("/api/flutterwave/verify", {
  //         transaction_id: response.transaction_id,
  //         orderId,
  //       });

  //       await clearCart.mutateAsync();
  //       router.push("/order-success");
  //     },
  //   });
  // };

  // CASH ON DELIVERY
  const handleCOD = async () => {
    await axios.post("/api/order", {
      items: items.map((i: CartItem) => ({
        product: i.productId || i.product?._id,
        quantity: i.quantity,
        price: i.price,
      })),
      shipping,
      total,
      paymentMethod: "cod",
    });

    await clearCart.mutateAsync();
    router.push("/order-success");
  };

  const handlePayment = () => {
    if (!selected) return toast.error("Select a payment method");
    setIsProcessing(true);

    if (selected === "paystack") handlePaystackPayment();
    // else if (selected === "flutterwave") handleFlutterwave();
    else handleCOD();
  };

  if (!shipping)
    return <div className="text-center p-10">Loading...</div>;

  return (
  <div className="min-h-screen bg-gray-50 py-10 px-4">
    <Toaster richColors />
    <div className="max-w-lg mx-auto">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Payment Overview
        </h1>

        {/* Order Summary */}
        <div className="mb-6 border p-4 rounded-xl bg-gray-50">
          <h2 className="font-semibold text-gray-800 text-lg mb-3">
            Order Summary
          </h2>

          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">Items:</span>
              <span className="font-semibold text-gray-900">
                {items.length}
              </span>
            </p>

            <p className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-semibold text-gray-900">
                {shipping.address}
              </span>
            </p>

            <p className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Total Amount:</span>
              <span>₦{total.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="font-semibold text-gray-800 text-lg mb-3">
            Choose Payment Method
          </h2>

          <div className="space-y-3">
            {paymentMethods.map((m) => (
              <label
                key={m.id}
                className={`p-4 border rounded-xl bg-gray-50 cursor-pointer flex items-center transition-all
                  ${selected === m.id ? "border-blue-600 shadow-sm" : "border-gray-300"}
                `}
              >
                <input
                  type="radio"
                  onChange={() => setSelected(m.id)}
                  checked={selected === m.id}
                  className="mr-3 h-4 w-4"
                />
                <span className="text-gray-700 font-medium">{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="mt-8 w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow transition-all disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Continue to Pay"}
        </button>
      </div>
    </div>
  </div>
);
}
