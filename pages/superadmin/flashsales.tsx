// pages/admin/flashsales.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ChevronRight, Trash2 } from "lucide-react";

/**
 * Admin Flash Sales page
 * - Loads all products for selection
 * - Loads all flash sales (admin view)
 * - Tabs: Active | Upcoming | Expired
 * - Add modal / inline form to create new sale
 */

type Product = {
  _id: string;
  title: string;
  price: number;
  images?: string[];
};

type Sale = {
  _id: string;
  productId: string;
  salePrice: number;
  startTime: string; // ISO
  endTime: string;   // ISO
  active: boolean;
  product?: Product | null;
};

export default function FlashSaleAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [selectedProduct, setSelectedProduct] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [adding, setAdding] = useState(false);

  const [tab, setTab] = useState<"active" | "upcoming" | "expired">("active");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([axios.get("/api/products/all"), axios.get("/api/flashsales?admin=true")]);
      setProducts(pRes.data || []);
      setSales(sRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const now = useMemo(() => Date.now(), [sales.length]); // trigger updates when sales change

  // helpers: categorise sales
  const activeSales = sales.filter((s) => {
    if (!s.startTime || !s.endTime) return false;
    const start = new Date(s.startTime).getTime();
    const end = new Date(s.endTime).getTime();
    return start <= Date.now() && end >= Date.now() && s.active;
  });

  const upcomingSales = sales.filter((s) => {
    const start = new Date(s.startTime).getTime();
    return start > Date.now() && s.active;
  });

  const expiredSales = sales.filter((s) => {
    const end = new Date(s.endTime).getTime();
    return end < Date.now() || s.active === false;
  });

  // Add sale
  const addSale = async () => {
    if (!selectedProduct || !salePrice || !startTime || !endTime) {
      return toast.error("Please fill all fields");
    }

    // client validation
    const s = new Date(startTime);
    const e = new Date(endTime);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return toast.error("Invalid dates");
    if (s.getTime() >= e.getTime()) return toast.error("Start must be before End");

    const prod = products.find((p) => p._id === selectedProduct);
    if (!prod) return toast.error("Product not found");
    if (Number(salePrice) <= 0 || Number(salePrice) >= prod.price) return toast.error("Sale price must be < original price");

    try {
      setAdding(true);
      const res = await axios.post("/api/flashsales", {
        productId: selectedProduct,
        salePrice: Number(salePrice),
        startTime: s.toISOString(),
        endTime: e.toISOString(),
      });

      // success: push to list and reset form
      toast.success("Flash sale added");
      // reload all so admin sees updated list/populated product
      await loadAll();
      setSelectedProduct("");
      setSalePrice("");
      setStartTime("");
      setEndTime("");
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to add flash sale";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const removeSale = async (id: string) => {
    if (!confirm("Remove this flash sale?")) return;
    try {
      await axios.delete("/api/flashsales", { data: { saleId: id } });
      toast.success("Removed");
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove sale");
    }
  };

  // simple countdown formatting
  const formatRemaining = (iso: string | null) => {
    if (!iso) return "—";
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return "00:00:00";
    const hrs = Math.floor(ms / 1000 / 3600);
    const mins = Math.floor((ms / 1000 / 60) % 60);
    const secs = Math.floor((ms / 1000) % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">⚡ Flash Sales — Superadmin</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ADD FORM */}
        <Card>
          <CardHeader>
            <CardTitle>Add Flash Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="text-sm font-medium">Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full p-3 border rounded-md"
              >
                <option value="">-- select product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id} className="text-black">
                    {p.title} — ₦{Number(p.price).toLocaleString()}
                  </option>
                ))}
              </select>

              <label className="text-sm font-medium">Sale price (₦)</label>
              <Input
                placeholder="Sale Price"
                value={salePrice}
                onChange={(e: any) => setSalePrice(e.target.value)}
              />

              <label className="text-sm font-medium">Start</label>
              <Input type="datetime-local" value={startTime} onChange={(e: any) => setStartTime(e.target.value)} />

              <label className="text-sm font-medium">End</label>
              <Input type="datetime-local" value={endTime} onChange={(e: any) => setEndTime(e.target.value)} />

              <div className="flex gap-3">
                <Button onClick={addSale} className="bg-green-600" disabled={adding}>
                  {adding ? "Adding..." : "Add Flash Sale"}
                </Button>
                <Button variant="ghost" onClick={() => {
                  setSelectedProduct("");
                  setSalePrice("");
                  setStartTime("");
                  setEndTime("");
                }}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STATS & TABS */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-md text-center">
                  <div className="text-sm text-gray-800">Total Sales</div>
                  <div className="text-lg font-bold">{sales.length}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md text-center">
                  <div className="text-sm text-gray-800">Active</div>
                  <div className="text-lg font-bold">{activeSales.length}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md text-center">
                  <div className="text-sm text-gray-800">Upcoming</div>
                  <div className="text-lg font-bold">{upcomingSales.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded ${tab==="active" ? "bg-green-600 text-white" : "bg-gray-100 text-green-600"}`} onClick={()=>setTab("active")}>Active</button>
            <button className={`px-4 py-2 rounded ${tab==="upcoming" ? "bg-green-600 text-white" : "bg-gray-100 text-green-600"}`} onClick={()=>setTab("upcoming")}>Upcoming</button>
            <button className={`px-4 py-2 rounded ${tab==="expired" ? "bg-green-600 text-white" : "bg-gray-100 text-green-600"}`} onClick={()=>setTab("expired")}>Expired</button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="mt-6 space-y-4">
        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && tab === "active" && activeSales.length === 0 && <p className="text-gray-500">No active sales</p>}
        {!loading && tab === "upcoming" && upcomingSales.length === 0 && <p className="text-gray-500">No upcoming sales</p>}
        {!loading && tab === "expired" && expiredSales.length === 0 && <p className="text-gray-500">No expired sales</p>}

        {/* Render list depending on tab */}
        <div className="grid gap-3">
          {(tab === "active" ? activeSales : tab === "upcoming" ? upcomingSales : expiredSales).map((s) => (
            <div key={s._id} className="p-3 border rounded-md flex items-center gap-4">
              <img src={s.product?.images?.[0] ?? "/placeholder.png"} alt={s.product?.title} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{s.product?.title}</div>
                    <div className="text-xs text-gray-500">
                      Original: ₦{Number(s.product?.price ?? 0).toLocaleString()} • Sale: ₦{Number(s.salePrice).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    {s.startTime && s.endTime ? (
                      <>
                        <div>Start: {new Date(s.startTime).toLocaleString()}</div>
                        <div>End: {new Date(s.endTime).toLocaleString()}</div>
                      </>
                    ) : (
                      <div>—</div>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="text-sm bg-red-600 text-white px-2 py-1 rounded">
                    ⏳ {formatRemaining(s.endTime)}
                  </div>

                  {/* Overlap indicator: check if sale overlaps any other */}
                  {/* simple check client-side */}
                  <div className="text-xs text-gray-500">
                    {s.product ? `${s.product.category ?? ""}` : ""}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Button variant="destructive" onClick={() => removeSale(s._id)}>
                  <Trash2 size={14} />
                </Button>

                <a href={`/products/${s.product?._id}`} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                  View product <ChevronRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
