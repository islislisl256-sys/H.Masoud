"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mainSupabase, initDynamicSupabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: any;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; user?: any }>;
  verifyAcceptance: (acceptanceNumber: string) => Promise<boolean>;
  completeSetup: (phone: string, businessType: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ENCRYPTION_PREFIX = "HMASOUD_SECURE_KEY_";
function encodeUUID(uuid: string) { return btoa(ENCRYPTION_PREFIX + uuid); }
function decodeUUID(encoded: string) {
  try {
    const dec = atob(encoded);
    if (dec.startsWith(ENCRYPTION_PREFIX)) { return dec.substring(ENCRYPTION_PREFIX.length); }
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

  const verifyAcceptance = async (acceptanceNumber: string) => {
    try {
      const { data, error } = await mainSupabase.rpc('verify_acceptance_number', { input_number: acceptanceNumber });
      if (error || !data) return false;
      return true;
    } catch (err) {
      return false;
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const storedEncrypted = localStorage.getItem("app_secure_uuid");
      const localDeviceUuid = storedEncrypted ? decodeUUID(storedEncrypted) : null;

      const { data: authData, error: authError } = await mainSupabase.auth.signInWithPassword({
        email: email,
        password: pass,
      });

      if (authError || !authData.user) {
        return { success: false, message: "بيانات الدخول خاطئة (تأكد من البريد الإلكتروني وكلمة المرور)" };
      }

      const { data, error } = await mainSupabase.from("app_accounts").select("*").eq("auth_id", authData.user.id).single();
      
      if (error || !data) {
        await mainSupabase.auth.signOut();
        return { success: false, message: "هذا الحساب موجود، لكنه غير مربوط بملف في النظام (يرجى ربط auth_id)" };
      }
      
      if (data.is_banned) {
        await mainSupabase.auth.signOut();
        return { success: false, message: "تم حظر هذا الحساب نهائياً من استخدام التطبيق." };
      }

      let deviceUuid = localDeviceUuid;
      const profileUpdates: any = {};

      if (!data.device_uuid) {
        deviceUuid = generateSafeUUID();
        profileUpdates.device_uuid = deviceUuid;
        profileUpdates.device_info = typeof navigator !== 'undefined' ? navigator.userAgent : 'Desktop/App';
        localStorage.setItem("app_secure_uuid", encodeUUID(deviceUuid));
      } else {
        if (data.device_uuid !== localDeviceUuid) {
          await mainSupabase.auth.signOut();
          return { success: false, message: "هذا الحساب مرتبط بجهاز آخر. يجب فك الارتباط أولاً من لوحة التحكم." };
        }
      }

      if (Object.keys(profileUpdates).length > 0) {
        await mainSupabase.from("app_accounts").update(profileUpdates).eq("id", data.id);
      }

      if (data.db_url && data.db_key) {
         initDynamicSupabase(data.db_url, data.db_key);
      }
      
      const userPayload = { ...data, ...profileUpdates };
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("currentUser", JSON.stringify(userPayload));
      
      setIsAuthenticated(true);
      setCurrentUser(userPayload);
      return { success: true, user: userPayload };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: err.message || "حدث خطأ في الاتصال بالخادم" };
    }
  };

  const completeSetup = async (phone: string, businessType: string) => {
    if (!currentUser) return false;
    try {
      const { error } = await mainSupabase.from("app_accounts").update({
        phone_number: phone,
        business_type: businessType,
        setup_completed: true
      }).eq("id", currentUser.id);

      if (error) return false;

      const updatedUser = { ...currentUser, phone_number: phone, business_type: businessType, setup_completed: true };
      setCurrentUser(updatedUser);
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      return false;
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
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, verifyAcceptance, completeSetup, logout }}>
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