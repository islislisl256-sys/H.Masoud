"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { QrCode, Search, Trash2, Plus, Minus, Save, ShoppingCart, Loader2, X, ImagePlus, Camera, ScanFace } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import BarcodeScanner from "@/components/Scanner/BarcodeScanner";
import { supabase } from "@/lib/supabase";

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
  const [searchQuery, setSearchQuery] = useState("");

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
      alert("المنتج غير موجود في قاعدة البيانات!");
    }
  };

  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const html5QrCode = new Html5Qrcode("hidden-qr-reader-pos");
        const decodedText = await html5QrCode.scanFile(file, true);
        handleScanSuccess(decodedText);
      } catch (err) {
        alert("لم يتم العثور على باركود في الصورة، تأكد من وضوح الصورة.");
      }
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
    setInvoiceItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== id));
  };

  const saveInvoice = async () => {
    if (invoiceItems.length === 0) return;
    setSaving(true);
    
    const total = invoiceItems.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
    const totalProfit = invoiceItems.reduce((sum, item) => sum + ((item.sale_price - item.purchase_price) * item.quantity), 0);

    try {
      // 1. Insert Invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{ invoice_number: invoiceNumber, total: total, profit: totalProfit }])
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;

      // 2. Insert Invoice Items
      const itemsToInsert = invoiceItems.map(item => ({
        invoice_id: invoice.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.sale_price,
        total_price: item.sale_price * item.quantity,
        profit: (item.sale_price - item.purchase_price) * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      // 3. Update Stock
      for (const item of invoiceItems) {
         const product = products.find(p => p.id === item.id);
         if (product) {
           await supabase.from('products').update({ quantity: product.quantity - item.quantity }).eq('id', item.id);
         }
      }

      alert("تم حفظ الفاتورة بنجاح!");
      setInvoiceItems([]);
      fetchProducts(); // Refresh stock
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ الفاتورة");
    } finally {
      setSaving(false);
    }
  };

  const total = invoiceItems.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
  const totalProfit = invoiceItems.reduce((sum, item) => sum + ((item.sale_price - item.purchase_price) * item.quantity), 0);

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
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">تفاصيل الفاتورة</h2>
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
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>عدد المنتجات:</span>
              <span className="font-medium text-gray-900 dark:text-white">{invoiceItems.length}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-b border-dashed border-gray-300 dark:border-gray-600 pb-3">
              <span>الإجمالي:</span>
              <span className="text-primary">{total.toLocaleString()} د.ج</span>
            </div>
            
            <button 
              onClick={saveInvoice}
              disabled={invoiceItems.length === 0 || saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg mt-2"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? "جاري الحفظ..." : "حفظ الفاتورة"}
            </button>
          </div>
        </div>

      </div>

      {/* Fixed Floating Scan Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
        {showScanMenu && !isScanning && (
          <div className="mb-4 flex flex-col gap-3 origin-bottom animate-in fade-in slide-in-from-bottom-4 items-center">
            <label className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110" title="رفع صورة من الهاتف">
               <ImagePlus className="h-5 w-5" />
               <input type="file" accept="image/*" className="hidden" onChange={handleImageScan} />
            </label>
            <button 
              onClick={() => { setScanMode("user"); setIsScanning(true); setShowScanMenu(false); }}
              className="flex items-center justify-center w-12 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-transform hover:scale-110" title="تصوير بالكاميرا الأمامية"
            >
               <ScanFace className="h-5 w-5" />
            </button>
            <button 
              onClick={() => { setScanMode("environment"); setIsScanning(true); setShowScanMenu(false); }}
              className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-transform hover:scale-110" title="تصوير بالكاميرا الخلفية"
            >
               <Camera className="h-5 w-5" />
            </button>
          </div>
        )}
        <button
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
        </button>
      </div>


      
      <div id="hidden-qr-reader-pos" className="hidden"></div>
    </ProtectedLayout>
  );
}
