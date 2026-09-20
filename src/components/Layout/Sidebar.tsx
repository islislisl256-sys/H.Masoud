"use client";

import React, { useState } from "react";
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
  FileEdit,
  Undo2,
  Mail
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/contexts/AuthContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: "Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…", href: "/", icon: LayoutDashboard },
  { name: "Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª", href: "/products", icon: Package },
  { name: "Ù†Ù‚Ø·Ø© Ø§Ù„Ø¨ÙŠØ¹", href: "/pos", icon: ShoppingCart },
  { name: "Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø§Øª", href: "/returns", icon: Undo2 },
  { name: "Ø§Ù„ÙÙˆØ§ØªÙŠØ±", href: "/invoices", icon: FileText },
  { name: "Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª", href: "/settings", icon: Settings },
  { name: "Ø§ØªØµÙ„ Ø¨Ù†Ø§", href: "/contact", icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className={cn("hidden md:flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full shadow-sm transition-all duration-300 relative", isCollapsed ? "w-20" : "w-64")}>
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="focus:outline-none p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
          {currentUser?.store_logo ? (
            <img src={currentUser.store_logo} alt="Logo" className={cn("h-8 w-8 rounded-lg object-contain bg-white transition-all duration-300", !isCollapsed && "ml-2")} />
          ) : (
            <BookOpen className={cn("h-6 w-6 text-primary transition-all duration-300", !isCollapsed && "ml-2")} />
          )}
        </button>
        {!isCollapsed && <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap animate-in fade-in duration-300 truncate pr-2 max-w-[150px]">{currentUser?.store_name || "حانوتك"}</span>}
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navigation.filter(item => {
            if (currentUser?.role === 'SELLER') {
              return ['Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª', 'Ù†Ù‚Ø·Ø© Ø§Ù„Ø¨ÙŠØ¹', 'Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª'].includes(item.name);
            }
            return true;
          }).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                  "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors", isCollapsed && "justify-center"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                    "flex-shrink-0 h-5 w-5 transition-all duration-300", !isCollapsed && "ml-3"
                  )}
                  aria-hidden="true"
                />
                {!isCollapsed && <span className="whitespace-nowrap animate-in fade-in duration-300">{item.name}</span>}
              </Link>
            );
          })}
        
  <Link href="/download"  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/download' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
    <span>ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…</span>
  </Link>

        </nav>
      </div>
    </div>
  );
}
