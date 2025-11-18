"use client";

import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  User2,
  ChevronsUpDown,
  ChevronUp,
  CarTaxiFront,
  Upload,
  LockKeyhole,
  Network,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation"; // ✅ For detecting active route
import Image from "next/image";
import { useSettings } from "@/contexts/SettingsContext";

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [role, setRole] = useState<string>("Admin");
  const { settings } = useSettings();

  useEffect(() => {
    if (session?.user?.role) {
      setRole(
        session.user.role.charAt(0).toUpperCase() +
        session.user.role.slice(1)
      );
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  // Sidebar navigation links
  const items = [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Manage Deliveries", url: "/admin/deliveries", icon: Truck },
    { title: "Upload Products", url: "/admin/upload-products", icon: Upload },
    { title: "Track Packages", url: "/admin/packages", icon: Package },
    { title: "Manage Users", url: "/admin/users", icon: Users },
    { title: "Orders History", url: "/admin/orders", icon: ClipboardList },
    { title: "Reports & Analytics", url: "/admin/reports", icon: BarChart3 },
    { title: "Notifications", url: "/admin/notifications", icon: Bell },
    { title: "Blogs", url: "/admin/blog", icon: Network },
    { title: "Settings", url: "/admin/settings", icon: Settings },
    { title: "Update Password", url: "/changepassword-form", icon: LockKeyhole },
  ];

  return (
    <Sidebar collapsible="icon">
      {/* ===== Header ===== */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              {/* ✅ Dynamic Logo */}
                <Link href="/" className="flex items-center gap-2">
                  {settings?.logo ? (
                    <Image
                      src={settings.logo}
                      alt={settings.siteName || "Logo"}
                      width={200}
                      height={200}
                      className="rounded-md object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                      <span className="text-green-600">Shop</span>Ease
                    </span>
                  )}
                  {!settings?.logo && <span className="sr-only">{settings?.siteName || "ShopEase"}</span>}
                </Link>
              <DropdownMenuTrigger asChild className="w-full">
                <SidebarMenuButton>
                  {role}
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/admin/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/admin/notifications">Notifications</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ===== Main Sidebar Content ===== */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname.startsWith(item.url); // ✅ highlight active

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${isActive
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {/* Dark / Light Mode Toggle */}
            <div className="mt-4">
              <ModeToggle />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ===== Footer ===== */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  <span className="ml-2">{session?.user?.name || "Admin"}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top">
                <DropdownMenuItem>
                  <Link href="/admin/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/admin/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
