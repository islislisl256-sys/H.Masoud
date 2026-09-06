import React, { useState } from "react";
import { Cloud, Save, X, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mainSupabase } from "@/lib/supabase";

export default function CloudinarySetupModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { currentUser } = useAuth();
  const [cloudName, setCloudName] = useState("");
  const [uploadPreset, setUploadPreset] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!cloudName || !uploadPreset) {
      alert("يرجى إدخال جميع البيانات المطلوبة");
      return;
    }
    
    setIsLoading(true);
    try {
      await mainSupabase.from("app_accounts").update({
        cloudinary_cloud_name: cloudName.trim(),
        cloudinary_upload_preset: uploadPreset.trim()
      }).eq("id", currentUser.id);

      const updatedUser = { ...currentUser, cloudinary_cloud_name: cloudName.trim(), cloudinary_upload_preset: uploadPreset.trim() };
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      onSuccess();
    } catch (e) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Cloud className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">إعداد التخزين السحابي للصور</h2>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            لإضافة منتجات بدون باركود وعرضها كصور في لوحة البيع، تحتاج إلى ربط حساب مجاني على منصة Cloudinary لتخزين صور منتجاتك. ستحصل على حصة تخزين 100 صورة مجاناً!
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cloud Name (اسم السحابة)</label>
              <input
                type="text"
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                placeholder="مثال: dz8n..."
                dir="ltr"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Preset (كود الرفع)</label>
              <input
                type="text"
                value={uploadPreset}
                onChange={(e) => setUploadPreset(e.target.value)}
                placeholder="يجب أن يكون من نوع Unsigned"
                dir="ltr"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            
            <a href="https://cloudinary.com/users/register/free" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
              <ExternalLink className="h-4 w-4" />
              كيفية الحصول على هذه البيانات؟ (إنشاء حساب مجاني)
            </a>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isLoading ? "جاري الربط..." : "ربط الحساب"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
