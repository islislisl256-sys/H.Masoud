"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { mainSupabase } from "@/lib/supabase";
import { ShieldAlert, Save } from "lucide-react";

export default function OnboardingPage() {
  const { currentUser, isAuthenticated, login } = useAuth();
  const router = useRouter();
  
  const [tradeType, setTradeType] = useState("");
  const [acceptanceNumber, setAcceptanceNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (currentUser?.onboarding_completed) {
      router.push("/");
    }
  }, [isAuthenticated, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!tradeType || !acceptanceNumber || !phoneNumber) {
      setError("يرجى تعبئة جميع الحقول الإلزامية");
      return;
    }

    setIsLoading(true);

    try {
      // تحديث البيانات الإجبارية وإغلاق التعديل
      const { error: updateError } = await mainSupabase.from("fortress_users").update({
        trade_type: tradeType,
        acceptance_number: acceptanceNumber,
        phone_number: phoneNumber,
        onboarding_completed: true
      }).eq("id", currentUser.id);

      if (updateError) throw updateError;
      
      alert("تم حفظ البيانات بنجاح وتم تأمين الحساب. سيتم توجيهك للنظام الآن.");
      // تحديث الجلسة عبر إعادة تحميل سريع
      window.location.href = "/";
    } catch (e: any) {
      setError(e.message || "حدث خطأ أثناء حفظ البيانات");
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || currentUser?.onboarding_completed) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8 space-y-6" dir="rtl">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black">معالج التهيئة الإجباري</h1>
            <p className="text-sm text-gray-500 max-w-md">
              هذه البيانات تُطلب لمرة واحدة فقط لتأمين حسابك وربطه بمتجرك. بمجرد الحفظ، لن تتمكن من تعديلها إلا عبر طلب من الإدارة للحماية من التلاعب.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">نوع التجارة *</label>
              <input
                type="text"
                required
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                placeholder="مثال: مكتبة عامة، قرطاسية..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 outline-none dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">رقم القبول *</label>
              <input
                type="text"
                required
                value={acceptanceNumber}
                onChange={(e) => setAcceptanceNumber(e.target.value)}
                placeholder="رقم القبول التجاري"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 outline-none dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="05xxxxxxx"
                dir="ltr"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 outline-none dark:bg-gray-700 text-right"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl text-white bg-amber-500 hover:bg-amber-600 font-bold transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'جاري تأمين الحفظ...' : 'تأكيد البيانات والقفل'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
