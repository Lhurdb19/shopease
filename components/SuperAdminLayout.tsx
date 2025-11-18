"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Home,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  Bell,
  Text,
  Logs,
  Table,
  AppWindowMacIcon,
  User2,
  Newspaper,
  LockKeyhole,
  Contact,
  UserCircle,
  Inbox,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useSettings } from "@/contexts/SettingsContext";

interface Props {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export default function SuperAdminLayout({ children, userName }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { settings } = useSettings();

  useEffect(() => {
    // Simulate loading delay (e.g., fetching session or user data)
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const links = [
    { href: "/superadmin/dashboard", label: "Dashboard", icon: Home },
    { href: "/superadmin/manage-admins", label: "Manage Admins", icon: User2 },
    { href: "/superadmin/addadmindialog", label: "Add Admin Dialog", icon: AppWindowMacIcon },
    { href: "/superadmin/manage-users", label: "Manage Users", icon: Users },
    { href: "/superadmin/roles", label: "Roles & Permissions", icon: ShieldCheck },
    { href: "/superadmin/settings", label: "System Settings", icon: Settings },
    { href: "/superadmin/usertable", label: "User Table", icon: Table },
    { href: "/superadmin/logs", label: "Audit Logs", icon: Logs },
    { href: "/superadmin/notifications", label: "Notifications", icon: Bell },
    { href: "/superadmin/reports", label: "Reports & Analytics", icon: Text },
    // { href: "/superadmin/payment-methods", label: "Payment Methods", icon: Text },
    {href: "/superadmin/newsletter", label: "Newsletter Subscribers", icon: Newspaper },
    {href: "/superadmin/about", label: "About Us", icon: UserCircle },
    {href: "/superadmin/contact", label: "Contact Info", icon: Contact },
    {href: "/superadmin/email", label: "Email Templates", icon: Inbox },
    {href: "/changepassword-form", label: "Update Password", icon: LockKeyhole },
  ];

  if (loading) {
    // 🌟 Skeleton Loading Layout
    return (
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-black">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white dark:bg-gray-900 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 mb-4" />
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
          <div className="mt-auto">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="bg-red-600 dark:bg-red-800 p-4">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 🧩 Actual Layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-black text-gray-800 dark:text-white transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar
          collapsible="icon"
          className={cn(
            "bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-sm transition-all duration-300 ease-in-out",
            collapsed ? "w-20" : "w-64"
          )}
        >
           {/* ✅ Logo / Header */}
          <SidebarHeader className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-800">
            {settings?.logo ? (
              <Image
                src={settings.logo}
                alt={settings.siteName || "Admin Logo"}
                width={120}
                height={40}
                className="object-contain"
              />
            ) : (
              <h1 className="text-lg font-semibold text-blue-500 dark:text-blue-400">SuperAdmin</h1>
            )}
          </SidebarHeader>

          {/* Sidebar Links */}
          <SidebarContent className="mt-4 flex-1 flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    "hover:bg-gray-200 dark:hover:bg-gray-700",
                    active ? "bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
            <div className="mt-4 px-4">{!collapsed && <ModeToggle />}</div>
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full transition-colors duration-300">
          <header className="bg-red-600 dark:bg-red-800 border-b p-4 flex items-center justify-between shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-3">
              <SidebarTrigger onClick={() => setCollapsed(!collapsed)} className="top-4 right-4">
                <Menu size={20} />
              </SidebarTrigger>
              <SidebarTrigger onClick={() => setCollapsed(!collapsed)} className="md:hidden">
                <Menu size={22} className="text-white" />
              </SidebarTrigger>
              <h2 className="text-lg font-semibold text-white">
                Welcome, {userName || "SuperAdmin"}
              </h2>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
