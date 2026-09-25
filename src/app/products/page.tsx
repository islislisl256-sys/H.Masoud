"use client";
import toast from 'react-hot-toast';
import { showSystemToast, confirmDialog } from '@/components/CustomToasts';

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Plus, Search, Trash2, Loader2, Save, X, QrCode, Camera, ImagePlus, CheckCircle, Pencil, Package, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BarcodeScanner from "@/components/Scanner/BarcodeScanner";
import { Html5Qrcode } from "html5-qrcode";
import { compressImage } from "@/lib/imageUtils";
import { getCloudinaryCloudName, getCloudinaryUploadPreset, getCloudinaryApiKey, getCloudinaryApiSecret, getCloudinaryMaxImages } from "@/lib/cloudinaryConfig";

type Product = {
  id: string;
  product_number: string;
  name: string;
  purchase_price: number;
  sale_price: number;
  quantity: number;
  image_url: string;
  sale_type: string;
};

type PendingProduct = {
  product_number: string;
  name: string;
  purchase_price: number | string;
  sale_price: number | string;
  quantity: number | string;
  image_url: string;
  image_file?: File;
  image_preview?: string;
  sale_type: string;
};

import { motion } from "framer-motion";
import CloudinarySetupModal from "@/components/Modals/CloudinarySetupModal";
import { useAuth } from "@/contexts/AuthContext";
import { useBarcode } from "@/contexts/BarcodeContext";

export default function ProductsPage() {
  const { currentUser } = useAuth();
  const { scannedBarcode, clearBarcode } = useBarcode();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<'name' | 'sale_price' | 'purchase_price' | 'quantity' | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);
  
  const [showCloudinaryModal, setShowCloudinaryModal] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (scannedBarcode) {
      const existing = products.find(p => p.product_number === scannedBarcode);
      if (existing) {
        setSearchTerm(scannedBarcode);
      } else {
        if (!pendingProducts.some(p => p.product_number === scannedBarcode)) {
          setPendingProducts(prev => [...prev, {
            product_number: scannedBarcode,
            name: '',
            purchase_price: 0,
            sale_price: 0,
            quantity: 0,
            image_url: '',
            sale_type: 'unit'
          }]);
          toast.success("باركود جديد! تم فتح نافذة الإضافة.");
        }
      }
      clearBarcode();
    }
  }, [scannedBarcode, products, pendingProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    const existing = products.find(p => p.product_number === decodedText);
    if (existing) {
      toast.error("هذا المنتج موجود مسبقاً في النظام!");
      setSearchTerm(decodedText);
      return;
    }
    if (pendingProducts.some(p => p.product_number === decodedText)) return;
    setPendingProducts(prev => [...prev, {
      product_number: decodedText,
      name: '',
      purchase_price: 0,
      sale_price: 0,
      quantity: 0,
      image_url: '',
      sale_type: 'unit'
    }]);
  };

  const updatePending = (index: number, field: keyof PendingProduct, value: string | number) => {
    setPendingProducts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const removePending = (index: number) => {
    setPendingProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageSelectForProduct = (file: File, index: number) => {
    // فقط عرض الصورة محليا وتخزين الملف
    const previewUrl = URL.createObjectURL(file);
    updatePending(index, 'image_file', file as any);
    updatePending(index, 'image_preview', previewUrl);
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudName = getCloudinaryCloudName(currentUser);
    const uploadPreset = getCloudinaryUploadPreset(currentUser);
    const maxImages = getCloudinaryMaxImages(currentUser);

    const used = currentUser.storage_used || 0;
    if (used >= maxImages) {
      throw new Error(`لقد استهلكت الحصة المجانية للصور (${maxImages} صورة).`);
    }
    const quality = currentUser.compression_quality !== undefined ? Number(currentUser.compression_quality) : 0.7;
    const compressedFile = await compressImage(file, 800, quality);
    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("upload_preset", uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data.secure_url) {
      const newUsed = used + 1;
      await supabase.from("app_accounts").update({ storage_used: newUsed }).eq("id", currentUser.id);
      const updatedUser = { ...currentUser, storage_used: newUsed };
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      return data.secure_url;
    }
    throw new Error("فشل الرفع السحابي: " + (data.error?.message || "أدوات غير متصلة"));
  };

  const saveSingle = async (index: number) => {
    const rawP = pendingProducts[index];
    if (!rawP.product_number || !rawP.name) {
      toast("أدخل رقم واسم المنتج");
      return;
    }
    
    setSaving(true);
    let finalImageUrl = rawP.image_url;
    
    try {
      if (rawP.image_file) {
        finalImageUrl = await uploadToCloudinary(rawP.image_file);
      }
      
      const p = {
        product_number: rawP.product_number,
        name: rawP.name,
        purchase_price: Number(rawP.purchase_price) || 0,
        sale_price: Number(rawP.sale_price) || 0,
        quantity: Number(rawP.quantity) || 0,
        image_url: finalImageUrl,
        sale_type: rawP.sale_type,
        owner_id: (currentUser?.workspace_id || currentUser?.id)
      };
      
      const { data, error } = await supabase.from('products').insert([p]).select().single();
      if (error) {
        if (error.code === '23505') {
          toast(`المنتج بالباركود ${p.product_number} موجود مسبقاً في متجرك! الرجاء تعديل الكمية من القائمة بدلاً من إضافته كمنتج جديد.`);
        } else {
          toast("خطأ عند الحفظ: " + error.message);
        }
      } else {
        setProducts(prev => [data, ...prev]);
        removePending(index);
      }
    } catch (e: any) {
      toast(e.message || "حدث خطأ أثناء حفظ المنتج");
      if (e.message === "لم يتم إعداد Cloudinary") setShowCloudinaryModal(true);
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    const validRaw = pendingProducts.filter(p => p.product_number && p.name);
    if (validRaw.length === 0) {
      toast("تأكد من إدخال اسم كل منتج");
      return;
    }
    
    setSaving(true);
    let successCount = 0;
    
    for (let i = 0; i < pendingProducts.length; i++) {
      const rawP = pendingProducts[i];
      if (!rawP.product_number || !rawP.name) continue;
      
      try {
        let finalImageUrl = rawP.image_url;
        if (rawP.image_file) {
          finalImageUrl = await uploadToCloudinary(rawP.image_file);
        }
        
        const p = {
          product_number: rawP.product_number,
          name: rawP.name,
          purchase_price: Number(rawP.purchase_price) || 0,
          sale_price: Number(rawP.sale_price) || 0,
          quantity: Number(rawP.quantity) || 0,
          image_url: finalImageUrl,
          sale_type: rawP.sale_type,
          owner_id: (currentUser?.workspace_id || currentUser?.id)
        };
        
        const { error } = await supabase.from('products').insert([p]);
        if (!error) {
          successCount++;
        } else if (error.code === '23505') {
          toast(`المنتج "${rawP.name}" (الباركود: ${rawP.product_number}) موجود مسبقاً! تم تجاهله.`);
        } else {
          console.error("Error inserting product:", error);
        }
      } catch (e: any) {
        console.error("Error saving product:", rawP.name, e);
        if (e.message === "لم يتم إعداد Cloudinary") {
           setShowCloudinaryModal(true);
           break; // Stop saving others if Cloudinary is not setup
        }
      }
    }
    
    if (successCount > 0) {
      toast(`تم حفظ ${successCount} منتج بنجاح`);
      setPendingProducts([]);
      fetchProducts();
    }
    setSaving(false);
  };

  const handleManualBarcode = () => {
    const code = window.prompt("أدخل الباركود يدوياً:");
    if (code && code.trim() !== '') {
      handleScanSuccess(code.trim());
    }
    setShowScanMenu(false);
  };
  
  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const html5QrCode = new Html5Qrcode("hidden-qr-reader");
        const decodedText = await html5QrCode.scanFile(file, true);
        handleScanSuccess(decodedText);
      } catch {
        toast("لم يتم العثور على باركود في الصورة.");
      }
      setShowScanMenu(false);
    }
  };

  const handleAddWithoutBarcode = () => {
    const fakeBarcode = `NOBC-${Date.now()}`;
    handleScanSuccess(fakeBarcode);
  };

  const handleUpdateField = async (id: string, field: 'name' | 'sale_price' | 'purchase_price' | 'quantity') => {
    const val = field === 'name' ? editValue : Number(editValue);
    const { error } = await supabase.from('products').update({ [field]: val }).eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    }
    setEditingId(null);
    setEditField(null);
  };

  const handleDelete = async (id: string) => {
    confirmDialog("تأكيد الحذف", "هل أنت متأكد من مسح هذا المنتج؟", async () => {
      const product = products.find(p => p.id === id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      
      if (!error) {
        // Delete image from Cloudinary if it exists and API keys are set
        if (product?.image_url) {
          try {
            const parts = product.image_url.split('/upload/');
            if (parts.length >= 2) {
              const path = parts[1];
              const withoutVersion = path.replace(/^v\d+\//, '');
              const publicId = decodeURIComponent(withoutVersion.replace(/\.[^/.]+$/, ''));
              const cloudName = getCloudinaryCloudName(currentUser);
              const apiKey = getCloudinaryApiKey(currentUser);
              const apiSecret = getCloudinaryApiSecret(currentUser);

              // Try local API route first (works on Vercel)
              const res = await fetch('/api/cloudinary/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  public_id: publicId,
                  cloud_name: cloudName,
                  api_key: apiKey,
                  api_secret: apiSecret,
                })
              });
              
              if (res.status === 404) {
                // Fallback to direct Admin API for Desktop/Capacitor apps
                const auth = btoa(`${apiKey}:${apiSecret}`);
                await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?public_ids[]=${encodeURIComponent(publicId)}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Basic ${auth}` }
                });
              }
              
              // Decrement storage used
              const used = currentUser.storage_used || 0;
              const newUsed = Math.max(0, used - 1);
              await supabase.from("app_accounts").update({ storage_used: newUsed }).eq("id", currentUser.id);
              
              const updatedUser = { ...currentUser, storage_used: newUsed };
              sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
            }
          } catch (err) {
            console.error("Failed to delete image from Cloudinary", err);
          }
        }
        fetchProducts();
      }
    });
  };

  const handleToggleAdding = () => {
    if (isAdding) {
      setIsScanning(false);
      setShowScanMenu(false);
      setPendingProducts([]);
    }
    setIsAdding(!isAdding);
  };

  const lowStockProducts = products.filter(p => p.quantity < 10);
  const filteredProducts = products.filter(p =>
    p.name.includes(searchTerm) || p.product_number.includes(searchTerm)
  );

  const startEditField = (productId: string, field: 'name' | 'sale_price' | 'purchase_price' | 'quantity', currentValue: string | number) => {
    setEditingId(productId);
    setEditField(field);
    setEditValue(String(currentValue));
  };

  ﻿return (
      <ProtectedLayout>
        <div className="flex flex-col h-full gap-4 pb-2">
          
          {/* Header Row: Title & Low Stock Alert in one compact line if possible, or just Search Bar */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
             <div className="relative w-full md:w-1/2">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="بحث عن منتج بالاسم أو الباركود..."
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm text-right"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir="rtl"
                />
             </div>
             
             {lowStockProducts.length > 0 && (
                <button
                  onClick={() => setShowLowStock(!showLowStock)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm font-bold shrink-0"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>تنبيه المخزون ({lowStockProducts.length})</span>
                </button>
             )}
          </div>

          {/* Pending Products & Add Circle */}
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0 items-center overflow-x-auto scrollbar-hide">
             {/* Pending Products List - inline single row per product */}
             <div className="flex-1 flex gap-2 items-center overflow-x-auto scrollbar-hide">
                {pendingProducts.length > 0 ? (
                   <>
                      {pendingProducts.map((p, index) => (
                         <div key={index} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 shrink-0 shadow-sm">
                            <span className="text-[10px] font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 shrink-0">{p.product_number.length > 8 ? p.product_number.slice(-8) : p.product_number}</span>
                             <label className="cursor-pointer shrink-0 ml-1">
                               <div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors overflow-hidden">
                                 {p.image_preview || p.image_url ? <img src={p.image_preview || p.image_url} className="w-full h-full object-cover" /> : <Camera className="w-3.5 h-3.5 text-gray-500" />}
                               </div>
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) handleImageSelectForProduct(e.target.files[0], index) }} />
                             </label>

                            <input type="text" placeholder="الاسم" value={p.name} onChange={e => updatePending(index, 'name', e.target.value)} className="w-24 text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary" dir="rtl" />
                            <input type="number" placeholder="شراء" value={p.purchase_price || ''} onChange={e => updatePending(index, 'purchase_price', Number(e.target.value))} className="w-14 text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary text-center" dir="ltr" />
                            <input type="number" placeholder="بيع" value={p.sale_price || ''} onChange={e => updatePending(index, 'sale_price', Number(e.target.value))} className="w-14 text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary text-center" dir="ltr" />
                            <input type="number" placeholder="كمية" value={p.quantity || ''} onChange={e => updatePending(index, 'quantity', Number(e.target.value))} className="w-14 text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary text-center" dir="ltr" />
                            <button onClick={() => removePending(index)} className="text-gray-400 hover:text-red-500 shrink-0"><X className="h-3.5 w-3.5" /></button>
                         </div>
                      ))}
                      <button onClick={saveAll} disabled={saving} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 shadow-sm">
                         {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                         حفظ ({pendingProducts.length})
                      </button>
                   </>
                ) : (
                   <div className="text-xs text-gray-400 dark:text-gray-500 italic pr-2">المنتجات التي ستضاف ستظهر هنا...</div>
                )}
             </div>
          </div>

          {/* Barcode Scanner UI (if active) */}
          {isScanning && (
            <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-2 shadow-sm shrink-0 flex flex-col items-center justify-center relative">
              <button onClick={() => setIsScanning(false)} className="absolute top-2 left-2 bg-red-50 hover:bg-red-100 text-red-500 p-1.5 rounded-lg transition-colors z-10"><X className="h-5 w-5" /></button>
              <BarcodeScanner onScanSuccess={handleScanSuccess} continuous={true} />
            </div>
          )}

          {/* Main Table Area */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
             {loading ? (
                <div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
             ) : (
                <div className="flex-1 overflow-y-auto overflow-x-auto">
                   <table className="w-full text-right border-collapse">
                      <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 shadow-sm">
                         <tr>
                            <th className="p-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 w-12 text-center">صورة</th>
                            <th className="p-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">الباركود</th>
                            <th className="p-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">الاسم</th>
                            <th className="p-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 w-16 text-center">الكمية</th>
                            <th className="p-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 w-24">شراء</th>
                            <th className="p-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 w-24">بيع</th>
                            <th className="p-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 w-20 text-center">نوع</th>
                            <th className="p-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 w-16 text-center">إجراء</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {(showLowStock ? lowStockProducts : filteredProducts).map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                               <td className="p-1 border-b border-gray-100 dark:border-gray-800 text-center">
                                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-8 h-8 object-cover rounded bg-white border inline-block" /> : <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 inline-flex items-center justify-center border border-gray-200 dark:border-gray-700"><Package className="h-4 w-4 text-gray-400" /></div>}
                               </td>
                               <td className="p-2 border-b border-gray-100 dark:border-gray-800 text-xs font-mono text-gray-600 dark:text-gray-400">{p.product_number}</td>
                               <td className="p-2 border-b border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white">
                                  {editingId === p.id && editField === 'name' ? (
                                    <input type="text" autoFocus value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={()=>handleUpdateField(p.id, 'name')} onKeyDown={e=>{if(e.key==='Enter') handleUpdateField(p.id, 'name')}} className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" dir="rtl" />
                                  ) : (
                                    <span onClick={()=>startEditField(p.id, 'name', p.name)} className="cursor-pointer border-b border-dashed border-gray-300 hover:border-primary">{p.name}</span>
                                  )}
                               </td>
                               <td className="p-2 border-b border-gray-100 dark:border-gray-800 text-sm text-center">
                                  {editingId === p.id && editField === 'quantity' ? (
                                    <input type="number" autoFocus value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={()=>handleUpdateField(p.id, 'quantity')} onKeyDown={e=>{if(e.key==='Enter') handleUpdateField(p.id, 'quantity')}} className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center" dir="ltr" />
                                  ) : (
                                    <span onClick={()=>startEditField(p.id, 'quantity', p.quantity)} className={`cursor-pointer font-bold px-2 py-0.5 rounded text-xs ${p.quantity < 10 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{p.quantity}</span>
                                  )}
                               </td>
                               <td className="p-2 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300 font-mono">
                                  {editingId === p.id && editField === 'purchase_price' ? (
                                    <input type="number" autoFocus value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={()=>handleUpdateField(p.id, 'purchase_price')} onKeyDown={e=>{if(e.key==='Enter') handleUpdateField(p.id, 'purchase_price')}} className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center" dir="ltr" />
                                  ) : (
                                    <span onClick={()=>startEditField(p.id, 'purchase_price', p.purchase_price)} className="cursor-pointer border-b border-dashed border-gray-300 hover:border-primary">{p.purchase_price} د.ج</span>
                                  )}
                               </td>
                               <td className="p-2 border-b border-gray-100 dark:border-gray-800 text-sm text-primary font-bold font-mono">
                                  {editingId === p.id && editField === 'sale_price' ? (
                                    <input type="number" autoFocus value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={()=>handleUpdateField(p.id, 'sale_price')} onKeyDown={e=>{if(e.key==='Enter') handleUpdateField(p.id, 'sale_price')}} className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center" dir="ltr" />
                                  ) : (
                                    <span onClick={()=>startEditField(p.id, 'sale_price', p.sale_price)} className="cursor-pointer border-b border-dashed border-primary hover:text-primary-hover">{p.sale_price} د.ج</span>
                                  )}
                               </td>
                               <td className="p-2 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 text-center">
                                  {p.sale_type === 'weight' ? 'ميزان' : 'وحدة'}
                               </td>
                               <td className="p-2 border-b border-gray-100 dark:border-gray-800 text-center">
                                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                               </td>
                            </tr>
                         ))}
                         {(showLowStock ? lowStockProducts : filteredProducts).length === 0 && (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-gray-400 text-sm">
                                لا توجد منتجات مطابقة للبحث.
                              </td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
          
          <div id="hidden-qr-reader" className="hidden"></div>
        </div>
        
        <CloudinarySetupModal isOpen={showCloudinaryModal} onClose={() => setShowCloudinaryModal(false)} onSuccess={() => setShowCloudinaryModal(false)} />
        
        {/* Floating Add Button - bottom left */}
        <div className="fixed bottom-20 md:bottom-6 left-6 z-50 flex flex-col items-center">
           {showScanMenu && (
              <div className="mb-3 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2">
                 <button onClick={handleAddWithoutBarcode} className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-right w-full text-xs">
                    <div className="bg-amber-100 p-1.5 rounded-full text-amber-600"><Package className="h-3.5 w-3.5" /></div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">بدون باركود</span>
                 </button>
                 <button onClick={handleManualBarcode} className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-right w-full text-xs">
                    <div className="bg-purple-100 p-1.5 rounded-full text-purple-600"><Pencil className="h-3.5 w-3.5" /></div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">إدخال يدوياً</span>
                 </button>
                 <label className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors w-full text-xs">
                    <div className="bg-blue-100 p-1.5 rounded-full text-blue-600"><ImagePlus className="h-3.5 w-3.5" /></div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">مسح من صورة</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageScan} />
                 </label>
                 <button onClick={() => { setIsScanning(true); setShowScanMenu(false); }} className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-right w-full text-xs">
                    <div className="bg-green-100 p-1.5 rounded-full text-green-600"><Camera className="h-3.5 w-3.5" /></div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">كاميرا الجهاز</span>
                 </button>
              </div>
           )}
           <button onClick={() => setShowScanMenu(!showScanMenu)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl bg-primary hover:bg-primary-hover shadow-primary/30 text-white active:scale-90`}>
              <Plus className="h-7 w-7" />
           </button>
        </div>
      </ProtectedLayout>
    );
}