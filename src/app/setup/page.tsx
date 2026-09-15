"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { mainSupabase } from "@/lib/supabase";
import { ShieldCheck, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function SetupPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [acceptanceNumber, setAcceptanceNumber] = useState("");
  const [businessType, setBusinessType] = useState("مكتبة");
  const [isLoading, setIsLoading] = useState(false);

  const businessTypes = ["مكتبة", "محل عام", "مواد غذائية", "صيدلية"];

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

    try {
      const isLeader = currentUser.role === 'LEADER';
      
      const updates: any = {
        full_name: fullName,
        phone_number: phoneNumber,
        setup_completed: true
      };
      
      if (isLeader) {
        updates.store_name = storeName;
        updates.acceptance_number = acceptanceNumber;
        updates.business_type = businessType;
      }

      const { error: updateError } = await mainSupabase
        .from("app_accounts")
        .update(updates)
        .eq("id", currentUser.id);

      if (updateError) throw updateError;

      // Update session storage
      const updatedUser = {
        ...currentUser,
        ...updates
      };
      
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      // Force reload to update context state
      window.location.href = "/";
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "حدث خطأ أثناء الإعداد");
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || (currentUser && currentUser.setup_completed)) {
    return null;
  }

  const isLeader = currentUser?.role === 'LEADER';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <UserCheck className="h-8 w-8" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            إعداد الحساب
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            يرجى إكمال البيانات التالية للبدء في استخدام النظام
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSetup}>
          {isLeader && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اسم المتجر / المكتبة
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="اسم متجرك"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الاسم الكامل
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="الاسم الكامل"
            />
          </div>

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

          {isLeader && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رقم الاعتماد
                </label>
                <input
                  type="text"
                  required
                  value={acceptanceNumber}
                  onChange={(e) => setAcceptanceNumber(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="أدخل رقم الاعتماد"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  نوع التجارة
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  {businessTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  جاري الحفظ...
                </span>
              ) : (
                "حفظ والمتابعة"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
