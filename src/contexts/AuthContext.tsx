"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mainSupabase, initDynamicSupabase } from "@/lib/supabase";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: any;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; needsOnboarding?: boolean }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// RAM-Only State for Session (No LocalStorage)
let inMemorySession: any = null;

// Secure Password Hashing (SHA-256 via WebCrypto)
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Extract Hardware Fingerprint safely
async function getHardwareFingerprint(): Promise<string> {
  try {
    if (typeof window !== 'undefined' && (window as any).require) {
      const machineId = (window as any).require('node-machine-id');
      return machineId.machineIdSync(true); // true = original raw ID
    }
  } catch (e) {
    console.warn("Could not load node-machine-id, falling back to Web fingerprint", e);
  }
  
  // Fallback for purely web environments
  const navStr = navigator.userAgent + navigator.language + screen.colorDepth + screen.width + screen.height;
  return await hashPassword("WEB_FALLBACK_" + navStr);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Silent Handshake Check:
    // Because we use RAM-only, if the app is hard-refreshed, they are logged out.
    // Real implementation of silent handshake requires HTTPOnly cookies or Secure Enclave.
    // For now, if inMemorySession is null, they must log in again.
    if (inMemorySession) {
      setIsAuthenticated(true);
      setCurrentUser(inMemorySession);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const hashedPassword = await hashPassword(pass);
      const hwFingerprint = await getHardwareFingerprint();

      // Calling the secure RPC function instead of querying the table directly
      const { data, error } = await mainSupabase.rpc('verify_account_login', {
        p_email: email,
        p_hashed_password: hashedPassword,
        p_hardware_fingerprint: hwFingerprint
      });
      
      if (error) {
        console.error("RPC Error:", error);
        return { success: false, message: "فشل الاتصال بخادم المصادقة الآمن." };
      }

      if (!data.success) {
        return { success: false, message: data.message };
      }

      if (data.requires_device_registration) {
        // Here we would automatically register the device using WebCrypto PKI
        // For simplicity in this demo step, we'll insert the device directly.
        // Generate a fast fake PKI pub key for now
        const mockPubKey = "PUB_KEY_" + Date.now().toString(16);
        
        await mainSupabase.from('devices').insert({
          user_id: data.user_id,
          device_type: 'windows',
          hardware_fingerprint: hwFingerprint,
          public_key: mockPubKey
        });
        
        // Retry login after registering device
        return await login(email, pass);
      }

      const userPayload = data.user;
      
      // Initialize Multi-tenant DB
      if (userPayload.db_url && userPayload.db_key) {
        initDynamicSupabase(userPayload.db_url, userPayload.db_key);
      }

      // Memory Only Session
      inMemorySession = userPayload;
      setIsAuthenticated(true);
      setCurrentUser(userPayload);

      // Check if onboarding is needed
      if (!userPayload.onboarding_completed) {
        return { success: true, needsOnboarding: true };
      }

      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: err.message || "حدث خطأ غير متوقع" };
    }
  };

  const logout = () => {
    inMemorySession = null;
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