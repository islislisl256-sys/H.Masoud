"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { QrCode, Search, Trash2, Plus, Minus, Save, ShoppingCart, Loader2, X, ImagePlus, Camera, ScanFace, Undo2 } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import BarcodeScanner from "@/components/Scanner/BarcodeScanner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import PhoneCameraPicker from "@/components/PhoneCameraPicker";
import { useNotification } from "@/contexts/NotificationContext";

type Product = {
  id: string;
  product_number: string;
  name: string;
  sale_price: number;
  purchase_price: number;
  quantity: number;
};

type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  sale_price: number;
  purchase_price: number;
};

export default function POSPage() {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [scanMode, setScanMode] = useState<"user" | "environment">("environment");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualTotal, setManualTotal] = useState<number | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    const product = products.find(p => p.product_number === decodedText);
    if (product) {
      addProduct(product);
    } else {
      showNotification("المنتج غير موجود في قاعدة البيانات!", "error");
    }
  };

  // Helper to process an image file for QR/barcode scanning
  const processImageFile = async (file: File) => {
    try {
      const html5QrCode = new Html5Qrcode("hidden-qr-reader-pos");
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      showNotification("لم يتم العثور على باركود في الصورة، تأكد من وضوح الصورة.", "error");
    }
    setShowScanMenu(false);
  };

  // Updated image scan handler using the helper
  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processImageFile(file);
    }
  };

  // Handle capture from PhoneCameraPicker
  const handleCapture = async (dataUrl: string, source: 'rear' | 'front' | 'gallery' | 'scan') => {
    if (source === 'rear' || source === 'front') {
      setScanMode(source === 'rear' ? 'environment' : 'user');
      setIsScanning(true);
      setShowScanMenu(false);
    } else if (source === 'gallery') {
      // Convert dataURL to File and process
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "capture.png", { type: blob.type });
      await processImageFile(file);
    } else if (source === 'scan') {
      // Directly start scanning (same as tap QR button)
      setIsScanning(true);
      setShowScanMenu(false);
    }
  };

  const handleManualSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleScanSuccess(searchQuery);
      setSearchQuery("");
    }
  };

  const addProduct = (product: Product) => {
    setManualTotal(null);
    setInvoiceItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setManualTotal(null);
    setInvoiceItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setManualTotal(null);
    setInvoiceItems(prev => prev.filter(item => item.id !== id));
  };

  const saveInvoice = async () => {
    if (invoiceItems.length === 0) return;
    setSaving(true);
    
    const multiplier = isReturnMode ? -1 : 1;
    
    const rawTotal = invoiceItems.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
    const currentTotal = manualTotal !== null ? manualTotal : rawTotal;
    const totalPurchaseCost = invoiceItems.reduce((sum, item) => sum + (item.purchase_price * item.quantity), 0);
    const currentProfit = currentTotal - totalPurchaseCost;
    
    const finalTotal = currentTotal * multiplier;
    const finalProfit = currentProfit * multiplier;

    try {
      // 1. Insert Invoice
      const invoiceNumber = isReturnMode ? `RET-${Date.now()}` : `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{ invoice_number: invoiceNumber, total: finalTotal, profit: finalProfit }])
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;

      // 2. Insert Invoice Items
      const itemsToInsert = invoiceItems.map(item => ({
        invoice_id: invoice.id,
        product_id: item.id,
        quantity: item.quantity * multiplier,
        unit_price: item.sale_price,
        total_price: (item.sale_price * item.quantity) * multiplier,
        profit: ((item.sale_price - item.purchase_price) * item.quantity) * multiplier,
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      // 3. Update Stock & Auto-delete
      for (const item of invoiceItems) {
         const product = products.find(p => p.id === item.id);
         if (product) {
           const newQty = product.quantity - (item.quantity * multiplier);
           if (newQty <= 0) {
             await supabase.from('products').delete().eq('id', item.id);
             showNotification(`تم حذف المنتج ${product.name} لنفاد الكمية من المخزن`, "info");
           } else {
             await supabase.from('products').update({ quantity: newQty }).eq('id', item.id);
           }
         }
      }

      showNotification(isReturnMode ? "تم حفظ وصل الاسترجاع بنجاح!" : "تم حفظ الفاتورة بنجاح!", "success");
      setInvoiceItems([]);
      setManualTotal(null);
      fetchProducts(); // Refresh stock
    } catch (error) {
      console.error(error);
      showNotification("حدث خطأ أثناء حفظ الفاتورة", "error");
    } finally {
      setSaving(false);
    }
  };

  const rawTotal = invoiceItems.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
  const currentTotal = manualTotal !== null ? manualTotal : rawTotal;
  const totalPurchaseCost = invoiceItems.reduce((sum, item) => sum + (item.purchase_price * item.quantity), 0);
  const currentProfit = currentTotal - totalPurchaseCost;

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-4 pb-24">
        
        {/* Mode Toggle (Sale / Return) */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsReturnMode(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${!isReturnMode ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            <ShoppingCart className="h-4 w-4" /> نقطة البيع
          </button>
          <button
            onClick={() => setIsReturnMode(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${isReturnMode ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            <Undo2 className="h-4 w-4" /> استرجاع منتج
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">بحث سريع بالاسم أو رقم الباركود</h3>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم المنتج أو الاسم..."
              className="w-full pl-3 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              onKeyDown={handleManualSearch}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">اضغط Enter للإضافة السريعة عند استخدام قارئ باركود خارجي</p>
        </div>
        {/* Image picker */}
        <div className="flex items-center mt-2">
          <button
            type="button"
            onClick={() => setShowImagePicker(true)}
            className="flex items-center gap-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            <ImagePlus className="h-4 w-4" />
            رفع صورة من الهاتف
          </button>
        </div>
        {showImagePicker && (
          <PhoneCameraPicker
            onCapture={(dataUrl, source) => {
              setShowImagePicker(false);
              // TODO: handle captured image if needed
            }}
          />
        )}

        {/* Invoice Details - Full Width */}
        <div className="w-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isScanning && (
            <div className="w-full border-b border-gray-200 dark:border-gray-700 bg-black/5 dark:bg-white/5 py-4 px-4">
              <BarcodeScanner 
                defaultMode={scanMode || "environment"}
                onScanSuccess={handleScanSuccess}
                continuous={true}
              />
            </div>
          )}
          <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${isReturnMode ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
            <h2 className={`text-lg font-bold ${isReturnMode ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
              {isReturnMode ? "تفاصيل وصل الاسترجاع" : "تفاصيل الفاتورة"}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{invoiceItems.length} منتج</span>
          </div>
          
          <div className="overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
            {invoiceItems.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <ShoppingCart className="h-16 w-16 mb-3 opacity-20" />
                <p className="text-lg">الفاتورة فارغة</p>
                <p className="text-sm mt-1">اضغط على زر الماسح الأزرق لمسح منتج</p>
              </div>
            ) : (
              invoiceItems.map(item => (
                <div key={item.id} className="flex flex-col gap-2 p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-700/20">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-900 dark:text-white text-base">{item.name}</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-5 w-5" /></button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-primary font-bold text-lg">{item.sale_price} د.ج</span>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><Minus className="h-4 w-4" /></button>
                      <span className="text-base font-bold w-6 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-left mt-1 border-t border-dashed border-gray-200 dark:border-gray-600 pt-2">
                    الإجمالي: <span className="font-bold text-gray-900 dark:text-white">{(item.sale_price * item.quantity).toLocaleString()} د.ج</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 space-y-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>عدد المنتجات:</span>
              <span className="font-medium text-gray-900 dark:text-white">{invoiceItems.length}</span>
            </div>
            
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="font-bold text-gray-900 dark:text-white text-lg">السعر الإجمالي:</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={currentTotal} 
                  onChange={e => setManualTotal(Number(e.target.value))}
                  className="w-32 text-left font-bold text-xl px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-primary focus:ring-2 focus:ring-primary dark:bg-gray-700 outline-none"
                />
                <span className="text-gray-500 font-medium">د.ج</span>
              </div>
            </div>

            <div className="flex justify-between text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
              <span>الربح الإجمالي (متغير مع السعر):</span>
              <span>{currentProfit.toLocaleString()} د.ج</span>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={saveInvoice}
              disabled={invoiceItems.length === 0 || saving}
              className={`w-full flex items-center justify-center gap-2 text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg mt-4 ${isReturnMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
              {saving ? "جاري الحفظ..." : (isReturnMode ? "تأكيد الاسترجاع" : "حفظ الفاتورة")}
            </motion.button>
          </div>
        </div>

      </div>

{/* Fixed Floating Scan Button - Above Bottom Nav */}
<div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-center">
  {showScanMenu && !isScanning && (
    <PhoneCameraPicker onCapture={handleCapture} />
  )}
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={() => isScanning ? setIsScanning(false) : setShowScanMenu(!showScanMenu)}
    className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${
            isScanning
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
              : "bg-primary hover:bg-primary-hover shadow-primary/30"
          }`}
  >
    {isScanning ? (
      <X className="h-7 w-7 text-white" />
    ) : (
      <QrCode className="h-7 w-7 text-white" />
    )}
  </motion.button>
</div>


      
      <div id="hidden-qr-reader-pos" className="hidden"></div>
    </ProtectedLayout>
  );
}
