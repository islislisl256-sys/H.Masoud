import React, { useState, useEffect } from "react";
import { Cloud, Save, X, ExternalLink, LogIn, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mainSupabase } from "@/lib/supabase";

export default function CloudinarySetupModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { currentUser } = useAuth();
  const [cloudName, setCloudName] = useState("");
  const [uploadPreset, setUploadPreset] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCloudName(currentUser.cloudinary_cloud_name || "");
      setUploadPreset(currentUser.cloudinary_upload_preset || "");
      setApiKey(currentUser.cloudinary_api_key || "");
      setApiSecret(currentUser.cloudinary_api_secret || "");
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!cloudName || !uploadPreset) {
      alert("يرجى إدخال اسم السحابة (Cloud Name) وكود الرفع (Upload Preset)");
      return;
    }
    
    setIsLoading(true);
    try {
      const updates = {
        cloudinary_cloud_name: cloudName.trim(),
        cloudinary_upload_preset: uploadPreset.trim(),
        cloudinary_api_key: apiKey.trim(),
        cloudinary_api_secret: apiSecret.trim(),
      };

      await mainSupabase.from("app_accounts").update(updates).eq("id", currentUser.id);

      const updatedUser = { ...currentUser, ...updates };
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      alert("تم تسجيل الدخول وربط حساب الصور السحابية بنجاح!");
      onSuccess();
    } catch (e) {
      alert("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative">
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">تسجيل الدخول / ربط حساب الصور السحابية</h2>
              <p className="text-xs text-gray-500 mt-0.5">ربط وتغيير حساب Cloudinary الخاص بك</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            قم بإدخال بيانات حساب السحابة الخاص بك لربطه بالنظام مباشرة وتخزين ومسح صور المنتجات والشعار.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cloud Name *</label>
                <input
                  type="text"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  placeholder="مثال: dz8n..."
                  dir="ltr"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Preset *</label>
                <input
                  type="text"
                  value={uploadPreset}
                  onChange={(e) => setUploadPreset(e.target.value)}
                  placeholder="Unsigned Preset"
                  dir="ltr"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key (للمسح وعرض المعرض)</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API Key"
                  dir="ltr"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Secret (المفتاح السري)</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="API Secret"
                  dir="ltr"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
            </div>
            
            <a href="https://cloudinary.com/users/register/free" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline font-medium pt-1">
              <ExternalLink className="h-3.5 w-3.5" />
              كيفية فتح حساب مجاني وحصول على البيانات؟
            </a>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <LogIn className="h-5 w-5" />
              {isLoading ? "جاري الحفظ والربط..." : "تسجيل الدخول وربط الحساب"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
