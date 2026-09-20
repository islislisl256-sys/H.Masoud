import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { BarcodeProvider } from "@/contexts/BarcodeContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import PwaGuard from "@/components/Layout/PwaGuard";

import { Toaster } from "react-hot-toast";

const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "حانوتك",
  description: "نظام إدارة حانوتك",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "حانوتك"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PwaGuard>
            <AuthProvider>
              <BarcodeProvider>
                <Toaster position="top-center" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white font-bold' }} />
                {children}
              </BarcodeProvider>
            </AuthProvider>
          </PwaGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
