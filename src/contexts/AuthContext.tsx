"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mainSupabase, initDynamicSupabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: any;
  licenseWarning: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; user?: any }>;
  verifyAcceptance: (acceptanceNumber: string) => Promise<boolean>;
  completeSetup: (fullName: string, phone: string, businessType: string, storeName: string) => Promise<boolean>;
  renewLicense: () => Promise<{ success: boolean; message: string }>;
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
  const [licenseWarning, setLicenseWarning] = useState<string | null>(null);
  const router = useRouter();

  // === Ø¯Ø§Ù„Ø© ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø±Ø®ØµØ© Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ===
  // ØªØªØµÙ„ Ø¨Ø§Ù„Ø³ÙŠØ±ÙØ± â†’ ØªÙØ­Øµ Ù…Ø¯Ø© Ø§Ù„Ø´Ø­Ù† â†’ Ø¥Ø°Ø§ Ø³Ø§Ø±ÙŠØ© ØªÙ…Ù†Ø­ Ø±Ø®ØµØ© 24 Ø³Ø§Ø¹Ø© Ù…Ø­Ù„ÙŠØ©
  const renewLicense = async (): Promise<{ success: boolean; message: string }> => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (!storedUser) return { success: false, message: "Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¬Ù‘Ù„." };

    const user = JSON.parse(storedUser);
    try {
      // Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù…Ù† Ø§Ù„Ø³ÙŠØ±ÙØ±
      const { data, error } = await mainSupabase
        .from("app_accounts")
        .select("subscription_end_date, is_banned")
        .eq("id", user.id)
        .single();

      if (error || !data) throw new Error("ÙØ´Ù„ Ø§Ù„Ø§ØªØµØ§Ù„");

      if (data.is_banned) {
        sessionStorage.clear();
        setIsAuthenticated(false);
        setCurrentUser(null);
        return { success: false, message: "ðŸš« ØªÙ… Ø­Ø¸Ø± Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹." };
      }

      // ÙØ­Øµ Ù…Ø¯Ø© Ø§Ù„Ø´Ø­Ù† (Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ)
      if (!data.subscription_end_date || new Date() > new Date(data.subscription_end_date)) {
        return { success: false, message: "ðŸš« Ø§Ù†ØªÙ‡Øª Ù…Ø¯Ø© Ø§Ø´ØªØ±Ø§ÙƒÙƒ. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ù„ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø´Ø­Ù†." };
      }

      // Ù…Ø¯Ø© Ø§Ù„Ø´Ø­Ù† Ø³Ø§Ø±ÙŠØ© â†’ Ù…Ù†Ø­ Ø±Ø®ØµØ© ÙŠÙˆÙ…ÙŠØ© 24 Ø³Ø§Ø¹Ø© Ù…Ø­Ù„ÙŠØ§Ù‹
      const dailyEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem("daily_license", JSON.stringify({ end: dailyEnd, updated: new Date().toISOString() }));
      
      // ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ù…Ø­Ù„ÙŠØ§Ù‹
      user.subscription_end_date = data.subscription_end_date;
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);
      setLicenseWarning(null);
      return { success: true, message: "âœ… ØªÙ… ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø±Ø®ØµØ© Ø¨Ù†Ø¬Ø§Ø­ Ù„Ù…Ø¯Ø© 24 Ø³Ø§Ø¹Ø©." };
    } catch (err) {
      return { success: false, message: "âš ï¸ Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø´Ø¨ÙƒØ© Ù„ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø±Ø®ØµØ©." };
    }
  };

  // === Ø¹Ù†Ø¯ ÙØªØ­ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚: ÙØ­Øµ Ø§Ù„Ø±Ø®ØµØ© Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ÙˆÙ…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„ØªØ¬Ø¯ÙŠØ¯ ===
  useEffect(() => {
    const checkAndRenew = async () => {
      try {
        const storedAuth = sessionStorage.getItem("isAuthenticated");
        const storedUser = sessionStorage.getItem("currentUser");

        if (storedAuth === "true" && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const cachedDaily = localStorage.getItem("daily_license");
          const dailyEnd = cachedDaily ? JSON.parse(cachedDaily).end : null;
          const now = new Date();

          // Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„ØªØ¬Ø¯ÙŠØ¯ Ù…Ù† Ø§Ù„Ø³ÙŠØ±ÙØ± ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹
          try {
            const { data, error } = await mainSupabase
              .from("app_accounts")
              .select("subscription_end_date, is_banned")
              .eq("id", parsedUser.id)
              .single();

            if (error || !data) throw new Error("DB error");

            if (data.is_banned) {
              sessionStorage.clear();
              localStorage.removeItem("daily_license");
              setIsAuthenticated(false);
              setCurrentUser(null);
              setLicenseWarning("ðŸš« ØªÙ… Ø­Ø¸Ø± Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨.");
              return;
            }

            // ÙØ­Øµ Ù…Ø¯Ø© Ø§Ù„Ø´Ø­Ù† Ø¹Ù„Ù‰ Ø§Ù„Ø³ÙŠØ±ÙØ±
            if (!data.subscription_end_date || now > new Date(data.subscription_end_date)) {
              // Ù…Ø¯Ø© Ø§Ù„Ø´Ø­Ù† Ø§Ù†ØªÙ‡Øª
              sessionStorage.clear();
              localStorage.removeItem("daily_license");
              setIsAuthenticated(false);
              setCurrentUser(null);
              setLicenseWarning("ðŸš« Ø§Ù†ØªÙ‡Øª Ù…Ø¯Ø© Ø§Ø´ØªØ±Ø§ÙƒÙƒ. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ù„ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø´Ø­Ù†.");
              return;
            }

            // Ù…Ø¯Ø© Ø§Ù„Ø´Ø­Ù† Ø³Ø§Ø±ÙŠØ© â†’ ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø±Ø®ØµØ© Ø§Ù„ÙŠÙˆÙ…ÙŠØ©
            const newDailyEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            localStorage.setItem("daily_license", JSON.stringify({ end: newDailyEnd, updated: now.toISOString() }));
            parsedUser.subscription_end_date = data.subscription_end_date;
            sessionStorage.setItem("currentUser", JSON.stringify(parsedUser));
            setIsAuthenticated(true);
            setCurrentUser(parsedUser);
            setLicenseWarning(null);

          } catch (networkErr) {
            // Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø§ØªØµØ§Ù„ â€” ÙØ­Øµ Ø§Ù„Ø±Ø®ØµØ© Ø§Ù„ÙŠÙˆÙ…ÙŠØ© Ø§Ù„Ù…Ø­Ù„ÙŠØ©
            if (dailyEnd && now < new Date(dailyEnd)) {
              setIsAuthenticated(true);
              setCurrentUser(parsedUser);
              const hoursLeft = Math.ceil((new Date(dailyEnd).getTime() - now.getTime()) / (1000 * 60 * 60));
              setLicenseWarning(`âš ï¸ Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª. Ø§Ù„Ø±Ø®ØµØ© Ø§Ù„Ù…Ø¤Ù‚ØªØ© ØµØ§Ù„Ø­Ø© Ù„Ù€ ${hoursLeft} Ø³Ø§Ø¹Ø©. Ø§ØªØµÙ„ Ø¨Ø§Ù„Ø´Ø¨ÙƒØ© Ù„ØªØ¬Ø¯ÙŠØ¯Ù‡Ø§.`);
            } else {
              sessionStorage.removeItem("isAuthenticated");
              sessionStorage.removeItem("currentUser");
              setIsAuthenticated(false);
              setCurrentUser(null);
              setLicenseWarning("ðŸš« Ø§Ù†ØªÙ‡Øª Ø§Ù„Ø±Ø®ØµØ© Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ÙˆÙ„Ø§ ÙŠÙˆØ¬Ø¯ Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø´Ø¨ÙƒØ©.");
            }
          }
        }
      } catch (e) {} finally {
        setIsLoading(false);
      }
    };
    checkAndRenew();
  }, []);

  // === Ù†Ø¸Ø§Ù… "Ø§Ù„Ø£ÙˆÙ†Ù„Ø§ÙŠÙ†" (Heartbeat) Ù„Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ù†Ø´Ø§Ø· ===
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const pingOnlineStatus = async () => {
      try {
        await mainSupabase.rpc('update_last_active');
      } catch (e) {
        // ØªØ¬Ø§Ù‡Ù„ Ø§Ù„Ø®Ø·Ø£ Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† Ù‡Ù†Ø§Ùƒ Ø¥Ù†ØªØ±Ù†Øª (Ù„ÙŠØ¹Ù…Ù„ Ø¨ØµÙ…Øª)
      }
    };

    // Ø¥Ø±Ø³Ø§Ù„ Ø£ÙˆÙ„ Ù†Ø¨Ø¶Ø© ÙÙˆØ± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£Ùˆ ÙØªØ­ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚
    pingOnlineStatus();

    // Ø¥Ø±Ø³Ø§Ù„ Ù†Ø¨Ø¶Ø© ÙƒÙ„ 3 Ø¯Ù‚Ø§Ø¦Ù‚ (180,000 Ù…Ù„ÙŠ Ø«Ø§Ù†ÙŠØ©)
    const intervalId = setInterval(pingOnlineStatus, 3 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, currentUser]);

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
      const verifiedAcceptance = localStorage.getItem("verified_workspace_acceptance");

      if (!verifiedAcceptance) {
        return { success: false, message: "Ù„Ù… ÙŠØªÙ… Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø±Ù‚Ù… Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ ÙÙŠ Ù‡Ø°Ù‡ Ø§Ù„Ø¬Ù„Ø³Ø©. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø±Ø¬ÙˆØ¹ ÙˆØªØ£ÙƒÙŠØ¯ Ø±Ù‚Ù… Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø£ÙˆÙ„Ø§Ù‹." };
      }

      const { data: authData, error: authError } = await mainSupabase.auth.signInWithPassword({
        email: email,
        password: pass,
      });

      if (authError || !authData.user) {
          return { success: false, message: "ØªØ£ÙƒØ¯ Ù…Ù† ØµØ­Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª: " + (authError?.message || "") };
        }

      // 4. Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Ø§Ù„Ø­Ø³Ø§Ø¨ ÙŠÙ†ØªÙ…ÙŠ Ù„Ù†ÙØ³ Ù…Ø³Ø§Ø­Ø© Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„ØªÙŠ ØªÙ… Ø¥Ø¯Ø®Ø§Ù„ Ø±Ù‚Ù… Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø®Ø§Øµ Ø¨Ù‡Ø§
      const { data: isValidWorkspace } = await mainSupabase.rpc("check_account_workspace", {
        p_auth_id: authData.user.id,
        p_acceptance_number: verifiedAcceptance
      });

      if (!isValidWorkspace) {
        await mainSupabase.auth.signOut();
        return { success: false, message: "Ø§Ù„Ø­Ø³Ø§Ø¨ ØºÙŠØ± Ù…Ø³Ø¬Ù„ ÙÙŠ Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© Ø¨Ø±Ù‚Ù… Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ù‡Ø°Ø§. Ù‡Ø°Ù‡ Ø«ØºØ±Ø© Ø£Ù…Ù†ÙŠØ© ØªÙ… Ø¥Ø­Ø¨Ø§Ø·Ù‡Ø§." };
      }

      // Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¨Ø¹Ø¯ Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„Ø£Ù…Ù†ÙŠ
      const { data, error } = await mainSupabase.from("app_accounts").select("*")
        .eq("auth_id", authData.user.id)
        .single();
      
      if (error || !data) {
        await mainSupabase.auth.signOut();
        return { success: false, message: "Ø§Ù„Ø­Ø³Ø§Ø¨ ØºÙŠØ± Ù…Ø³Ø¬Ù„ ÙÙŠ Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ø£Ùˆ Ø§Ù„Ù…ØªØ¬Ø± Ø§Ù„Ù…Ø­Ø¯Ø¯ Ø¨Ø±Ù‚Ù… Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ù‡Ø°Ø§. Ù‡Ø°Ù‡ Ø«ØºØ±Ø© Ø£Ù…Ù†ÙŠØ© ØªÙ… Ø¥Ø­Ø¨Ø§Ø·Ù‡Ø§." };
      }
      
      if (data.is_banned) {
        await mainSupabase.auth.signOut();
        return { success: false, message: "ØªÙ… Ø­Ø¸Ø± Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ØªØ·Ø¨ÙŠÙ‚." };
      }

      // ÙØ­Øµ Ù…Ø¯Ø© Ø§Ù„Ø´Ø­Ù† (Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ) Ø¹Ù†Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
      if (!data.subscription_end_date || new Date() > new Date(data.subscription_end_date)) {
        await mainSupabase.auth.signOut();
        return { success: false, message: "Ø§Ù†ØªÙ‡Øª Ù…Ø¯Ø© Ø§Ø´ØªØ±Ø§ÙƒÙƒ. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ù„ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø´Ø­Ù†." };
      }

      const profileUpdates: any = {};

      // Ù…Ù†Ø­ Ø±Ø®ØµØ© ÙŠÙˆÙ…ÙŠØ© 24 Ø³Ø§Ø¹Ø© Ù…Ø­Ù„ÙŠØ§Ù‹ (Ù„Ø£Ù† Ù…Ø¯Ø© Ø§Ù„Ø´Ø­Ù† Ø³Ø§Ø±ÙŠØ©)
      const dailyEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem("daily_license", JSON.stringify({ end: dailyEnd, updated: new Date().toISOString() }));

      let deviceUuid = localDeviceUuid;

      if (!data.device_uuid) {
        // Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯ (Ø¹Ø°Ø±Ø§Ø¡) - Ù„Ù… ÙŠÙØ±Ø¨Ø· Ø¨Ø¬Ù‡Ø§Ø² Ø¨Ø¹Ø¯
        if (!localDeviceUuid) {
          // Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø² Ù„Ù… ÙŠÙØ³Ø¬ÙŽÙ‘Ù„ Ù…Ù† Ù‚Ø¨Ù„ Ø£Ø¨Ø¯Ø§Ù‹ â†’ Ù†ÙˆÙ„Ù‘Ø¯ Ø¨ØµÙ…Ø© Ø¬Ø¯ÙŠØ¯Ø© Ù„Ù„Ø¬Ù‡Ø§Ø²
          deviceUuid = generateSafeUUID();
          localStorage.setItem("app_secure_uuid", encodeUUID(deviceUuid));
        } else {
          // Ø§Ù„Ø¬Ù‡Ø§Ø² ÙŠÙ…ØªÙ„Ùƒ Ø¨ØµÙ…Ø© Ù…Ø³Ø¨Ù‚Ø© (Ù…Ù† Ø­Ø³Ø§Ø¨ Ø¢Ø®Ø±) â†’ Ù†Ø³ØªØ®Ø¯Ù… Ù†ÙØ³ Ø§Ù„Ø¨ØµÙ…Ø©
          deviceUuid = localDeviceUuid;
        }
        profileUpdates.device_uuid = deviceUuid;
        profileUpdates.device_info = typeof navigator !== 'undefined' ? navigator.userAgent : 'Desktop/App';
      } else {
        // Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…Ø±Ø¨ÙˆØ· Ù…Ø³Ø¨Ù‚Ø§Ù‹ Ø¨Ø¬Ù‡Ø§Ø² â†’ Ù†ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„ØªØ·Ø§Ø¨Ù‚
        if (data.device_uuid !== localDeviceUuid) {
          // --- AUTO RECOVERY & LEADER OVERRIDE ---
          const currentAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Desktop/App';
          
          if (!localDeviceUuid && data.device_info === currentAgent) {
            // Cache was cleared, but it's the exact same browser/device fingerprint. Auto-recover.
            localStorage.setItem("app_secure_uuid", encodeUUID(data.device_uuid));
            deviceUuid = data.device_uuid;
          } 
          else {
            await mainSupabase.auth.signOut();
            return { success: false, message: "Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…Ø±ØªØ¨Ø· Ø¨Ø¬Ù‡Ø§Ø² Ø¢Ø®Ø±. ÙŠØ¬Ø¨ ÙÙƒ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø· Ø£ÙˆÙ„Ø§Ù‹ Ù…Ù† Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…." };
          }
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
      setLicenseWarning(null);
      return { success: true, user: userPayload };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: err.message || "Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù…" };
    }
  };

  const completeSetup = async (fullName: string, phone: string, businessType: string, storeName: string) => {
    if (!currentUser) return false;
    try {
      let workspaceError = null;
      
      // ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ØªØ¬Ø± Ù„Ù„Ø¬Ù…ÙŠØ¹ ÙÙ‚Ø· Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ù‚Ø§Ø¦Ø¯ Ù‡Ùˆ Ù…Ù† ÙŠÙ‚ÙˆÙ… Ø¨Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯
      if (currentUser.role === 'LEADER') {
        const { error: err } = await mainSupabase.rpc('update_workspace_info', {
          p_store_name: storeName,
          p_business_type: businessType
        });
        workspaceError = err;
      }

      // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø­Ø§Ù„ÙŠ (Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ù„Ù‡Ø§ØªÙØŒ ÙˆØ¥ÙƒÙ…Ø§Ù„ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø®Ø§Øµ Ø¨Ù‡)
      const { error } = await mainSupabase.from("app_accounts").update({
        full_name: fullName,
        phone_number: phone,
        setup_completed: true
      }).eq("id", currentUser.id);

      if (error || workspaceError) return false;

      const updatedUser = { 
          ...currentUser, 
          full_name: fullName, 
          phone_number: phone, 
          setup_completed: true,
          ...(currentUser.role === 'LEADER' && { business_type: businessType, store_name: storeName })
        };
        
        setCurrentUser(updatedUser);
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
        localStorage.setItem("setup_completed_" + currentUser.id, "true");
        return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("acceptance_verified");
    localStorage.removeItem("verified_workspace_acceptance");
    setIsAuthenticated(false);
    setCurrentUser(null);
    mainSupabase.auth.signOut().then(() => {
      window.location.href = "/login";
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, licenseWarning, login, verifyAcceptance, completeSetup, renewLicense, logout }}>
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
