"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Cloud, Image as ImageIcon, HardDrive, CheckCircle2, AlertTriangle, ArrowRight, Trash2, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getCloudinaryCloudName, getCloudinaryApiKey, getCloudinaryApiSecret, getCloudinaryMaxImages } from "@/lib/cloudinaryConfig";

export default function CloudStatsPage() {
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const [images, setImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      fetchImages();
    }
  }, [currentUser]);

  const fetchImages = async () => {
    setLoadingImages(true);
    setError(null);
    try {
      let data;
      const cloudName = getCloudinaryCloudName(currentUser);
      const apiKey = getCloudinaryApiKey(currentUser);
      const apiSecret = getCloudinaryApiSecret(currentUser);

      // Try local API route first (works on Vercel)
      const res = await fetch('/api/cloudinary/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret
        })
      });
      
      if (res.status === 404) {
        // Fallback to direct Admin API for Desktop/Capacitor apps (no CORS in native apps)
        const auth = btoa(`${apiKey}:${apiSecret}`);
        const directRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500`, {
          headers: { 'Authorization': `Basic ${auth}` }
        });
        data = await directRes.json();
      } else {
        data = await res.json();
      }

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
      let result;
      const cloudName = getCloudinaryCloudName(currentUser);
      const apiKey = getCloudinaryApiKey(currentUser);
      const apiSecret = getCloudinaryApiSecret(currentUser);

      // Try local API route first (works on Vercel)
      const res = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: public_id,
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret
        })
      });
      
      if (res.status === 404) {
        // Fallback to direct Admin API for Desktop/Capacitor apps
        const auth = btoa(`${apiKey}:${apiSecret}`);
        const directRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?public_ids[]=${encodeURIComponent(public_id)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Basic ${auth}` }
        });
        result = await directRes.json();
        // Standardize output for direct API
        if (result.deleted && result.deleted[public_id] === 'deleted') {
          result = { result: 'ok' };
        }
      } else {
        result = await res.json();
      }

      if (result.result === 'ok') {
        setImages(prev => prev.filter(img => img.public_id !== public_id));
        // Decrement storage counter
        const used = currentUser.storage_used || 0;
        const newUsed = Math.max(0, used - 1);
        await supabase.from("fortress_users").update({ storage_used: newUsed }).eq("id", currentUser.id);
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

  const maxImages = getCloudinaryMaxImages(currentUser);
  const currentImages = images.length;
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">استهلاك الباقة المجانية</h2>
                <p className="text-gray-500 dark:text-gray-400">نسبة الاستهلاك من العرض المجاني</p>
              </div>
              <div className="text-right">
                <span className={`text-4xl font-black ${isLimitReached ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-primary'}`} dir="ltr">{percentage.toFixed(2)}%</span>
              </div>
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">معرض الصور السحابي</h2>
              <button onClick={fetchImages} disabled={loadingImages} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loadingImages ? 'animate-spin' : ''}`} />
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
                  <div key={img.public_id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <img src={img.secure_url} alt="" className="w-full h-full object-cover" />
                    
                    <button 
                      onClick={() => handleDelete(img.public_id)}
                      disabled={deletingId === img.public_id}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 shadow-md text-white rounded-lg transition-colors disabled:opacity-50 z-10 flex items-center justify-center"
                      title="مسح الصورة"
                    >
                      {deletingId === img.public_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs truncate">
                      {img.public_id.split('/').pop()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </ProtectedLayout>
  );
}
