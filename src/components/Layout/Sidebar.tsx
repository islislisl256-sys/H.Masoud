"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Settings,
  BookOpen,
  FileEdit
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "المنتجات", href: "/products", icon: Package },
  { name: "نقطة البيع", href: "/pos", icon: ShoppingCart },
  { name: "سجل المبيعات", href: "/invoices", icon: FileText },
  { name: "فواتير مخصصة", href: "/custom-invoices", icon: FileEdit },
  { name: "الإعدادات", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full shadow-sm">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <BookOpen className="h-6 w-6 text-primary ml-2" />
        <span className="text-lg font-bold text-gray-900 dark:text-white">مكتبة الحاج مسعود</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                  "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                    "flex-shrink-0 ml-3 h-5 w-5"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
