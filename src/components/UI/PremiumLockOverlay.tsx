"use client";

import React from "react";
import { Lock, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: React.ReactNode;
  featureName: string;
  isInline?: boolean; // If true, it just overlays the component instead of the whole page
};

export default function PremiumLockOverlay({ children, featureName, isInline = false }: Props) {
  const { currentUser } = useAuth();

  // If user is PREMIUM, just render the content normally
  if (currentUser?.plan_tier === 'PREMIUM') {
    return <>{children}</>;
  }

  // Otherwise, render the locked version
  return (
    <div className={`relative ${isInline ? 'w-full h-full' : 'w-full h-full min-h-[60vh]'} rounded-xl overflow-hidden`}>
      {/* Blurry background of the actual content */}
      <div className="absolute inset-0 filter blur-sm opacity-50 pointer-events-none select-none">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/5 dark:bg-gray-900/40 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700"
        >
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center shadow-lg mb-6">
            <Crown className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ميزة مميزة (Premium)
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            عذراً، ميزة <span className="font-bold text-primary">{featureName}</span> متاحة فقط في الباقة المميزة. يرجى ترقية حسابك للوصول إليها.
          </p>

          <button 
            disabled
            className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            حسابك الحالي: باقة عادية
          </button>
        </motion.div>
      </div>
    </div>
  );
}
