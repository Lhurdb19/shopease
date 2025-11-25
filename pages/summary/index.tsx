"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";

export default function SummarySidebar() {
  const { data: cart, isLoading, updateCart, removeFromCart } = useCart();

  if (isLoading)
    return (
      <p className="text-center py-10 animate-pulse text-muted-foreground">
        Loading cart summary...
      </p>
    );

  if (!cart || !cart.items?.length)
    return (
      <p className="text-center py-10 text-muted-foreground">
        Your cart is empty
      </p>
    );

  const totalPrice = cart.items.reduce(
    (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <Card className="shadow-lg rounded-2xl sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.items.map((item: any) => {
          if (!item.product) return null;

          return (
            <div key={item.product._id} className="flex items-center justify-between gap-3">
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
                  {/* <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => removeFromCart.mutate(item.product._id)}
                  >
                    Remove
                  </Button> */}
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

        <Button className="w-full mt-4 py-3 rounded-xl bg-green-600 hover:bg-blue-700 text-white">
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
}
