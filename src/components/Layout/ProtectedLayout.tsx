"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ChatNotificationsManager from "../ChatNotificationsManager";
import { showPermissionToast } from "../CustomToasts";
import { AnimatePresence, motion } from "framer-motion";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser, licenseWarning, renewLicense } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && pathname !== "/login" && pathname !== "/setup") {
      router.push("/login");
    } else if (isAuthenticated && currentUser && !currentUser.setup_completed && pathname !== "/setup") {
      router.push("/setup");
    } else if (isAuthenticated && currentUser?.role === 'SELLER') {
      // البائع مسموح له فقط بـ: المنتجات، نقطة البيع، والإعدادات
      const restrictedForSeller = ['/', '/statistics', '/cloud-stats', '/returns', '/invoices'];
      if (restrictedForSeller.includes(pathname)) {
        router.push('/pos');
      }
    }
  }, [isAuthenticated, currentUser, pathname, router]);

    useEffect(() => {
    if (mounted && isAuthenticated && currentUser) {
      // Check if permissions are granted. Only show if 'default' (not yet asked)
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default' && !sessionStorage.getItem('perm_toast_shown')) {
          showPermissionToast();
          sessionStorage.setItem('perm_toast_shown', 'true');
        }
      }
    }
  }, [mounted, isAuthenticated, currentUser]);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  if (currentUser && !currentUser.setup_completed) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Header />
        {licenseWarning && (
          <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between gap-3 text-sm font-bold shadow-md z-50">
            <span>{licenseWarning}</span>
            <button
              onClick={async () => {
                const res = await renewLicense();
                if (res.success) {
                  alert("✅ " + res.message);
                } else {
                  alert(res.message);
                }
              }}
              className="shrink-0 bg-white text-amber-600 px-4 py-1.5 rounded-lg font-bold hover:bg-amber-50 transition-colors"
            >
              تجديد الآن
            </button>
          </div>
        )}
        <ChatNotificationsManager />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
