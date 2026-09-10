"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Save, Lock, Store, UploadCloud, Loader2, Undo2, Mail, Link2, Cloud, LogIn, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { mainSupabase } from "@/lib/supabase";
import { compressImage } from "@/lib/imageUtils";
import { getCloudinaryCloudName, getCloudinaryUploadPreset, getCloudinaryApiKey, getCloudinaryApiSecret, getCloudinaryMaxImages } from "@/lib/cloudinaryConfig";
import CloudinarySetupModal from "@/components/Modals/CloudinarySetupModal";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth();

  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [username, setUsername] = useState("");
  
  const [cloudName, setCloudName] = useState("");
  const [uploadPreset, setUploadPreset] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [compressionQuality, setCompressionQuality] = useState(0.7);
  const [maxImages, setMaxImages] = useState(currentUser?.cloudinary_max_images ?? 100);
  const [showAdvancedCloud, setShowAdvancedCloud] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      setStoreName(currentUser.store_name || "مكتبة الحاج مسعود");
      setStoreLogo(currentUser.store_logo || "");
      setUsername(currentUser.name || "HERMA");
      setCloudName(currentUser.cloudinary_cloud_name || "");
      setUploadPreset(currentUser.cloudinary_upload_preset || "");
      setApiKey(currentUser.cloudinary_api_key || "");
      setApiSecret(currentUser.cloudinary_api_secret || "");
      if (currentUser.compression_quality !== undefined && currentUser.compression_quality !== null) {
        setCompressionQuality(Number(currentUser.compression_quality));
      }
    }
  }, [currentUser]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingLogo(true);
    try {
      const cloudNameUsed = getCloudinaryCloudName(currentUser);
      const presetUsed = getCloudinaryUploadPreset(currentUser);
      const compressedFile = await compressImage(file, 500, compressionQuality);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", presetUsed);
      formData.append("public_id", `store_logo_${currentUser.id}`);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudNameUsed}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setStoreLogo(data.secure_url);
      } else {
        alert("فشل الرفع، تحقق من الإعدادات");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveStore = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const updates = { 
        store_name: storeName, 
        store_logo: storeLogo,
        cloudinary_cloud_name: cloudName,
        cloudinary_upload_preset: uploadPreset,
        cloudinary_api_key: apiKey,
        cloudinary_api_secret: apiSecret,
        compression_quality: compressionQuality,
        cloudinary_max_images: maxImages,
      };
      await mainSupabase
        .from("fortress_users")
        .update(updates)
        .eq("id", currentUser.id);
      
      const updated = { ...currentUser, ...updates };
      sessionStorage.setItem("currentUser", JSON.stringify(updated));
      alert("تم الحفظ بنجاح! سيتم تطبيق التغييرات فوراً.");
    } catch (e) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6 pb-32 md:pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">إعدادات النظام</h1>
          <p className="text-muted-foreground mt-1">تخصيص النظام وإدارة الحساب</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
              <Store className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">إعدادات المكتبة</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المكتبة / المتجر</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط الشعار (URL) أو رفع صورة</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    dir="ltr"
                    value={storeLogo}
                    onChange={(e) => setStoreLogo(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-colors text-sm font-medium shrink-0">
                    {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin text-gray-500" /> : <UploadCloud className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                    <span className="hidden sm:inline text-gray-700 dark:text-gray-300">رفع صورة</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                </div>
                {storeLogo && (
                  <div className="mt-2 h-16 w-16 rounded border border-gray-200 p-1 flex items-center justify-center bg-white">
                    <img src={storeLogo} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">الوضع الليلي</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">تفعيل الوضع المظلم بشكل افتراضي</p>
                </div>
                {mounted && (
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? '-translate-x-5' : 'translate-x-0'}`} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button disabled={isSaving} onClick={handleSaveStore} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                <Save className="h-4 w-4" />
                <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <UploadCloud className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">إعدادات التخزين السحابي</h2>
                </div>
                {currentUser?.cloudinary_cloud_name ? (
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex items-center gap-1">
                    ● مرتبط ({currentUser.cloudinary_cloud_name})
                  </span>
                ) : (
                  <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center gap-1">
                    ● لم يتم الربط بعد
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  يمكنك تسجيل الدخول لحساب مساحة الصور الخاص بك أو تغييره في أي وقت من هنا.
                </p>

                {/* Dedicated Cloud Account Login / Connection Button */}
                <button
                  type="button"
                  onClick={() => setShowCloudModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all active:scale-[0.99]"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{currentUser?.cloudinary_cloud_name ? "تغيير حساب الصور / تسجيل دخول جديد" : "تسجيل الدخول / ربط حساب الصور"}</span>
                </button>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأقصى للصور المسموح بها في الباقة (100‑1500)</label>
                  <input type="number" dir="ltr" min="100" max="1500" value={maxImages} onChange={(e) => setMaxImages(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button disabled={isSaving} onClick={handleSaveStore} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm font-bold">
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">إعدادات الحساب</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المستخدم</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    placeholder="اترك الحقل فارغاً إذا لم ترد التغيير"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Save className="h-4 w-4" />
                  <span>تحديث الحساب</span>
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                <Link2 className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">روابط سريعة</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/returns" className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-orange-100 dark:border-orange-800 transition-colors active:scale-95">
                  <Undo2 className="w-6 h-6" />
                  <span className="font-bold text-sm">المرتجعات</span>
                </Link>
                <Link href="/contact" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-800 transition-colors active:scale-95">
                  <Mail className="w-6 h-6" />
                  <span className="font-bold text-sm">اتصل بنا</span>
                </Link>
              </div>
            </div>

            {/* مساحة التخزين السحابية */}
            <Link href="/cloud-stats" className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 shadow-sm text-white hover:shadow-md transition-shadow active:scale-[0.99]">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Cloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">مساحة التخزين السحابية</h3>
                  <p className="text-sm text-blue-100 mt-1">نسبة استهلاك الصور من الباقة المجانية</p>
                </div>
                <div className="mr-auto text-left">
                  <span className="text-3xl font-black">{Math.min(((currentUser?.storage_used || 0) / (currentUser?.cloudinary_max_images ?? 100)) * 100, 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    ((currentUser?.storage_used || 0) / (currentUser?.cloudinary_max_images ?? 100)) * 100 >= 100 ? 'bg-red-400' :
                    ((currentUser?.storage_used || 0) / (currentUser?.cloudinary_max_images ?? 100)) * 100 >= 80 ? 'bg-amber-400' : 'bg-white/80'
                  }`}
                  style={{ width: `${Math.min(((currentUser?.storage_used || 0) / (currentUser?.cloudinary_max_images ?? 100)) * 100, 100)}%` }}
                />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <CloudinarySetupModal
        isOpen={showCloudModal}
        onClose={() => setShowCloudModal(false)}
        onSuccess={() => {
          setShowCloudModal(false);
          window.location.reload();
        }}
      />
    </ProtectedLayout>
  );
}
