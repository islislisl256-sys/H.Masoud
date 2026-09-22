"use client";

import React from "react";
import Link from "next/link";
import { LogOut, User, Moon, Sun, Menu, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";

export default function Header() {
  const { logout, currentUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'LEADER': return 'المالك (القائد)';
      case 'MANAGER': return 'مدير';
      case 'SELLER': return 'بائع';
      case 'SUPERADMIN': return 'مسؤول النظام';
      default: return 'مستخدم';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-end px-4 sm:px-6 z-10 shadow-sm">
      <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                import('react-hot-toast').then(({ default: toast }) => {
                  toast("دعم اللغات المتعددة سيكون متاحاً قريباً!", { icon: "🌍" });
                });
              }
            }}
            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Change language"
          >
            <Globe className="h-5 w-5" />
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {mounted && resolvedTheme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>
        
        <Link href="/settings" className="flex items-center gap-3 border-r pr-2 sm:pr-4 border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{currentUser?.full_name || currentUser?.store_name || "مستخدم"}</span>
            <span className="text-xs text-primary">{getRoleLabel(currentUser?.role)}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm overflow-hidden">
            <img src={currentUser?.store_logo || '/logo.png'} alt="Profile" className="h-full w-full object-cover" />
          </div>
        </Link>

        <button
          onClick={logout}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors flex items-center gap-2"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:block text-sm font-medium">خروج</span>
        </button>
      </div>
    </header>
  );
}
