"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mainSupabase, initDynamicSupabase } from "@/lib/supabase";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: any;
  login: (email: string, pass: string, businessType: string, acceptanceNumber: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilities for obfuscating the UUID in localStorage
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
      // Check if device already has an encrypted UUID (meaning it's an issued app)
      const storedEncrypted = localStorage.getItem("app_secure_uuid");
      const localDeviceUuid = storedEncrypted ? decodeUUID(storedEncrypted) : null;

      const { data, error } = await mainSupabase.from("app_accounts").select("*").eq("email", email).single();
      
      // If the device HAS a UUID, but they provide wrong credentials OR log into an account that doesn't own this UUID
      if (localDeviceUuid) {
        if (error || !data || data.password !== pass || data.business_type !== businessType || data.acceptance_number !== acceptanceNumber || data.device_uuid !== localDeviceUuid) {
          return { success: false, message: "أنت تملك تطبيقاً بحساب آخر أو أخطأت في بيانات الدخول" };
        }
      } else {
        // Normal login for a fresh device
        if (error || !data) return { success: false, message: "الحساب غير موجود" };
        if (data.password !== pass) return { success: false, message: "كلمة المرور غير صحيحة" };
        if (data.business_type !== businessType) return { success: false, message: "نمط التجارة غير صحيح" };
        if (data.acceptance_number !== acceptanceNumber) return { success: false, message: "رقم القبول غير صحيح" };
      }
      
      let deviceUuid = localDeviceUuid;
      if (!deviceUuid) {
        deviceUuid = crypto.randomUUID();
        localStorage.setItem("app_secure_uuid", encodeUUID(deviceUuid));
      }
      
      if (!data.device_uuid) {
        await mainSupabase.from("app_accounts").update({ 
          device_uuid: deviceUuid,
          device_info: navigator.userAgent
        }).eq("id", data.id);
      }
      
      // Dynamic DB Support
      if (data.db_url && data.db_key) {
        localStorage.setItem("custom_db_url", data.db_url);
        localStorage.setItem("custom_db_key", data.db_key);
        initDynamicSupabase(data.db_url, data.db_key);
      } else {
        localStorage.removeItem("custom_db_url");
        localStorage.removeItem("custom_db_key");
        initDynamicSupabase(null, null);
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
      // Note: We DO NOT remove 'app_secure_uuid' so the device remains tied to the account!
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
