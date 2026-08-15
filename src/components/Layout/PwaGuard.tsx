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
      const isElectronProtocol = typeof window !== 'undefined' && (window.location.protocol === 'app:' || window.location.protocol === 'file:');
      const isElectronPreload = typeof window !== 'undefined' && (window as any).isElectronApp === true;
      const isElectronUrlParam = typeof window !== 'undefined' && window.location.search.includes('electron=true');
      
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true ||
                               isElectronProtocol || isElectronPreload || isElectronUrlParam;
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

  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
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
          نظام إدارة المكتبة والمبيعات متوفر حصرياً عبر التطبيق المخصص. اختر نظام جهازك للتثبيت.
        </p>

        <div className="space-y-3">
          {/* Android Button */}
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-green-600/25 transition-all active:scale-95"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.34a.5.5 0 0 0 .5-.5v-5.18a.5.5 0 0 0-.5-.5h-.5V6.5A4.5 4.5 0 0 0 12.523 2h-1.046A4.5 4.5 0 0 0 6.977 6.5v2.66h-.5a.5.5 0 0 0-.5.5v5.18a.5.5 0 0 0 .5.5h.5v1.16a1.5 1.5 0 0 0 1.5 1.5h.5v2.5a1 1 0 0 0 2 0v-2.5h2.046v2.5a1 1 0 0 0 2 0v-2.5h.5a1.5 1.5 0 0 0 1.5-1.5v-1.16h.5zM8.977 6.5A2.5 2.5 0 0 1 11.477 4h1.046a2.5 2.5 0 0 1 2.5 2.5v2.66H8.977V6.5zM4.977 10.16a1 1 0 0 1 2 0v3.18a1 1 0 0 1-2 0v-3.18zm14.046 0a1 1 0 0 1 2 0v3.18a1 1 0 0 1-2 0v-3.18z"/>
            </svg>
            تثبيت تطبيق الأندرويد
          </button>

          {/* iPhone Button */}
          <button
            onClick={() => setShowIOSInstructions(!showIOSInstructions)}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-gray-800/25 transition-all active:scale-95"
          >
            <Smartphone className="w-5 h-5" />
            تثبيت تطبيق الآيفون
          </button>
        </div>

        {/* iOS Instructions Panel */}
        {showIOSInstructions && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-5 rounded-xl text-sm leading-relaxed mt-4 border border-blue-200 dark:border-blue-800"
          >
            <p className="font-bold mb-3 text-base">خطوات تثبيت التطبيق على الآيفون:</p>
            <ol className="text-right list-decimal list-inside space-y-2">
              <li>افتح هذا الرابط في متصفح <strong>Safari</strong>.</li>
              <li>اضغط على زر <strong>المشاركة</strong> (المربع الذي يخرج منه سهم للأعلى) في أسفل الشاشة.</li>
              <li>مرر لأسفل واختر <strong>إضافة للشاشة الرئيسية (Add to Home Screen)</strong>.</li>
              <li>اضغط <strong>إضافة</strong> وسيظهر التطبيق على شاشتك الرئيسية.</li>
            </ol>
          </motion.div>
        )}
          
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-6">
          <ShieldCheck className="w-4 h-4" />
          <span>تطبيق آمن ومشفر</span>
        </div>
      </motion.div>
    </div>
  );
}
