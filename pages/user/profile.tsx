// components/UserDashboard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import axios from "axios";
import ChangePassword from "../changepassword-form";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/hooks/useCart";
import { Heart, Trash2, ShoppingCart, Bell, Menu, LogOut, Edit2 } from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/router";
import Layout from "../layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface Product {
  _id: string;
  title: string;
  images?: string[];
  price: number;
  stock?: number;
}

interface OrderItem {
  product?: Product;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  shipping?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  readBy?: string[];
  createdAt: string;
}

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  meta?: {
    phone?: string;
    address?: string;
    avatar?: string;
  };
}

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "wishlist" | "notifications" | "password">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const { wishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart } = useCart();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [editingProfile, setEditingProfile] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Pagination states
  const [ordersPage, setOrdersPage] = useState(1);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const ITEMS_PER_PAGE = 8;


  const router = useRouter();

  const CACHE_KEYS = {
    user: "ud_user_v1",
    orders: "ud_orders_v1",
    notifications: "ud_notifications_v1",
    ts: "ud_ts_v1",
  };
  const STALE_MS = 1000 * 60 * 2; // 2 minutes

  const setCache = (key: string, data: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      sessionStorage.setItem(CACHE_KEYS.ts, String(Date.now()));
    } catch { }
  };

  const readCache = (key: string) => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const normalizeUser = (payload: any): UserProfile => ({
    name: payload.name || "",
    email: payload.email || "",
    phone: payload.phone || payload.meta?.phone || "",
    address: payload.address || payload.meta?.address || "",
    avatar: payload.avatar || payload.meta?.avatar || "",
    meta: payload.meta,
  });

  const revalidateUser = async () => {
    try {
      const res = await axios.get("/api/user/me");
      const payload = res.data?.user ?? res.data;
      if (payload) {
        const normalized = normalizeUser(payload);
        setUser(normalized);
        setEditingProfile({
          name: normalized.name,
          phone: normalized.phone,
          address: normalized.address,
        });
        setAvatarPreview(normalized.avatar || null);
        setCache(CACHE_KEYS.user, payload);
      }
    } catch (err) {
      console.error("revalidateUser error:", err);
      toast.error("Failed to fetch user profile");
    }
  };

  const fetchOrders = async (opts?: { force?: boolean }) => {
    try {
      if (!opts?.force) {
        const cached = readCache(CACHE_KEYS.orders);
        const ts = Number(sessionStorage.getItem(CACHE_KEYS.ts) || 0);
        if (cached && Date.now() - ts < STALE_MS) {
          setOrders(cached);
          revalidateOrders();
          return;
        }
      }
      await revalidateOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const revalidateOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await axios.get("/api/order");
      const data = Array.isArray(res.data) ? res.data : res.data.orders ?? res.data;
      setOrders(data || []);
      setCache(CACHE_KEYS.orders, data || []);
    } catch (err) {
      console.error("revalidateOrders error:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchNotifications = async (opts?: { force?: boolean }) => {
    try {
      if (!opts?.force) {
        const cached = readCache(CACHE_KEYS.notifications);
        const ts = Number(sessionStorage.getItem(CACHE_KEYS.ts) || 0);
        if (cached && Date.now() - ts < STALE_MS) {
          setNotifications(cached);
          revalidateNotifications();
          return;
        }
      }
      await revalidateNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch notifications");
    }
  };

  const revalidateNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await axios.get("/api/notifications");
      const data = Array.isArray(res.data) ? res.data : res.data.notifications ?? res.data;
      setNotifications(data || []);
      setCache(CACHE_KEYS.notifications, data || []);
    } catch (err) {
      console.error("revalidateNotifications error:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUser = async () => {
    try {
      const cached = readCache(CACHE_KEYS.user);
      const ts = Number(sessionStorage.getItem(CACHE_KEYS.ts) || 0);
      if (cached && Date.now() - ts < STALE_MS) {
        setUser(cached);
        setEditingProfile({
          name: cached.name || "",
          phone: cached.phone || "",
          address: cached.address || "",
        });
        setAvatarPreview(cached.avatar || null);
        revalidateUser();
        return;
      }
      await revalidateUser();
    } catch (err) {
      console.error("fetchUser error:", err);
      toast.error("Failed to fetch user profile");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchOrders();
    fetchNotifications();
  }, []);

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const payload = {
        name: editingProfile.name,
        meta: {
          phone: editingProfile.phone,
          address: editingProfile.address,
        },
      };
      const res = await axios.put("/api/user/update", payload);
      if (res.status >= 200 && res.status < 300) {
        toast.success("Profile updated");
        revalidateUser();
      } else {
        toast.error(res.data?.msg || "Failed to update profile");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.msg || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    try {
      const input = fileRef.current;
      if (!input || !input.files || !input.files[0]) {
        toast.error("Pick a file first");
        return;
      }
      const file = input.files[0];
      const form = new FormData();
      form.append("avatar", file);

      setUploadingAvatar(true);

      const res = await axios.post("/api/user/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status >= 200 && res.status < 300) {
        toast.success("Avatar uploaded");
        revalidateUser();
      } else {
        toast.error("Upload failed");
      }
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 404) {
        toast.error("Avatar upload endpoint not found on server. Implement POST /api/user/avatar");
      } else {
        toast.error("Failed to upload avatar");
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleMarkNotification = async (id: string) => {
    try {
      await axios.post("/api/notifications/mark-read", { id });
      revalidateNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update notification");
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      if (product.stock && product.stock <= 0) {
        toast.error("This product is out of stock.");
        return;
      }
      await addToCart.mutateAsync({ productId: product._id, quantity: 1 });
      toast.success(`${product.title} added to your cart 🛒`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const ordersCount = Array.isArray(orders) ? orders.length : 0;
  const wishlistCount = wishlist?.length || 0;
  const notificationsArr = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationsArr.filter((n) => !(Array.isArray(n.readBy) && n.readBy.length)).length;

  // Paginated slices
  const paginatedOrders = orders.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE);
  const paginatedWishlist = wishlist.slice((wishlistPage - 1) * ITEMS_PER_PAGE, wishlistPage * ITEMS_PER_PAGE);
  const paginatedNotifications = notificationsArr.slice((notificationsPage - 1) * ITEMS_PER_PAGE, notificationsPage * ITEMS_PER_PAGE);


  return (
    <>
      <div className="flex absolute xl:fixed top-0 mb-100 min-h-screen bg-gray-100 text-black z-50 w-full">
        <Layout hideNavFooter={true}>

          <Toaster richColors position="top-right" />

          {/* Mobile Sidebar Button */}
          <div className="lg:hidden p-4">
            <Sheet>
              <SheetTrigger aria-label="Open menu" className="p-2">
                <Menu className="w-7 h-7 text-green-700" />
              </SheetTrigger>

              <SheetContent side="left" className="w-64 p-5">
                <SheetHeader>
                  <SheetTitle className="text-green-700">Dashboard</SheetTitle>
                </SheetHeader>

                <ul className="space-y-2 mt-6 text-sm">

                  {["Home", "overview", "orders", "wishlist", "notifications", "password"].map((tab) => (

                    <li
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`cursor-pointer px-3 py-2 rounded capitalize hover:bg-green-200 ${activeTab === tab ? "bg-green-300 font-semibold" : ""}`}
                    >
                      {tab}
                    </li>
                  ))}
                  <li className="mt-4">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </li>
                </ul>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 p-5 bg-white border-r shadow z-20">

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl text-green-700">Dashboard</h2>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 flex items-center gap-2 hover:underline"
                title="Logout"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>

            <ul className="space-y-2 text-sm">

              <li
                className="cursor-pointer px-3 py-2 rounded hover:bg-green-100"
                onClick={() => router.push("/")} // redirect to landing page
              >
                Home
              </li>

              <li
                className={`cursor-pointer px-3 py-2 rounded hover:bg-green-100 ${activeTab === "overview" ? "bg-green-200 font-semibold" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </li>

              <li
                className={`cursor-pointer px-3 py-2 rounded hover:bg-green-100 ${activeTab === "orders" ? "bg-green-200 font-semibold" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                Orders ({ordersCount})
              </li>

              <li
                className={`cursor-pointer px-3 py-2 rounded hover:bg-green-100 ${activeTab === "wishlist" ? "bg-green-200 font-semibold" : ""}`}
                onClick={() => setActiveTab("wishlist")}
              >
                Wishlist ({wishlistCount})
              </li>

              <li
                className={`cursor-pointer px-3 py-2 rounded hover:bg-green-100 flex items-center justify-between ${activeTab === "notifications" ? "bg-green-200 font-semibold" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                Notifications
                <span className="bg-red-500 text-white px-2 py-0.5 text-xs rounded-full">{unreadCount}</span>
              </li>

              <li
                className={`cursor-pointer px-3 py-2 rounded hover:bg-green-100 ${activeTab === "password" ? "bg-green-200 font-semibold" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                Change Password
              </li>

              <li className="mt-4">
                <button
                  onClick={() => {
                    revalidateUser();
                    revalidateOrders();
                    revalidateNotifications();
                    toast.success("Refreshing data...");
                  }}
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  Refresh
                </button>
              </li>
            </ul>
          </aside>


          {/* Main Content */}
          <main className="flex lg:pl-[17rem] xl:pr-[6rem] md:py-6 p-4 overflow-y-auto">
            {/* Overview */}
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6 max-w-8xl w-full mx-auto animate-fade-in">
                <h1 className="text-3xl font-bold text-green-700">Profile Overview</h1>

                <Card className="p-6 space-y-6 shadow-lg rounded-2xl border border-gray-200 lg:w-300">
                  {/* Avatar & Basic Info */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <Avatar className="w-28 h-28 border-2 border-gray-300 shadow-md">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt="avatar" />
                      ) : user?.avatar ? (
                        <AvatarImage src={user.avatar} alt="avatar" />
                      ) : (
                        <AvatarFallback className="text-gray-400">No</AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <p className="text-2xl font-semibold text-gray-800">{user?.name || "Guest"}</p>
                      <p className="text-gray-500 text-sm">Email: {user?.email || "-"}</p>
                      <p className="text-gray-500 text-sm">Phone: {user?.phone || "-"}</p>
                      <p className="text-gray-500 text-sm">Address: {user?.address || "-"}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm transition">
                        <Edit2 className="w-4 h-4 text-green-600" /> Change Avatar
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarPick}
                        />
                      </label>

                      <Button
                        onClick={uploadAvatar}
                        disabled={uploadingAvatar}
                        size="sm"
                        variant="default"
                        className="transition"
                      >
                        {uploadingAvatar ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </div>

                  {/* Edit Fields */}
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <Input
                      value={editingProfile.name}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, name: e.target.value })
                      }
                      placeholder="Name"
                      className="rounded-lg border-gray-300 shadow-sm"
                    />
                    <Input
                      value={editingProfile.phone}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, phone: e.target.value })
                      }
                      placeholder="Phone"
                      className="rounded-lg border-gray-300 shadow-sm"
                    />
                    <Input
                      value={editingProfile.address}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, address: e.target.value })
                      }
                      placeholder="Address"
                      className="rounded-lg border-gray-300 shadow-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={saveProfile}
                      disabled={savingProfile}
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 text-white transition"
                    >
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingProfile({
                          name: user?.name || "",
                          phone: user?.phone || user?.meta?.phone || "",
                          address: user?.address || user?.meta?.address || "",
                        });
                        toast("Changes reverted");
                      }}
                      variant="outline"
                      className="hover:bg-gray-100 transition"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </div>
            )}


            {/* Orders */}
            {activeTab === "orders" && (
              <div>
                <h1 className="text-2xl font-bold mb-4 text-green-700">My Orders</h1>

                {loadingOrders ? (
                  <p>Loading orders...</p>
                ) : ordersCount === 0 ? (
                  <p>No orders yet.</p>
                ) : (
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {paginatedOrders.map((order) => (
                      <div
                        key={order._id}
                        className="w-full bg-white rounded-2xl shadow-md px-2 py-4 transform transition hover:-translate-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-xs">Order #{order._id.slice(-6).toUpperCase()}</h3>
                            <p className="text-xs text-gray-500">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold">₦{order.total.toLocaleString()}</p>
                            <p className="text-xs text-gray-600 capitalize">{order.status}</p>
                          </div>
                        </div>

                        <div className="border-t my-2" />

                        <div className="space-y-1">
                          {(order.items || []).slice(0, 2).map((it, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              {it.product?.images?.[0] && (
                                <Image src={it.product?.images?.[0]} width={50} height={50} alt={it.product?.title || "Product"} className="rounded object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="text-[10px] font-medium">{it.product?.title || "Product"}</p>
                                <p className="text-[9px] text-gray-500">Qty: {it.quantity}</p>
                              </div>
                              <p className="text-xs font-semibold">₦{it.price.toLocaleString()}</p>
                            </div>
                          ))}

                          {order.items && order.items.length > 2 && (
                            <p onClick={() => setSelectedOrder(order)} className="text-green-600 text-sm cursor-pointer hover:underline">+{order.items.length - 2} more</p>
                          )}
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <button onClick={() => setSelectedOrder(order)} className="text-xs text-blue-600 hover:underline flex items-center lg:gap-0.5">
                            <ShoppingCart className="w-3 h-3" /> View Details
                          </button>
                          <button onClick={() => handleAddToCart(order.items[0]?.product as Product)} className="px-2 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700">Reorder</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between mt-4">
                  <button
                    disabled={ordersPage === 1}
                    onClick={() => setOrdersPage(prev => prev - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <button
                    disabled={ordersPage * ITEMS_PER_PAGE >= orders.length}
                    onClick={() => setOrdersPage(prev => prev + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

              </div>
            )}

            {/* Wishlist */}
            {activeTab === "wishlist" && (
              <div>
                <h1 className="text-2xl font-bold mb-4 text-green-700">My Wishlist ❤️</h1>

                {wishlistLoading ? (
                  <p>Loading wishlist...</p>
                ) : (wishlist || []).length === 0 ? (
                  <p>No items in wishlist</p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedWishlist.map((item: any) => {
                      const product = item.product || item;
                      return (
                        <div key={product._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-2 hover:shadow-xl transition">
                          <div className="relative w-full h-56">
                            <Image src={product.images?.[0] || "/placeholder.png"} alt={product.title} fill className="object-cover" />
                          </div>
                          <div className="px-4 py-2">
                            <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                            <p className="text-gray-600 font-medium mb-4">₦{product.price?.toLocaleString()}</p>

                            <div className="flex justify-between gap-2">
                              <button className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded" onClick={() => removeFromWishlist(product._id)}>
                                <Trash2 size={16} /> Remove
                              </button>

                              <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded" onClick={() => handleAddToCart(product)}>
                                <ShoppingCart size={16} /> Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  <button
                    disabled={wishlistPage === 1}
                    onClick={() => setWishlistPage(prev => prev - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    disabled={wishlistPage * ITEMS_PER_PAGE >= wishlist.length}
                    onClick={() => setWishlistPage(prev => prev + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div >
                <h1 className="text-2xl font-bold mb-4 text-green-700 flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Notifications
                </h1>

                {loadingNotifications ? (
                  <p>Loading notifications...</p>
                ) : notificationsArr.length === 0 ? (
                  <p>No notifications</p>
                ) : (
                  <ul className="space-y-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-2xl font-bold mb-4 text-green-700 items-center">
                    {paginatedNotifications.map((n) => (
                      <li key={n._id} className={`p-3 rounded shadow ${Array.isArray(n.readBy) && n.readBy.length ? "bg-gray-100" : "bg-yellow-100"}`}>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-sm text-gray-600">{n.message}</p>
                        {!(Array.isArray(n.readBy) && n.readBy.length) && (
                          <button className="text-blue-600 text-xs mt-1 underline" onClick={() => handleMarkNotification(n._id)}>Mark as read</button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-between mt-4">
                  <button
                    disabled={notificationsPage === 1}
                    onClick={() => setNotificationsPage(prev => prev - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    disabled={notificationsPage * ITEMS_PER_PAGE >= notificationsArr.length}
                    onClick={() => setNotificationsPage(prev => prev + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

              </div>
            )}

            {/* Change Password */}
            {activeTab === "password" && (
              <div className="max-w-md">
                <ChangePassword />
              </div>
            )}
          </main>

          {/* Order details modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-semibold mb-4">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {selectedOrder.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 border-b pb-2">
                      {it.product?.images?.[0] && <Image src={it.product.images[0]} alt={it.product?.title || "Product"} width={60} height={60} className="rounded object-cover" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{it.product?.title || "Product"}</p>
                        <p className="text-xs text-gray-500">Qty: {it.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">₦{it.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {selectedOrder.shipping && (
                  <div className="mt-4 text-sm text-gray-700 border-t pt-3">
                    <p><strong>Receiver:</strong> {selectedOrder.shipping.name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shipping.phone}</p>
                    <p><strong>Address:</strong> {selectedOrder.shipping.address}</p>
                  </div>
                )}

                {selectedOrder.trackingUrl && (
                  <a href={selectedOrder.trackingUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm block mt-2">Track shipment</a>
                )}

                <div className="flex justify-between mt-6">
                  <button onClick={() => { /* reorder demo */ toast.success("Reorder placed"); }} className="px-3 py-2 bg-green-600 text-white rounded">Reorder</button>
                  <button onClick={() => setSelectedOrder(null)} className="px-3 py-2 border rounded">Close</button>
                </div>

                <button onClick={() => setSelectedOrder(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
          )}
        </Layout>
      </div>
    </>
  );
}
