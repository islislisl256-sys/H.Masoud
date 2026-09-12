"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, AlertOctagon, Phone, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2 | 3 | "BLOCKED">(1);
  const [acceptanceNumber, setAcceptanceNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("retail");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, verifyAcceptance, completeSetup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("app_wiped") === "true") {
      setStep("BLOCKED");
    }
  }, []);

  const triggerSelfDestruct = () => {
    localStorage.setItem("app_wiped", "true");
    localStorage.removeItem("app_secure_uuid");
    sessionStorage.clear();
    setStep("BLOCKED");
  };

  const handleAcceptanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);
    
    let fails = parseInt(localStorage.getItem("acceptance_fails") || "0");
    
    const isValid = await verifyAcceptance(acceptanceNumber);
    setIsLoading(false);
    
    if (isValid) {
      localStorage.setItem("acceptance_fails", "0");
      setStep(2);
    } else {
      fails += 1;
      localStorage.setItem("acceptance_fails", fails.toString());
      if (fails >= 3) {
        triggerSelfDestruct();
      } else {
        setError(`رقم القبول غير صحيح. لديك ${3 - fails} محاولات متبقية قبل تدمير الجلسة.`);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);
    
    let fails = parseInt(localStorage.getItem("login_fails") || "0");
    
    const result = await login(email, password);
    setIsLoading(false);
    
    if (!result.success) {
      fails += 1;
      localStorage.setItem("login_fails", fails.toString());
      if (fails >= 3) {
        triggerSelfDestruct();
      } else {
        setError(`${result.message}. لديك ${3 - fails} محاولات متبقية قبل التدمير.`);
      }
    } else {
      localStorage.setItem("login_fails", "0");
      if (!result.user.phone_number || !result.user.business_type) {
        setStep(3);
      } else {
        router.push("/");
      }
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);
    
    const success = await completeSetup(phone, businessType);
    if (success) {
      router.push("/");
    } else {
      setError("حدث خطأ أثناء حفظ البيانات.");
      setIsLoading(false);
    }
  };

  if (step === "BLOCKED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <AlertOctagon className="h-24 w-24 text-red-600 mx-auto animate-pulse" />
          <h2 className="text-3xl font-bold text-red-700">تم قفل النظام لأسباب أمنية</h2>
          <p className="text-red-600 font-medium text-lg">
            لقد تم تفعيل نظام التدمير الذاتي بعد تكرار محاولات الدخول الفاشلة. تم مسح بيانات الجلسة بالكامل.
          </p>
        </div>
      </div>
    );
  }

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
            {step === 1 && "المرحلة 1: التحقق الأمني"}
            {step === 2 && "المرحلة 2: تسجيل الدخول"}
            {step === 3 && "المرحلة 3: استكمال الإعدادات"}
          </p>
        </div>
        
        {step === 1 && (
          <form className="mt-8 space-y-4" onSubmit={handleAcceptanceSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم القبول</label>
              <input type="password" required value={acceptanceNumber} onChange={(e) => setAcceptanceNumber(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-center tracking-widest text-lg"
                placeholder="••••••••" dir="ltr" />
            </div>
            {error && <div className="text-red-500 text-sm text-center font-medium py-2">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary">
              {isLoading ? 'جاري التحقق...' : 'متابعة'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الإيميل</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary sm:text-sm"
                placeholder="admin@example.com" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary sm:text-sm"
                placeholder="••••••••" dir="ltr" />
            </div>
            {error && <div className="text-red-500 text-sm text-center font-medium py-2">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary">
              {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="mt-8 space-y-4" onSubmit={handleSetupSubmit}>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4 text-sm text-blue-800 dark:text-blue-200 text-center">
              بما أن هذه هي المرة الأولى، يرجى استكمال البيانات.
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 gap-2"><Phone className="w-4 h-4"/> رقم الهاتف</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary sm:text-sm"
                placeholder="05xxxxxx" dir="ltr" />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 gap-2"><Briefcase className="w-4 h-4"/> نوع النشاط</label>
              <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary sm:text-sm">
                <option value="retail">بيع بالتجزئة (سوبر ماركت، ملابس)</option>
                <option value="pharmacy">صيدلية</option>
                <option value="restaurant">مطعم / كافيه</option>
                <option value="library">مكتبة / أدوات مدرسية</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            {error && <div className="text-red-500 text-sm text-center font-medium py-2">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary">
              {isLoading ? 'جاري الحفظ...' : 'حفظ والدخول للنظام'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}