"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mainSupabase, initDynamicSupabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: any;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ENCRYPTION_PREFIX = "HMASOUD_SECURE_KEY_";
function encodeUUID(uuid: string) {
  return btoa(ENCRYPTION_PREFIX + uuid);
}
function decodeUUID(encoded: string) {
  try {
    const dec = atob(encoded);
    if (dec.startsWith(ENCRYPTION_PREFIX)) {
      return dec.substring(ENCRYPTION_PREFIX.length);
    }
  } catch(e) {}
  return null;
}

function generateSafeUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem("isAuthenticated");
      const storedUser = sessionStorage.getItem("currentUser");
      if (storedAuth === "true" && storedUser) {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {} finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const storedEncrypted = localStorage.getItem("app_secure_uuid");
      const localDeviceUuid = storedEncrypted ? decodeUUID(storedEncrypted) : null;

      // 1. تسجيل الدخول عبر Supabase Auth (الأمن الحقيقي)
      const { data: authData, error: authError } = await mainSupabase.auth.signInWithPassword({
        email: email,
        password: pass,
      });

      if (authError || !authData.user) {
        return { success: false, message: "بيانات الدخول خاطئة (تأكد من البريد الإلكتروني وكلمة المرور)" };
      }

      // 2. جلب ملف تعريف الحساب المربوط
      const { data, error } = await mainSupabase.from("app_accounts").select("*").eq("auth_id", authData.user.id).single();
      
      if (error || !data) {
        // لتسجيل الخروج إذا لم يكن هناك حساب مربوط
        await mainSupabase.auth.signOut();
        return { success: false, message: "هذا الحساب موجود، لكنه غير مربوط بملف في النظام (يرجى ربط auth_id)" };
      }
      
      if (data.is_banned) {
        await mainSupabase.auth.signOut();
        return { success: false, message: "تم حظر هذا الحساب نهائياً من استخدام التطبيق." };
      }

      // 3. التحقق من ربط الجهاز (Hardware Binding)
      let deviceUuid = localDeviceUuid;
      const profileUpdates: any = {};

      if (!data.device_uuid) {
        // أول دخول: ربط الجهاز
        deviceUuid = generateSafeUUID();
        profileUpdates.device_uuid = deviceUuid;
        profileUpdates.device_info = typeof navigator !== 'undefined' ? navigator.userAgent : 'Desktop/App';
        localStorage.setItem("app_secure_uuid", encodeUUID(deviceUuid));
      } else {
        // دخول متكرر: مطابقة الجهاز
        if (data.device_uuid !== localDeviceUuid) {
          await mainSupabase.auth.signOut();
          return { success: false, message: "هذا الحساب مرتبط بجهاز آخر. يجب فك الارتباط أولاً من لوحة التحكم." };
        }
      }

      // حفظ التحديثات إذا تم إنشاء معرف جديد
      if (Object.keys(profileUpdates).length > 0) {
        await mainSupabase.from("app_accounts").update(profileUpdates).eq("id", data.id);
      }

      // تهيئة قاعدة البيانات الفرعية إن وجدت
      initDynamicSupabase(data.db_url, data.db_key);
      
      const userPayload = { ...data, ...profileUpdates };
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("currentUser", JSON.stringify(userPayload));
      
      setIsAuthenticated(true);
      setCurrentUser(userPayload);
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: err.message || "حدث خطأ في الاتصال بالخادم" };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setCurrentUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {!isLoading && children}
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