"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SuperAdminLayout from "@/components/SuperAdminLayout";
import { AppSidebar } from "@/components/app-sidebar";
import { VendorSidebar } from "@/components/vendorSidebar";
import Navbar from "@/components/navbar";
import Footer from "./footer";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { SettingsProvider } from "@/contexts/SettingsContext";
import UserDashboard from "./user/profile";
import ChatWidget from "@/components/ChatWidget";

interface LayoutProps {
  children: ReactNode;
  hideNavFooter?: boolean;
}

export default function Layout({ children, hideNavFooter }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [localVerified, setLocalVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("otpVerified") === "true";
    if (verified) setLocalVerified(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    const otpVerified = session?.user?.otpVerified || localVerified;
    if (session?.user && !otpVerified && router.pathname !== "/auth/verify-otp") {
      router.replace("/auth/verify-otp");
    }
  }, [session, router, status, localVerified]);

  if (status === "loading") return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  const role = session?.user?.role ?? "guest";
  const otpVerified = session?.user?.otpVerified || localVerified;

  if (!otpVerified && router.pathname === "/auth/verify-otp") {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SidebarProvider>
          <main className="flex-1">{children}</main>
          <Toaster position="top-center" />
        </SidebarProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SettingsProvider>
        {role === "superadmin" ? (
          <SuperAdminLayout userName={session?.user?.name ?? "Super Admin"} userEmail={session?.user?.email ?? ""}>
            {children}
            <Toaster position="top-center" />
          </SuperAdminLayout>

        ) : role === "admin" ? (
          <SidebarProvider>
            <div className="flex">
              {otpVerified && <AppSidebar />}
              {otpVerified && <SidebarTrigger />}
              <main className="flex-1 p-6">{children}</main>
            </div>
            <Toaster position="top-center" />
          </SidebarProvider>
        ) : role === "vendor" ? (
          <SidebarProvider>
            <div className="flex">
              {otpVerified && <VendorSidebar />}
              {otpVerified && <SidebarTrigger />}
              <main className="flex-1 p-6">{children}</main>
            </div>
            <Toaster position="top-center" />
          </SidebarProvider>
        ) : (
          <div className="min-h-screen flex flex-col">
            {!hideNavFooter && <Navbar />}
            <main className="flex-1">{children}</main>
            {/* {hideNavFooter && <UserDashboard/>} */}
            {/* <Toaster position="top-center" /> */}
            <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
            <Script src="https://checkout.flutterwave.com/v3.js" strategy="beforeInteractive" />
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
            <ChatWidget/>
            {!hideNavFooter && <Footer />}
          </div>
        )}
      </SettingsProvider>
    </ThemeProvider>
  );
}
