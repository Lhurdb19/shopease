"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { sendSMS } from "@/lib/sms";

interface OrderItem {
  product: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  shipping: { name: string; email: string; phone: string; address: string };
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  reference?: string;
  trackingNumber?: string;
  createdAt?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8; // 8 cards per page

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/order/all");
      setOrders(res.data.orders || []);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId);
      const res = await axios.put(`/api/order/update/${orderId}`, { status });

      // Optimistically update UI without refetching everything
      const updatedOrder: Order = res.data.order;
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, ...updatedOrder } : o))
      );

      toast.success("Status updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      setUpdatingId(orderId);
      const res = await axios.put(`/api/order/update/${orderId}`, {
        status: "cancelled",
      });

      const updatedOrder: Order = res.data.order;
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, ...updatedOrder } : o))
      );

      toast.success("Order cancelled!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order");
    } finally {
      setUpdatingId(null);
    }
  };

  // Helpers
  const statusOptions = [
    "pending",
    "paid",
    "processing",
    "shipping",
    "delivered",
    "cancelled",
  ];

  // Filter + search + date range
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order =>
        filterStatus === "all" ? true : order.status === filterStatus
      )
      .filter(order => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          order._id.toLowerCase().includes(q) ||
          order.shipping.name.toLowerCase().includes(q) ||
          order.shipping.email.toLowerCase().includes(q) ||
          (order.reference && order.reference.toLowerCase().includes(q))
        );
      })
      .filter(order => {
        if (!dateFrom && !dateTo) return true;
        if (!order.createdAt) return true;

        const orderDate = new Date(order.createdAt).getTime();
        const from = dateFrom ? new Date(dateFrom).getTime() : null;
        const to = dateTo ? new Date(dateTo).getTime() : null;

        if (from && orderDate < from) return false;
        if (to && orderDate > to + 24 * 60 * 60 * 1000) return false; // include whole day
        return true;
      });
      
  }, [orders, filterStatus, search, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / perPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  useEffect(() => {
    // reset to first page when filters/search change
    setCurrentPage(1);
  }, [filterStatus, search, dateFrom, dateTo]);
  

  return (
    <div className="p-4 light:text-black dark:text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Orders</h1>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto dark:text-white">
          <input
            type="text"
            placeholder="Search by name, email, ID, ref..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-72 dark:text-white"
          />
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {/* Status filter */}
        <div className="flex gap-2 flex-wrap text-black">
          {["all", ...statusOptions].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded text-sm ${
                filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex flex-wrap gap-2 text-black">
          <div className="flex items-center gap-1 dark:text-white">
            <span className="text-sm">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-1 dark:text-white">
            <span className="text-sm">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="text-xs underline"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-10 text-center text-gray-500">
          Loading orders...
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredOrders.length === 0 && (
        <div className="py-10 text-center text-gray-500">
          No orders found for the current filters.
        </div>
      )}

      {/* Orders grid - 4 per row on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-black">
        {paginatedOrders.map(order => (
          <div
            key={order._id}
            className="p-4 border rounded-xl shadow-sm bg-white flex flex-col justify-between"
          >
            {/* Top: basic info */}
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <p className="font-semibold text-sm md:text-base">
                    {order.shipping.name}
                  </p>
                  <p className="text-xs break-all">{order.shipping.email}</p>
                  <p className="text-xs text-gray-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full capitalize ${
                    order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : order.status === "delivered"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-sm font-medium mb-1">
                Total: ₦{order.total.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Payment: {order.paymentMethod} ({order.paymentStatus})
              </p>

              {/* Items summary */}
              <div className="mt-2 border-t pt-2 space-y-1 max-h-28 overflow-y-auto">
                {order.items.map((item, i) => (
                  <p key={i} className="text-xs">
                    <span className="font-medium">{item.product.name}</span>{" "}
                    x {item.quantity} — ₦
                    {(item.price * item.quantity).toLocaleString()}
                  </p>
                ))}
              </div>
            </div>

            {/* Bottom: actions */}
            <div className="mt-3 border-t pt-2 flex flex-col gap-2">
              <select
                value={order.status}
                onChange={e => updateStatus(order._id, e.target.value)}
                disabled={updatingId === order._id}
                className="border px-2 py-1 rounded text-xs"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2">
                {order.status !== "cancelled" && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    disabled={updatingId === order._id}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                  >
                    {updatingId === order._id ? "Updating..." : "Cancel"}
                  </button>
                )}

                {order.trackingNumber && (
                  <a
                    href={`https://tracking.example.com/${order.trackingNumber}`}
                    target="_blank"
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    Track
                  </a>
                )}

                <a
                  href={`/user/orders?order=${order._id}`}
                  className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                >
                  View user view
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 text-black">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
