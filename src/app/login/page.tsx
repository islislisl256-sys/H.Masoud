"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  
  const handleClearFingerprint = () => {
    if (confirm("هل أنت متأكد من مسح البصمة من هذا الجهاز؟ (سيصبح الجهاز جديداً)")) {
      localStorage.removeItem("app_secure_uuid");
      localStorage.clear();
      sessionStorage.clear();
      alert("تم مسح بصمة الجهاز بنجاح! يمكنك الآن الدخول كجهاز جديد.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    const result = await login(email, password);
    if (!result.success) { setError(result.message || "حدث خطأ غير معروف"); setIsLoading(false); } else { router.push("/"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            مكتبة الحاج مسعود
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            تسجيل الدخول للنظام
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الإيميل
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="أدخل الإيميل"
              dir="ltr"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="أدخل كلمة المرور"
              dir="ltr"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-lg mt-2">
              {error}
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
            >
              {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول وربط الجهاز'}
            </button>
            
            <button
              type="button"
              onClick={handleClearFingerprint}
              className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-red-200 text-sm font-bold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              مسح البصمة من هذا الجهاز (للتجربة)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}