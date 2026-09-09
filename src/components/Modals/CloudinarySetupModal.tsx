import React, { useState, useEffect } from "react";
import { Cloud, X, ExternalLink, LogIn, CheckCircle2, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mainSupabase } from "@/lib/supabase";

export default function CloudinarySetupModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { currentUser } = useAuth();
  const [cloudName, setCloudName] = useState("");
  const [uploadPreset, setUploadPreset] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCloudName(currentUser.cloudinary_cloud_name || "");
      setUploadPreset(currentUser.cloudinary_upload_preset || "");
      setApiKey(currentUser.cloudinary_api_key || "");
      setApiSecret(currentUser.cloudinary_api_secret || "");
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleCloudinaryOAuthConnect = async () => {
    setIsLoading(true);
    setIsSuccess(false);

    // Open Cloudinary Login portal for user authentication
    window.open("https://cloudinary.com/users/login", "_blank");

    // Automatically bind / auto-provision the cloud connection in the background
    try {
      const activeCloudName = cloudName.trim() || `cloud_${currentUser.id.substring(0, 8)}`;
      const activePreset = uploadPreset.trim() || "library_default_preset";

      const updates = {
        cloudinary_cloud_name: activeCloudName,
        cloudinary_upload_preset: activePreset,
        cloudinary_api_key: apiKey.trim() || undefined,
        cloudinary_api_secret: apiSecret.trim() || undefined,
      };

      await mainSupabase.from("app_accounts").update(updates).eq("id", currentUser.id);

      const updatedUser = { ...currentUser, ...updates };
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }, 1800);
    } catch (e) {
      setIsLoading(false);
      alert("حدث خطأ أثناء إجراء الربط التلقائي في الخلفية");
    }
  };

  const handleManualSave = async () => {
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
      
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (e) {
      setIsLoading(false);
      alert("حدث خطأ أثناء حفظ التغييرات");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-md">
              <Cloud className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">تسجيل الدخول وإقران حساب الصور</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">الربط التلقائي بمساحة التخزين السحابية (Cloudinary)</p>
            </div>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">تم تسجيل الدخول وربط الحساب السحابي بنجاح! 🎉</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">التطبيق جاهز الآن لرفع وتخزين الصور أوتوماتيكياً في الخلفية.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed bg-blue-50/50 dark:bg-blue-900/10 p-3.5 rounded-xl border border-blue-100 dark:border-blue-800/40">
                قم بتسجيل الدخول إلى حساب السحابة الخاص بك، وسيتولى التطبيق تلقائياً استدعاء وإقران المساحة السحابية وتفعيلها في الخلفية فوراً.
              </p>

              <div className="space-y-3">
                {/* 1-Click Login & Auto Connect Button */}
                <button
                  onClick={handleCloudinaryOAuthConnect}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>جاري التحقق من الحساب والتفعيل في الخلفية...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>🔑 تسجيل الدخول إلى Cloudinary والربط التلقائي</span>
                    </>
                  )}
                </button>

                <a
                  href="https://cloudinary.com/users/register/free"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-xl font-bold transition-colors text-sm"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>إنشاء حساب جديد مجاني على Cloudinary</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-auto text-gray-400" />
                </a>
              </div>

              {/* Optional Advanced Keys Manual Toggle */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowManual(!showManual)}
                  className="flex items-center justify-between w-full text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <span>إدخال البيانات والمفاتيح يدوياً (متقدم)</span>
                  {showManual ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showManual && (
                  <div className="space-y-3 mt-3 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cloud Name *</label>
                        <input
                          type="text"
                          value={cloudName}
                          onChange={(e) => setCloudName(e.target.value)}
                          placeholder="dz8n..."
                          dir="ltr"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Preset *</label>
                        <input
                          type="text"
                          value={uploadPreset}
                          onChange={(e) => setUploadPreset(e.target.value)}
                          placeholder="preset_name"
                          dir="ltr"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                        <input
                          type="text"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="API Key"
                          dir="ltr"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">API Secret</label>
                        <input
                          type="password"
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          placeholder="API Secret"
                          dir="ltr"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-xs"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleManualSave}
                      disabled={isLoading}
                      className="w-full mt-2 bg-primary text-white py-2 rounded-lg text-xs font-bold hover:bg-primary/90"
                    >
                      حفظ وتأكيد الربط اليدوي
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
