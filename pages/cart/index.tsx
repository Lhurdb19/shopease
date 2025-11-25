"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";

export default function CartPage() {
  const { data: cart, isLoading, removeFromCart, updateCart } = useCart();

  if (isLoading)
    return (
      <p className="text-center py-10 text-muted-foreground animate-pulse">
        Loading cart...
      </p>
    );

  if (!cart || !cart.items?.length)
    return (
      <div className="flex flex-col items-center py-16">
        <p className="text-lg font-medium text-muted-foreground">
          Your cart is empty.
        </p>
      </div>
    );

  const totalPrice = cart.items.reduce(
    (sum: number, item: any) =>
      sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      <div className="space-y-5">
        {cart.items.map((item: any) => {
          if (!item.product) return null;

          return (
            <Card key={item.product._id} className="shadow-sm border rounded-xl">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  
                  {/* Product Image + Title */}
                  <div className="flex items-center gap-4">
                    <Image
                      src={item.product.images?.[0] || "/placeholder.png"}
                      alt={item.product.title || "Product"}
                      width={70}
                      height={70}
                      className="rounded-md object-cover border"
                    />
                    <div>
                      <h2 className="font-semibold text-base sm:text-lg line-clamp-1">
                        {item.product.title}
                      </h2>
                      <p className="text-sm text-muted-foreground sm:hidden mt-1">
                        ₦{item.product.price?.toLocaleString()} x {item.quantity} ={" "}
                        <span className="font-semibold text-black">
                          ₦{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1 shadow-sm bg-white">
                      <button
                        onClick={() =>
                          updateCart.mutate({
                            productId: item.product._id,
                            quantity: item.quantity - 1,
                          })
                        }
                        disabled={item.quantity <= 1}
                        className="px-2 py-1 text-sm rounded-md bg-destructive/20 hover:bg-destructive/30 disabled:opacity-40"
                      >
                        −
                      </button>

                      <input
                        type="text"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateCart.mutate({
                            productId: item.product._id,
                            quantity: Number(e.target.value),
                          })
                        }
                        className="w-12 text-center border rounded-md text-sm focus:ring-2 focus:ring-primary"
                      />

                      <button
                        onClick={() =>
                          updateCart.mutate({
                            productId: item.product._id,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="px-2 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary/90"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart.mutate(item.product._id)}
                      className="text-destructive hover:underline text-xs sm:text-sm mt-1 sm:mt-0"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Price for desktop */}
                  <p className="hidden sm:block text-sm font-medium text-muted-foreground">
                    ₦{item.product.price?.toLocaleString()} x {item.quantity} ={" "}
                    <span className="text-black font-semibold">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-8 bg-white shadow-md border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Total</h2>
          <p className="text-xl font-bold text-primary">
            ₦{totalPrice.toLocaleString()}
          </p>
        </div>

        <Separator className="my-4" />

        <Button className="w-full text-base py-6 rounded-xl" asChild>
          <a href="/checkout">Proceed to Checkout</a>
        </Button>
      </div>
    </div>
  );
}
