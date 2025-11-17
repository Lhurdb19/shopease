"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Truck,
  ShoppingCart,
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface Product {
  _id?: string;
  name?: string;
  image?: string;
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
    name: string;
    phone: string;
    address: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const ordersPerPage = 6;

  // Fetch orders
  useEffect(() => {
    if (status === "authenticated") fetchOrders();
  }, [status]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get<Order[]>("/api/order");
      setOrders(res.data);
    } catch (error) {
      toast.error("Failed to load orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((order) => order.status === filter);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ordersPerPage
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleReorder = (order: Order) => {
    toast.success(`Reorder placed for ${order.items.length} items`);
  };

  const handleTrack = (order: Order) => {
    if (!order.trackingNumber) {
      toast.error("Tracking not available yet.");
      return;
    }
    // Redirect to tracking page
    window.location.href = `/track/${order._id}`;
  };

  if (status === "loading" || loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );

  if (!session)
    return (
      <div className="text-center py-20">
        <p className="text-gray-700 text-lg">Please log in to view your orders.</p>
      </div>
    );

  if (!orders.length)
    return (
      <div className="text-center py-20">
        <Package className="mx-auto w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-700 text-lg font-medium">You have no orders yet.</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Toaster richColors position="top-right" />

      {/* Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800">My Orders</h1>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipping">Shipping</option>
          <option value="delivered">Delivered</option>
          <option value="received">Received</option>
          <option value="cod_pending">COD Pending</option>
          <option value="cod_on_delivery">COD On Delivery</option>
          <option value="cod_delivered">COD Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium text-gray-800">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h2>
                {order.status === "completed" ? (
                  <CheckCircle className="text-green-500 w-5 h-5" />
                ) : order.status === "cancelled" ? (
                  <XCircle className="text-red-500 w-5 h-5" />
                ) : (
                  <Clock className="text-yellow-500 w-5 h-5" />
                )}
              </div>

              <p className="text-sm text-gray-500 mb-2">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </p>

              <div className="border-t border-gray-200 my-3" />

              <div className="space-y-3">
                {order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {item.product?.image && (
                      <Image
                        src={item.product.image}
                        alt={item.product?.name || "Product"}
                        width={60}
                        height={60}
                        className="rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {item.product?.name || "Product"}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 text-sm cursor-pointer hover:underline"
                  >
                    +{order.items.length - 2} more items
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 border-t pt-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Total:</span> ₦{order.total.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`${
                    order.status === "completed"
                      ? "text-green-600"
                      : order.status === "cancelled"
                      ? "text-red-600"
                      : "text-yellow-600"
                  } font-semibold capitalize`}
                >
                  {order.status}
                </span>
              </p>
              <div className="flex justify-between mt-3">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Order #{selectedOrder._id.slice(-6).toUpperCase()}
            </h2>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 border-b pb-2">
                  {item.product?.image && (
                    <Image
                      src={item.product.image}
                      alt={item.product?.name || "Product"}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {selectedOrder.shipping && (
              <div className="mt-4 text-sm text-gray-700 border-t pt-3">
                <p>
                  <strong>Receiver:</strong> {selectedOrder.shipping.name}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrder.shipping.phone}
                </p>
                <p>
                  <strong>Address:</strong> {selectedOrder.shipping.address}
                </p>
              </div>
            )}

            {/* Tracking info */}
            {selectedOrder.trackingNumber && (
              <p className="text-sm text-gray-700 mt-3">
                <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
              </p>
            )}
            {selectedOrder.trackingUrl && (
              <a
                href={selectedOrder.trackingUrl}
                target="_blank"
                className="text-blue-600 underline text-sm block mt-1"
              >
                Track Shipment on courier website
              </a>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-5">
              <button
                onClick={() => handleReorder(selectedOrder)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <ShoppingCart className="w-4 h-4" /> Reorder
              </button>
              <button
                onClick={() => handleTrack(selectedOrder)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Truck className="w-4 h-4" /> Track Timeline
              </button>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
