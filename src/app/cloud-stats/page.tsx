"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Cloud, Image as ImageIcon, HardDrive, CheckCircle2, AlertTriangle, ArrowRight, Trash2, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function CloudStatsPage() {
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const [images, setImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (currentUser?.cloudinary_api_key && currentUser?.cloudinary_api_secret) {
      fetchImages();
    }
  }, [currentUser]);

  const fetchImages = async () => {
    setLoadingImages(true);
    setError(null);
    try {
      const res = await fetch('/api/cloudinary/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloud_name: currentUser.cloudinary_cloud_name,
          api_key: currentUser.cloudinary_api_key,
          api_secret: currentUser.cloudinary_api_secret
        })
      });
      const data = await res.json();
      if (data.resources) {
        setImages(data.resources);
      } else if (data.error) {
        setError(data.error.message || data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDelete = async (public_id: string) => {
    if (!confirm("هل أنت متأكد من مسح هذه الصورة نهائياً؟")) return;
    setDeletingId(public_id);
    try {
      const res = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: public_id,
          cloud_name: currentUser.cloudinary_cloud_name,
          api_key: currentUser.cloudinary_api_key,
          api_secret: currentUser.cloudinary_api_secret
        })
      });
      
      const result = await res.json();
      if (result.result === 'ok') {
        setImages(prev => prev.filter(img => img.public_id !== public_id));
        // Decrement storage counter
        const used = currentUser.storage_used || 0;
        const newUsed = Math.max(0, used - 1);
        await supabase.from("app_accounts").update({ storage_used: newUsed }).eq("id", currentUser.id);
        const updatedUser = { ...currentUser, storage_used: newUsed };
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      } else {
        alert("فشل مسح الصورة: " + JSON.stringify(result));
      }
    } catch (err: any) {
      alert("حدث خطأ: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted || !currentUser) return null;

  const maxImages = 100;
  const currentImages = currentUser.storage_used || 0;
  const percentage = Math.min((currentImages / maxImages) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isLimitReached = percentage >= 100;

  const hasApiKeys = !!(currentUser.cloudinary_api_key && currentUser.cloudinary_api_secret);

  return (
    <ProtectedLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">إدارة مساحة التخزين</h1>
            <p className="text-muted-foreground mt-1">التحكم في الصور المرفوعة (Cloudinary)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Cloud className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">استهلاك الباقة</h2>
                <p className="text-gray-500 dark:text-gray-400">تحكم بالصور لتقليل الاستهلاك</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-primary">{currentImages}</span>
                <span className="text-xl text-gray-400"> / {maxImages}</span>
                <p className="text-sm font-bold text-gray-500 mt-1">صورة مستخدمة</p>
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
                  animate={{ width: ${percentage}% }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={h-full rounded-full }
                />
              </div>
            </div>
          </div>
        </div>

        {!hasApiKeys ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">لم يتم إعداد مفاتيح API</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">لعرض الصور ومسحها مباشرة من هنا، يجب إدخال API Key و API Secret في صفحة الإعدادات.</p>
            </div>
            <Link href="/settings" className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              الذهاب للإعدادات
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">معرض الصور السحابي</h2>
              <button onClick={fetchImages} disabled={loadingImages} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                <RefreshCw className={w-4 h-4 } />
                تحديث
              </button>
            </div>
            
            {loadingImages ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : error ? (
              <div className="py-8 text-center text-red-500 font-bold">{error}</div>
            ) : images.length === 0 ? (
              <div className="py-12 text-center text-gray-500">لا توجد صور في مساحتك السحابية.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map(img => (
                  <div key={img.public_id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <img src={img.secure_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleDelete(img.public_id)}
                        disabled={deletingId === img.public_id}
                        className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors disabled:opacity-50"
                        title="مسح نهائي"
                      >
                        {deletingId === img.public_id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs truncate">
                      {img.public_id.split('/').pop()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
