"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: any;
  login: (email: string, pass: string, businessType: string, acceptanceNumber: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem("isAuthenticated");
      const storedUser = localStorage.getItem("currentUser");
      if (storedAuth === "true" && storedUser) {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn("Local storage not available:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string, businessType: string, acceptanceNumber: string) => {
    try {
      const { data, error } = await supabase.from("app_accounts").select("*").eq("email", email).single();
      
      if (error || !data) return { success: false, message: "الحساب غير موجود" };
      if (data.password !== pass) return { success: false, message: "كلمة المرور غير صحيحة" };
      if (data.business_type !== businessType) return { success: false, message: "نمط التجارة غير صحيح" };
      if (data.acceptance_number !== acceptanceNumber) return { success: false, message: "رقم القبول غير صحيح" };
      
      let deviceUuid = localStorage.getItem("device_uuid");
      if (!deviceUuid) {
        deviceUuid = crypto.randomUUID();
        localStorage.setItem("device_uuid", deviceUuid);
      }
      
      if (!data.device_uuid) {
        await supabase.from("app_accounts").update({ 
          device_uuid: deviceUuid,
          device_info: navigator.userAgent
        }).eq("id", data.id);
      } else {
        if (data.device_uuid !== deviceUuid) {
           return { success: false, message: "هذا الحساب مرتبط بجهاز آخر! (الرجاء التواصل مع الإدارة)" };
        }
      }
      
      setIsAuthenticated(true);
      setCurrentUser(data);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", JSON.stringify(data));
      router.push("/");
      return { success: true };
    } catch (e) {
      return { success: false, message: "حدث خطأ أثناء الاتصال بالخادم" };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("currentUser");
    } catch (e) {}
    router.push("/login");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">جاري التحميل...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
