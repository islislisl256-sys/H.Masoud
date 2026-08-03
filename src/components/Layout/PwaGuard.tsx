"use client";

import React, { useEffect, useState } from "react";
import { Download, Library, Smartphone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PwaGuard({ children }: { children: React.ReactNode }) {
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Catch the install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      alert("لتثبيت التطبيق على الآيفون: اضغط على زر 'المشاركة' في الأسفل ثم اختر 'إضافة للشاشة الرئيسية' (Add to Home Screen).");
    } else {
      alert("التطبيق مثبت بالفعل أو أن متصفحك لا يدعم التثبيت المباشر. جرب الإضافة للشاشة الرئيسية من القائمة.");
    }
  };

  // While checking, show nothing or a loader
  if (isStandalone === null) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  // If already installed and opened as app, render children normally
  if (isStandalone) {
    return <>{children}</>;
  }

  // If in browser, show the locked landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 relative z-10"
      >
        <div className="w-24 h-24 bg-gradient-to-tr from-primary to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/30 mb-6">
          <Library className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          مكتبة الحاج مسعود
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          نظام إدارة المكتبة والمبيعات متوفر حصرياً عبر التطبيق المخصص. يرجى التثبيت للتمكن من الدخول بأمان.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95"
          >
            <Download className="w-5 h-5" />
            تثبيت التطبيق الآن
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-6">
            <ShieldCheck className="w-4 h-4" />
            <span>تطبيق آمن ومشفر</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
