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

      const { data, error } = await mainSupabase.from("app_accounts").select("*").eq("email", email).single();
      
      if (error || !data) return { success: false, message: "الحساب غير موجود" };
      
      if (data.is_banned) {
        return { success: false, message: "تم حظر هذا الحساب نهائياً من استخدام التطبيق." };
      }

      if (data.password !== pass) {
        return { success: false, message: "بيانات الدخول خاطئة (تأكد من كلمة المرور)" };
      }
      
      // إلغاء مسح البيانات التلقائي لضمان سلامة الحساب
      if (data.pending_wipe || data.pending_unlink) {
        await mainSupabase.from("app_accounts").update({
          pending_wipe: false,
          pending_unlink: false
        }).eq("id", data.id);
      }

      let deviceUuid = localDeviceUuid;

      // حساب جديد أو تجهيز التوكن ونوعية التضغيط الأنسب (0.7)
      const tokenGenerated = data.account_token || `TOKEN_${generateSafeUUID().substring(0, 12)}`;
      const optimalQuality = data.compression_quality !== undefined && data.compression_quality !== null ? data.compression_quality : 0.7;

      const profileUpdates: any = {
        account_token: tokenGenerated,
        compression_quality: optimalQuality,
      };

      if (!data.device_uuid) {
        deviceUuid = generateSafeUUID();
        profileUpdates.device_uuid = deviceUuid;
        profileUpdates.device_info = typeof navigator !== 'undefined' ? navigator.userAgent : 'Desktop/App';
        localStorage.setItem("app_secure_uuid", encodeUUID(deviceUuid));
      } else {
        if (data.device_uuid !== localDeviceUuid) {
          return { success: false, message: "هذا الحساب مرتبط بجهاز آخر، أو أن هذا الجهاز مرتبط بحساب مختلف." };
        }
      }

      // حفظ تحديثات الحساب والتوكن ونوعية التضغيط الأنسب في قاعدة البيانات
      await mainSupabase.from("app_accounts").update(profileUpdates).eq("id", data.id);

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