import React, { useState, useEffect } from "react";
import { Cloud, X, ExternalLink, CheckCircle2, Loader2, Sparkles, AlertOctagon, RefreshCw, Lock, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mainSupabase } from "@/lib/supabase";

export default function CloudinarySetupModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { currentUser } = useAuth();
  const [cloudName, setCloudName] = useState("");
  const [uploadPreset, setUploadPreset] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  
  const [isLinking, setIsLinking] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [stepMessage, setStepMessage] = useState("انتظر من فضلك لتكتمل عملية الربط...");
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && isOpen) {
      setCloudName(currentUser.cloudinary_cloud_name || "");
      setUploadPreset(currentUser.cloudinary_upload_preset || "");
      setApiKey(currentUser.cloudinary_api_key || "");
      setApiSecret(currentUser.cloudinary_api_secret || "");
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const runVerificationAndLink = async (targetCloud: string, targetPreset: string, targetKey: string, targetSecret: string) => {
    setIsLinking(true);
    setErrorMessage(null);
    setIsSuccess(false);
    setProgressPercent(15);
    setStepMessage("جاري التحقق من تسجيل الدخول واستدعاء الحساب...");

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgressPercent(45);
      setStepMessage("جاري تهيئة واختبار كود الرفع والمفاتيح السحابية...");

      // Perform Real Verification Ping Test
      const testRes = await fetch('/api/cloudinary/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloud_name: targetCloud,
          api_key: targetKey,
          api_secret: targetSecret
        })
      });

      const testData = await testRes.json().catch(() => ({}));

      if (testRes.status !== 200 && testData.error && !testData.resources) {
        throw new Error(typeof testData.error === 'string' ? testData.error : testData.error?.message || "فشل الاتصال بالسحابة المحدد. يرجى التأكد من بيانات الحساب.");
      }

      setProgressPercent(85);
      setStepMessage("جاري تأكيد جاهزية الاتصال وحفظ الحساب الجديد...");

      // Save verified credentials to Supabase fortress_users
      const updates = {
        cloudinary_cloud_name: targetCloud,
        cloudinary_upload_preset: targetPreset,
        cloudinary_api_key: targetKey,
        cloudinary_api_secret: targetSecret,
      };

      const { error: dbError } = await mainSupabase.from("fortress_users").update(updates).eq("id", currentUser.id);
      if (dbError) throw new Error("فشل حفظ إعدادات السحابة في قاعدة البيانات: " + dbError.message);

      const updatedUser = { ...currentUser, ...updates };
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setProgressPercent(100);
      setStepMessage("تم الربط وتأكيد الحساب بنجاح!");
      
      setTimeout(() => {
        setIsLinking(false);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1600);
      }, 600);

    } catch (err: any) {
      setIsLinking(false);
      setProgressPercent(0);
      setErrorMessage(err.message || "حدث خطأ غير متوقع أثناء عملية الربط والتأكد.");
    }
  };

  const handleConnect = () => {
    if (!cloudName.trim() || !uploadPreset.trim() || !apiKey.trim() || !apiSecret.trim()) {
      setErrorMessage("يرجى إدخال جميع بيانات الربط (Cloud Name, Upload Preset, API Key, API Secret) لإتمام الربط بشكل حقيقي.");
      return;
    }
    runVerificationAndLink(cloudName.trim(), uploadPreset.trim(), apiKey.trim(), apiSecret.trim());
  };

  const handleDisconnect = async () => {
    if (!confirm("هل أنت متأكد من فك ربط حساب السحابة الحالي؟")) return;
    try {
      const updates = {
        cloudinary_cloud_name: null,
        cloudinary_upload_preset: null,
        cloudinary_api_key: null,
        cloudinary_api_secret: null,
      };
      await mainSupabase.from("fortress_users").update(updates).eq("id", currentUser.id);
      const updatedUser = { ...currentUser, ...updates };
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setCloudName("");
      setUploadPreset("");
      setApiKey("");
      setApiSecret("");
      alert("تم فك ربط الحساب بنجاح.");
      onSuccess();
    } catch (e) {
      alert("حدث خطأ أثناء فك الربط");
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${
        isLinking ? "bg-black/80 backdrop-blur-md pointer-events-auto cursor-wait select-none" : "bg-black/50 backdrop-blur-sm"
      }`}
      onClick={(e) => {
        if (isLinking) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      {/* FULL-SCREEN BLUR & TOUCH LOCK OVERLAY DURING LINKING */}
      {isLinking && (
        <div className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none cursor-wait pointer-events-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full animate-ping opacity-30" />
              <div className="absolute inset-0 border-4 border-t-blue-600 border-r-indigo-600 border-b-transparent border-l-transparent rounded-full animate-spin" />
              <Cloud className="w-9 h-9 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">انتظر من فضلك لتكتمل عملية الربط...</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{stepMessage}</p>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-gray-600">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3.5 rounded-2xl text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed text-right flex items-center gap-2">
              <Lock className="w-5 h-5 flex-shrink-0 text-amber-500" />
              <span>تم قفل التصفح مؤقتاً لضمان إكمال عملية الربط والاختبار بنجاح وإعلامك بالنتيجة.</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          {!isLinking && !isSuccess && (
            <button 
              onClick={onClose} 
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          {/* SUCCESS NOTIFICATION SCREEN */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 select-none">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">تمت عملية الربط وتأكيد حسابك السحابي بنجاح! 🎉</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">تمت معالجة واختبار الاتصال بالسحابة والتطبيق جاهز الآن للاستخدام.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-md">
                  <Cloud className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">ربط حساب Cloudinary الخاص بك</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">أدخل بيانات حسابك الحقيقية لربط التطبيق بالسحابة</p>
                </div>
              </div>

              {/* ERROR BANNER */}
              {errorMessage && (
                <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-xs leading-relaxed">
                  <AlertOctagon className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm mb-1">تنبيه:</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                لضمان ربط حقيقي بمساحتك الخاصة، يرجى استخراج البيانات التالية من لوحة تحكم Cloudinary الخاصة بك وإدخالها هنا.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Cloud Name *</label>
                    <input
                      type="text"
                      value={cloudName}
                      onChange={(e) => setCloudName(e.target.value)}
                      placeholder="مثال: dz8n..."
                      dir="ltr"
                      className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Upload Preset *</label>
                    <input
                      type="text"
                      value={uploadPreset}
                      onChange={(e) => setUploadPreset(e.target.value)}
                      placeholder="مثال: preset_name"
                      dir="ltr"
                      className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">API Key *</label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="مفتاح الواجهة"
                      dir="ltr"
                      className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">API Secret *</label>
                    <input
                      type="password"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="الرمز السري"
                      dir="ltr"
                      className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  <button
                    onClick={handleConnect}
                    disabled={isLinking}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl font-bold shadow-md transition-all active:scale-[0.99] text-base disabled:opacity-50"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>اختبار الاتصال وحفظ الربط الحقيقي</span>
                  </button>

                  <a
                    href="https://cloudinary.com/users/register/free"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-xl font-bold transition-colors text-sm"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>إنشاء حساب جديد على Cloudinary إذا لم تكن تملك واحداً</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-auto text-gray-400" />
                  </a>

                  {currentUser?.cloudinary_cloud_name && (
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2.5 px-4 rounded-xl font-bold transition-colors text-sm border border-red-200 dark:border-red-800/40 mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>فك ربط الحساب الحالي ({currentUser.cloudinary_cloud_name})</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
