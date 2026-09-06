"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Cloud, Image as ImageIcon, HardDrive, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CloudStatsPage() {
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !currentUser) return null;

  const maxImages = 100;
  const currentImages = currentUser.storage_used || 0;
  const percentage = Math.min((currentImages / maxImages) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isLimitReached = percentage >= 100;

  return (
    <ProtectedLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">إحصائيات التخزين السحابي</h1>
            <p className="text-muted-foreground mt-1">تفاصيل استهلاك مساحة الصور المرفوعة (Cloudinary)</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Cloud className="w-48 h-48" />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">استهلاك الباقة المجانية</h2>
                    <p className="text-gray-500 dark:text-gray-400">يتم ضغط جميع الصور تلقائياً قبل رفعها لتوفير المساحة وتريع التطبيق</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-primary">{currentImages}</span>
                    <span className="text-xl text-gray-400"> / {maxImages}</span>
                    <p className="text-sm font-bold text-gray-500 mt-1">صورة</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className={isLimitReached ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-green-500"}>
                      المستهلك: {percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-500">
                      المتبقي: {Math.max(maxImages - currentImages, 0)} صورة
                    </span>
                  </div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${isLimitReached ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 h-fit">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">جودة الصور</h3>
                  <p className="text-sm text-gray-500 mt-1">نظام ضغط ذكي يحافظ على جودة الصورة مع تقليل حجمها بنسبة تصل إلى 70%</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl shrink-0 h-fit">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">إدارة المساحة</h3>
                  <p className="text-sm text-gray-500 mt-1">يتم استبدال الصور القديمة في الإعدادات تلقائياً دون استهلاك مساحة إضافية</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">معلومات الباقة</h3>
            
            <ul className="space-y-4 flex-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">باقة مجانية (100 صورة)</p>
                  <p className="text-xs text-gray-500 mt-0.5">الباقة الحالية مفعلة</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">ضغط الصور التلقائي</p>
                  <p className="text-xs text-gray-500 mt-0.5">مفعل على جميع المنتجات والشعارات</p>
                </div>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">باقة غير محدودة</p>
                  <p className="text-xs text-gray-500 mt-0.5">تتطلب الترقية للحساب المدفوع</p>
                </div>
              </li>
            </ul>

            <Link href="/contact" className="mt-6 w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-bold transition-colors text-center">
              ترقية الباقة
            </Link>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
