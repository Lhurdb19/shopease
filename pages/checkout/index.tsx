"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { data: cart, isLoading, updateCart, removeFromCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!session && status !== "loading") router.push("/auth/login");
  }, [session, status, router]);

  if (isLoading)
    return <p className="text-center py-10 animate-pulse text-muted-foreground">Loading cart...</p>;

  if (!cart || !cart.items?.length)
    return <p className="text-center py-10 text-muted-foreground">Your cart is empty.</p>;

  const totalPrice = cart.items.reduce(
    (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoToPayment = () => {
    if (loading) return;
    setLoading(true);

    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    router.push({
      pathname: "/payment",
      query: {
        shipping: JSON.stringify(form),
        total: totalPrice.toString(),
        items: JSON.stringify(
          cart.items.map((i: any) => ({
            productId: i.product._id,
            quantity: i.quantity,
            price: i.product.price,
          }))
        ),
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <Toaster richColors position="top-center" />

      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="md:col-span-2">
          <Card className="shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleInputChange}
              />
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleInputChange}
              />
              <Input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleInputChange}
              />
              <Input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleInputChange}
              />
              <Input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleInputChange}
              />
              <Input
                name="postalCode"
                placeholder="Postal Code"
                value={form.postalCode}
                onChange={handleInputChange}
              />

              <Separator />

              <Button
                onClick={handleGoToPayment}
                disabled={loading}
                className="w-full py-6 text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                  </div>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="sticky top-24">
          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item: any) => {
                if (!item.product) return null;

                return (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.product.images?.[0] || "/placeholder.png"}
                        alt={item.product.title}
                        width={50}
                        height={50}
                        className="rounded-md border"
                      />
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">{item.product.title}</p>
                        <p className="text-muted-foreground text-xs">
                          ₦{item.product.price?.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-semibold">
                        ₦{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeFromCart.mutate(item.product._id)}
                        >
                          Remove
                        </Button>
                        <div className="flex items-center gap-1 border rounded-md px-1">
                          <button
                            onClick={() =>
                              updateCart.mutate({
                                productId: item.product._id,
                                quantity: item.quantity - 1,
                              })
                            }
                            disabled={item.quantity <= 1}
                            className="px-2 text-sm font-bold text-red-500 disabled:opacity-40"
                          >
                            –
                          </button>
                          <span className="px-2 text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateCart.mutate({
                                productId: item.product._id,
                                quantity: item.quantity + 1,
                              })
                            }
                            className="px-2 text-sm font-bold text-green-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Separator className="my-2" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
