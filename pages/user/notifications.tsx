"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Circle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical";
  createdAt: string;
  read: boolean;
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"unread" | "read">("unread");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(
          data.notifications.map((n: any) => ({
            ...n,
            read: n.readBy?.includes(data.userId),
          }))
        );
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    tab === "read" ? n.read : !n.read
  );

  const totalPages = Math.ceil(filteredNotifications.length / pageSize);
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="p-6 lg:px-20">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" /> Notifications
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setPage(1); }}>
            <TabsList className="mb-4">
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <div key={i} className="space-y-1 mb-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))
              ) : paginatedNotifications.length === 0 ? (
                <p className="text-gray-500">No {tab} notifications.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {paginatedNotifications.map((n) => (
                    <li key={n._id} className="py-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div
                            className={`flex justify-between items-start p-2 ${
                              !n.read ? "bg-blue-50" : ""
                            } rounded-lg`}
                            onClick={() => !n.read && markAsRead(n._id)}
                          >
                            <div className="flex items-center gap-2">
                              {!n.read && <Circle className="h-2 w-2 text-blue-600" />}
                              <p className="font-medium text-gray-800">{n.title}</p>
                            </div>
                            <p className="text-xs text-gray-400">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{n.title}</DialogTitle>
                          </DialogHeader>
                          <p className="mt-2 text-gray-700">{n.message}</p>
                          <div className="mt-4 flex justify-end">
                            <Button onClick={() => {}} variant="default">
                              Close
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </li>
                  ))}
                </ul>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Prev
                  </Button>
                  <span className="px-2 py-1">{page} / {totalPages}</span>
                  <Button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
