"use client";

import React, { useState, useEffect } from "react";
import { LogOut, User, Moon, Sun, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
      <div className="flex items-center md:hidden">
        <button type="button" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-2 -ml-2 rounded-md">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex-1 flex justify-end items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        <div className="flex items-center gap-3 border-r pr-4 border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-gray-900 dark:text-white">HERMA</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">مسؤول النظام</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
        </div>

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
