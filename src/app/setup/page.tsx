"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { mainSupabase } from "@/lib/supabase";
import { ShieldCheck, UserCheck } from "lucide-react";

export default function SetupPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [acceptanceNumber, setAcceptanceNumber] = useState("");
  const [businessType, setBusinessType] = useState("مكتبة");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const businessTypes = ["مكتبة", "مواد غذائية", "متجر ملابس", "صيدلية"];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (currentUser?.setup_completed) {
      router.push("/");
    }
  }, [isAuthenticated, currentUser, router]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    setError("");

    try {
      const { error: updateError } = await mainSupabase
        .from("app_accounts")
        .update({
          phone_number: phoneNumber,
          acceptance_number: acceptanceNumber,
          business_type: businessType,
          setup_completed: true
        })
        .eq("id", currentUser.id);

      if (updateError) throw updateError;

      // Update session storage
      const updatedUser = {
        ...currentUser,
        phone_number: phoneNumber,
        acceptance_number: acceptanceNumber,
        business_type: businessType,
        setup_completed: true
      };
      
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      // Force reload to update context state
      window.location.href = "/";
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء حفظ البيانات");
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || (currentUser && currentUser.setup_completed)) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <UserCheck className="h-8 w-8" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            إكمال إعداد الحساب
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            يرجى إدخال البيانات التالية لمرة واحدة فقط لتفعيل حسابك
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSetup}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              رقم الهاتف
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="مثال: 0555123456"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              رقم القبول
            </label>
            <input
              type="text"
              required
              value={acceptanceNumber}
              onChange={(e) => setAcceptanceNumber(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="أدخل رقم القبول"
              dir="ltr"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نوع النشاط
            </label>
            <select
              required
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-lg mt-2">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="h-5 w-5" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ البيانات والبدء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
