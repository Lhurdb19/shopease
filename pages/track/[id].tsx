"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function TrackOrder({ params }: any) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    axios.get(`/api/order/${params.id}`).then(res => setOrder(res.data.order));
  }, []);

  if (!order) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Tracking Order #{order._id}</h1>

      <p>Status: <b>{order.status}</b></p>
      <p>Tracking Number: {order.trackingNumber || "Not assigned"}</p>

      <h2 className="text-lg font-semibold mt-6">Order Timeline</h2>
      <ul className="mt-2 border-l pl-4 space-y-3">
        {order.history.map((h: any, i: number) => (
          <li key={i}>
            <p className="font-semibold">{h.status}</p>
            <p className="text-sm text-gray-600">{h.message}</p>
            <p className="text-xs">{new Date(h.timestamp).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
