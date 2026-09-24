"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Save, Lock, Store, UploadCloud, Loader2, Undo2, Mail, Link2, Cloud, LogIn, CheckCircle2, User } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { mainSupabase } from "@/lib/supabase";
import { compressImage } from "@/lib/imageUtils";
import { getCloudinaryCloudName, getCloudinaryUploadPreset, getCloudinaryApiKey, getCloudinaryApiSecret, getCloudinaryMaxImages } from "@/lib/cloudinaryConfig";
import toast from 'react-hot-toast';
import { showSystemToast } from '@/components/CustomToasts';
import CloudinarySetupModal from "@/components/Modals/CloudinarySetupModal";
import PremiumLockOverlay from "@/components/UI/PremiumLockOverlay";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth();

  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [username, setUsername] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessType, setBusinessType] = useState("");
  
  const [cloudName, setCloudName] = useState("");
  const [uploadPreset, setUploadPreset] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [compressionQuality, setCompressionQuality] = useState(0.7);
  const [maxImages, setMaxImages] = useState((currentUser?.plan_tier === 'PREMIUM' ? 25000 : 200));
  const [showAdvancedCloud, setShowAdvancedCloud] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      setStoreName(currentUser.store_name || "Ù…ÙƒØªØ¨Ø© Ø§Ù„Ø­Ø§Ø¬ Ù…Ø³Ø¹ÙˆØ¯");
      setStoreLogo(currentUser.store_logo ?? "");
      setUsername(currentUser.name ?? "HERMA");
      
      setFullName(currentUser.full_name ?? "");
      setPhoneNumber(currentUser.phone_number ?? "");
      setBusinessType(currentUser.business_type ?? "");
      
      setCloudName(currentUser.cloudinary_cloud_name || "");
      setUploadPreset(currentUser.cloudinary_upload_preset || "");
      setApiKey(currentUser.cloudinary_api_key || "");
      setApiSecret(currentUser.cloudinary_api_secret || "");
      if (currentUser.compression_quality !== undefined && currentUser.compression_quality !== null) {
        setCompressionQuality(Number(currentUser.compression_quality));
      }
    }
  }, [currentUser]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      setUploadingLogo(true);
      try {
        const cloudNameUsed = getCloudinaryCloudName(currentUser);
        const apiKeyUsed = getCloudinaryApiKey(currentUser);
        const apiSecretUsed = getCloudinaryApiSecret(currentUser);
        
        // 1. Delete old logo first if it exists
        if (storeLogo && storeLogo.includes('cloudinary.com')) {
           try {
              const parts = storeLogo.split('/upload/');
              if (parts.length >= 2) {
                 const withoutVersion = parts[1].replace(/^v\d+\//, '');
                 const oldPublicId = withoutVersion.split('.')[0];
                 await fetch('/api/cloudinary/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                       public_id: oldPublicId,
                       cloud_name: cloudNameUsed,
                       api_key: apiKeyUsed,
                       api_secret: apiSecretUsed
                    })
                 });
              }
           } catch(err) { console.error('Failed to delete old logo before upload', err); }
        }
        
      const presetUsed = getCloudinaryUploadPreset(currentUser);
      const compressedFile = await compressImage(file, 500, compressionQuality);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", presetUsed);
      formData.append("public_id", `store_logo_${currentUser.id}`);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudNameUsed}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
        if (data.secure_url) {
          const newLogoUrl = data.secure_url + "?v=" + new Date().getTime();
          setStoreLogo(newLogoUrl);
          
          if (currentUser) {
            await mainSupabase.from('app_accounts').update({ store_logo: newLogoUrl }).eq('id', currentUser.id);
            const updatedUser = { ...currentUser, store_logo: newLogoUrl };
            sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
          }
          
          showSystemToast("ØªÙ… Ø±ÙØ¹ Ø§Ù„Ø´Ø¹Ø§Ø±", "ØªÙ… ØªØ­Ø¯ÙŠØ« Ø´Ø¹Ø§Ø± Ø§Ù„Ù…ØªØ¬Ø± Ø¨Ù†Ø¬Ø§Ø­.", "edit_user");
        }
    } catch (e) {
      toast.error("ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„Ø´Ø¹Ø§Ø±");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveStore = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const updates = {
        store_name: storeName,
        store_logo: storeLogo,
        full_name: fullName,
        phone_number: phoneNumber,
        ...(currentUser?.role === 'LEADER' ? { business_type: businessType } : {}),
        cloudinary_cloud_name: cloudName,
        cloudinary_upload_preset: uploadPreset,
        cloudinary_api_key: apiKey,
        cloudinary_api_secret: apiSecret,
        compression_quality: compressionQuality,
        cloudinary_max_images: maxImages,
      };
      await mainSupabase
        .from("app_accounts")
        .update(updates)
        .eq("id", currentUser.id);
      
      const updated = { ...currentUser, ...updates };
      sessionStorage.setItem("currentUser", JSON.stringify(updated));
      toast.success("ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø¨Ù†Ø¬Ø§Ø­!");
    } catch (e) {
      toast.error("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø­ÙØ¸");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6 pb-32 md:pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª</h1>
          <p className="text-muted-foreground mt-1">ØªØ®ØµÙŠØµ Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ø®ØµÙŠØ© - ØªØ¸Ù‡Ø± Ù„Ù„Ø¬Ù…ÙŠØ¹ */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø´Ø®ØµÙŠØ©</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              {currentUser?.role === 'LEADER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ù†ÙˆØ¹ Ø§Ù„ØªØ¬Ø§Ø±Ø©</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="Ù…ÙƒØªØ¨Ø©">Ù…ÙƒØªØ¨Ø©</option>
                    <option value="Ù…Ø­Ù„ Ø¹Ø§Ù…">Ù…Ø­Ù„ Ø¹Ø§Ù…</option>
                    <option value="Ù…ÙˆØ§Ø¯ ØºØ°Ø§Ø¦ÙŠØ©">Ù…ÙˆØ§Ø¯ ØºØ°Ø§Ø¦ÙŠØ©</option>
                    <option value="ØµÙŠØ¯Ù„ÙŠØ©">ØµÙŠØ¯Ù„ÙŠØ©</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button disabled={isSaving} onClick={handleSaveStore} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸..." : "Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª"}</span>
              </button>
            </div>

            {/* Communication Button */}
            <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-700">
              <Link href="/chat" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-4 rounded-xl hover:opacity-90 transition-opacity font-bold shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„</span>
              </Link>
            </div>
          </div>

          {currentUser?.role === 'LEADER' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                <Store className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ÙƒØªØ¨Ø©</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ø§Ø³Ù… Ø§Ù„Ù…ÙƒØªØ¨Ø© / Ø§Ù„Ù…ØªØ¬Ø±</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ø´Ø¹Ø§Ø± Ø§Ù„Ù…ØªØ¬Ø±</label>
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                    {storeLogo ? (
                      <>
                        <div className="h-16 w-16 rounded border border-gray-200 p-1 flex items-center justify-center bg-white shrink-0 shadow-sm">
                          <img src={storeLogo} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ø§Ù„Ø´Ø¹Ø§Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ</p>
                          <button type="button" onClick={async () => {
                              const oldLogo = storeLogo;
                              setStoreLogo('');
                              if (currentUser) {
                                await mainSupabase.from('app_accounts').update({ store_logo: null }).eq('id', currentUser.id);
                                const updatedUser = { ...currentUser, store_logo: null };
                                sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
                                
                                // Delete from Cloudinary if it's a cloudinary URL
                                if (oldLogo && oldLogo.includes('cloudinary.com')) {
                                  try {
                                    const parts = oldLogo.split('/upload/');
                                    if (parts.length >= 2) {
                                      const path = parts[1];
                                      const withoutVersion = path.replace(/^v\d+\//, '');
                                      let publicId = withoutVersion.split('.')[0]; // remove extension
                                      // Fix publicId extraction just in case
                                      
                                      const cloudName = getCloudinaryCloudName(currentUser);
                                      const apiKey = getCloudinaryApiKey(currentUser);
                                      const apiSecret = getCloudinaryApiSecret(currentUser);
                                      
                                      await fetch('/api/cloudinary/delete', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          public_id: publicId,
                                          cloud_name: cloudName,
                                          api_key: apiKey,
                                          api_secret: apiSecret
                                        })
                                      });
                                    }
                                  } catch(e) { console.error('Failed to delete logo from cloud', e); }
                                }
                                showSystemToast("ØªÙ… Ù…Ø³Ø­ Ø§Ù„Ø´Ø¹Ø§Ø±", "ØªÙ… Ù…Ø³Ø­ Ø§Ù„Ø´Ø¹Ø§Ø± Ø§Ù„Ù‚Ø¯ÙŠÙ… Ø¨Ù†Ø¬Ø§Ø­.", "edit_user");
                              }
                            }} className="text-xs text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 rounded-lg transition-colors font-bold">
                            Ù…Ø³Ø­ Ø§Ù„Ø´Ø¹Ø§Ø± (Ù„Ø±ÙØ¹ Ø¬Ø¯ÙŠØ¯)
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 w-full space-y-3">
                        <label className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 border-dashed rounded-xl cursor-pointer transition-colors text-sm font-bold">
                          {uploadingLogo ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                          <span>Ø±ÙØ¹ ØµÙˆØ±Ø© Ø¬Ø¯ÙŠØ¯Ø© Ù…Ù† Ø§Ù„Ø¬Ù‡Ø§Ø²</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                        </label>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <hr className="flex-1 border-gray-200 dark:border-gray-600" />
                          <span>Ø£Ùˆ</span>
                          <hr className="flex-1 border-gray-200 dark:border-gray-600" />
                        </div>
                        <input
                          type="url"
                          placeholder="Ø£Ùˆ Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø¬Ø§Ù‡Ø² Ù‡Ù†Ø§ (Ù…Ø«Ø§Ù„: https://...)"
                          dir="rtl"
                          value={storeLogo}
                          onChange={(e) => setStoreLogo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm text-right"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù„ÙŠÙ„ÙŠ</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ØªÙØ¹ÙŠÙ„ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù…Ø¸Ù„Ù… Ø¨Ø´ÙƒÙ„ Ø§ÙØªØ±Ø§Ø¶ÙŠ</p>
                  </div>
                  {mounted && (
                    <button 
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? '-translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button disabled={isSaving} onClick={handleSaveStore} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸..." : "Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª"}</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {currentUser?.role === 'LEADER' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <UploadCloud className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„ØªØ®Ø²ÙŠÙ† Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠ</h2>
                  </div>
                  {currentUser?.cloudinary_cloud_name ? (
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex items-center gap-1">
                      â— Ù…Ø±ØªØ¨Ø· ({currentUser.cloudinary_cloud_name})
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center gap-1">
                      â— Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø±Ø¨Ø· Ø¨Ø¹Ø¯
                    </span>
                  )}
                </div>
                
                <div>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {currentUser?.plan_tier === 'PREMIUM' ? 
                        "ÙŠÙ…ÙƒÙ†Ùƒ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ø­Ø³Ø§Ø¨ Ù…Ø³Ø§Ø­Ø© Ø§Ù„ØµÙˆØ± Ø§Ù„Ø®Ø§Øµ Ø¨Ùƒ Ø£Ùˆ ØªØºÙŠÙŠØ±Ù‡ ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª Ù…Ù† Ù‡Ù†Ø§." :
                        "ÙÙŠ Ø§Ù„Ø¨Ø§Ù‚Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©ØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø±Ø¨Ø· Ù…Ø³Ø§Ø­Ø© Ø§Ù„ØµÙˆØ± (Cloudinary) Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø© ÙÙ‚Ø·. Ø§Ù„Ø³Ø¹Ø© Ù…Ø­Ø¯ÙˆØ¯Ø© Ø¨Ù€ 200 ØµÙˆØ±Ø©."
                      }
                    </p>

                    {/* Dedicated Cloud Account Login / Connection Button */}
                    <button
                      type="button"
                      onClick={() => setShowCloudModal(true)}
                      disabled={currentUser?.plan_tier !== 'PREMIUM' && !!currentUser?.cloudinary_cloud_name}
                      className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-sm transition-all active:scale-[0.99] ${
                        currentUser?.plan_tier !== 'PREMIUM' && !!currentUser?.cloudinary_cloud_name
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                      }`}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>
                        {currentUser?.cloudinary_cloud_name 
                          ? (currentUser?.plan_tier === 'PREMIUM' ? "ØªØºÙŠÙŠØ± Ø­Ø³Ø§Ø¨ Ø§Ù„ØµÙˆØ± / ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ Ø¬Ø¯ÙŠØ¯" : "ØªÙ… Ø±Ø¨Ø· Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¨Ù†Ø¬Ø§Ø­ (Ù…Ù‚ÙÙˆÙ„)") 
                          : "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ / Ø±Ø¨Ø· Ø­Ø³Ø§Ø¨ Ø§Ù„ØµÙˆØ±"}
                      </span>
                      {currentUser?.plan_tier !== 'PREMIUM' && !!currentUser?.cloudinary_cloud_name && <Lock className="w-4 h-4 text-amber-500" />}
                    </button>

                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù„Ù„ØµÙˆØ± Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ø¨Ù‡Ø§ ÙÙŠ Ø§Ù„Ø¨Ø§Ù‚Ø©</label>
                      <input 
                        type="number" 
                        dir="ltr" 
                        min="100" 
                        max="1500" 
                        value={currentUser?.plan_tier === 'PREMIUM' ? maxImages : 200} 
                        onChange={(e) => setMaxImages(Number(e.target.value))} 
                        disabled={currentUser?.plan_tier !== 'PREMIUM'}
                        className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-primary ${currentUser?.plan_tier !== 'PREMIUM' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                    <button disabled={isSaving} onClick={handleSaveStore} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm font-bold">
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸..." : "Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    Ù„ØºØ© Ø§Ù„Ù†Ø¸Ø§Ù… (Language)
                    {currentUser?.plan_tier !== 'PREMIUM' && <span title="ÙŠØªØ·Ù„Ø¨ Ø§Ù„Ø¨Ø§Ù‚Ø© Ø§Ù„Ù…Ù…ÙŠØ²Ø©"><Lock className="w-3 h-3 text-amber-500" /></span>}
                  </label>
                  <select
                    disabled={currentUser?.plan_tier !== 'PREMIUM'}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm ${currentUser?.plan_tier !== 'PREMIUM' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    defaultValue="ar"
                    title={currentUser?.plan_tier !== 'PREMIUM' ? 'Ù‡Ø°Ù‡ Ø§Ù„Ù…ÙŠØ²Ø© ØªØªØ·Ù„Ø¨ Ø§Ù„Ø¨Ø§Ù‚Ø© Ø§Ù„Ù…Ù…ÙŠØ²Ø©' : ''}
                  >
                    <option value="ar">Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (Arabic)</option>
                    <option value="fr">Ø§Ù„ÙØ±Ù†Ø³ÙŠØ© (French)</option>
                    <option value="en">Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© (English)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©</label>
                  <input
                    type="text"
                    placeholder="Ø§ØªØ±Ùƒ Ø§Ù„Ø­Ù‚Ù„ ÙØ§Ø±ØºØ§Ù‹ Ø¥Ø°Ø§ Ù„Ù… ØªØ±Ø¯ Ø§Ù„ØªØºÙŠÙŠØ±"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Save className="h-4 w-4" />
                  <span>ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø­Ø³Ø§Ø¨</span>
                </button>
              </div>
            </div>
            
            {currentUser?.role !== 'SELLER' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <Link2 className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ø±ÙˆØ§Ø¨Ø· Ø³Ø±ÙŠØ¹Ø©</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/returns" className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-orange-100 dark:border-orange-800 transition-colors active:scale-95">
                    <Undo2 className="w-6 h-6" />
                    <span className="font-bold text-sm">Ø§Ù„Ù…Ø±ØªØ¬Ø¹Ø§Øª</span>
                  </Link>
                  <Link href="/contact" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-800 transition-colors active:scale-95">
                    <Mail className="w-6 h-6" />
                    <span className="font-bold text-sm">Ø§ØªØµÙ„ Ø¨Ù†Ø§</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Ù…Ø³Ø§Ø­Ø© Ø§Ù„ØªØ®Ø²ÙŠÙ† Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠØ© */}
            {currentUser?.role === 'LEADER' && (
              <Link href="/cloud-stats" className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 shadow-sm text-white hover:shadow-md transition-shadow active:scale-[0.99]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Cloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Ù…Ø³Ø§Ø­Ø© Ø§Ù„ØªØ®Ø²ÙŠÙ† Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠØ©</h3>
<p className="text-sm text-blue-100 mt-1">
                        Ø§Ù„Ù…Ø³ØªÙ‡Ù„Ùƒ: {currentUser?.storage_used || 0} ØµÙˆØ±Ø© Ù…Ù† Ø£ØµÙ„ {getCloudinaryMaxImages(currentUser).toLocaleString()} ØµÙˆØ±Ø©
                      </p>
                    </div>
                  <div className="mr-auto text-left flex flex-col items-end">
                    <span className="text-3xl font-black">{Math.min(((currentUser?.storage_used || 0) / getCloudinaryMaxImages(currentUser)) * 100, 100).toFixed(1)}%</span>
                  </div>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    ((currentUser?.storage_used || 0) / getCloudinaryMaxImages(currentUser)) * 100 >= 100 ? 'bg-red-400' :
                    ((currentUser?.storage_used || 0) / getCloudinaryMaxImages(currentUser)) * 100 >= 80 ? 'bg-amber-400' : 'bg-white/80'
                  }`}
                  style={{ width: `${Math.max(Math.min(((currentUser?.storage_used || 0) / getCloudinaryMaxImages(currentUser)) * 100, 100), (currentUser?.storage_used || 0) > 0 ? 1.5 : 0)}%` }}
                />
              </div>
            </Link>
            )}
          </div>
        </div>
      </div>

      <CloudinarySetupModal
        isOpen={showCloudModal}
        onClose={() => setShowCloudModal(false)}
        onSuccess={() => {
          setShowCloudModal(false);
          window.location.reload();
        }}
      />
    </ProtectedLayout>
  );
}

