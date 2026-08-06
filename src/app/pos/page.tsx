"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { QrCode, Search, Trash2, Plus, Minus, Save, ShoppingCart, Loader2, X, ImagePlus, Camera, Undo2 } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import BarcodeScanner from "@/components/Scanner/BarcodeScanner";
import { motion } from "framer-motion";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customTotal, setCustomTotal] = useState<string>("");

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
      // Removed setIsScanning(false) so it keeps scanning
    } else {
      alert("المنتج غير موجود!");
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
        alert("لم يتم العثور على باركود في الصورة.");
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
    setCustomTotal(""); // Reset custom total when items change
  };

  const updateQuantity = (id: string, delta: number) => {
    setInvoiceItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
    setCustomTotal("");
  };

  const removeItem = (id: string) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== id));
    setCustomTotal("");
  };

  // الحسابات
  const calculatedTotal = invoiceItems.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
  const activeTotal = customTotal !== "" ? Number(customTotal) : calculatedTotal;
  const calculatedProfit = invoiceItems.reduce((sum, item) => sum + ((item.sale_price - item.purchase_price) * item.quantity), 0);
  // إذا تم تعديل الإجمالي يدوياً، يتم تعديل الربح بنفس الفارق
  const activeProfit = customTotal !== "" ? calculatedProfit - (calculatedTotal - Number(customTotal)) : calculatedProfit;

  const saveInvoice = async () => {
    if (invoiceItems.length === 0) return;
    setSaving(true);
    
    const multiplier = isReturnMode ? -1 : 1;
    const total = activeTotal * multiplier;
    const totalProfit = activeProfit * multiplier;

    try {
      const invoiceNumber = isReturnMode ? `RET-${Date.now()}` : `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{ invoice_number: invoiceNumber, total: total, profit: totalProfit }])
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;

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

      for (const item of invoiceItems) {
         const product = products.find(p => p.id === item.id);
         if (product) {
           await supabase.from('products').update({ quantity: product.quantity - (item.quantity * multiplier) }).eq('id', item.id);
         }
      }

      alert(isReturnMode ? "تم حفظ الاسترجاع!" : "تم حفظ البيعة!");
      setInvoiceItems([]);
      setCustomTotal("");
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

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
        
        {/* وضع البيع / الاسترجاع */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsReturnMode(false)}
            className={`flex-1 py-2.5 text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${!isReturnMode ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <ShoppingCart className="h-5 w-5" /> بيع
          </button>
          <button
            onClick={() => setIsReturnMode(true)}
            className={`flex-1 py-2.5 text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${isReturnMode ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <Undo2 className="h-5 w-5" /> استرجاع
          </button>
        </div>

        {/* بحث */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالرقم أو الاسم..."
              className="w-full pl-3 pr-10 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              onKeyDown={handleManualSearch}
            />
          </div>
        </div>

        {/* تفاصيل البيعة */}
        <div className="w-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isScanning && (
            <div className="w-full border-b border-gray-200 dark:border-gray-700 bg-black/5 dark:bg-white/5 py-4 px-4">
              <BarcodeScanner
                onScanSuccess={handleScanSuccess}
                continuous={true}
              />
            </div>
          )}
          <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${isReturnMode ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
            <h2 className={`text-lg font-bold ${isReturnMode ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
              {isReturnMode ? "استرجاع" : "البيعة"}
            </h2>
            <span className="text-base text-gray-500 dark:text-gray-400 font-medium">{invoiceItems.length} منتج</span>
          </div>
          
          <div className="overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
            {invoiceItems.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <ShoppingCart className="h-16 w-16 mb-3 opacity-20" />
                <p className="text-lg">لا توجد منتجات</p>
                <p className="text-sm mt-1">امسح منتج للبدء</p>
              </div>
            ) : (
              invoiceItems.map(item => (
                <div key={item.id} className="flex flex-col gap-2 p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-700/20">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-5 w-5" /></button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-primary font-bold text-xl">{item.sale_price} د.ج</span>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><Minus className="h-5 w-5" /></button>
                      <span className="text-lg font-bold w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><Plus className="h-5 w-5" /></button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-left mt-1 border-t border-dashed border-gray-200 dark:border-gray-600 pt-2">
                    المجموع: <span className="font-bold text-gray-900 dark:text-white">{(item.sale_price * item.quantity).toLocaleString()} د.ج</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 space-y-3">
            {/* الإجمالي - قابل للتعديل */}
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white">
              <span>الإجمالي:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customTotal !== "" ? customTotal : calculatedTotal}
                  onChange={(e) => setCustomTotal(e.target.value)}
                  className="w-32 text-left text-xl font-bold text-primary bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-primary text-base">د.ج</span>
              </div>
            </div>
            
            {/* الربح - للقراءة فقط */}
            <div className="flex justify-between items-center text-lg font-bold border-b border-dashed border-gray-300 dark:border-gray-600 pb-3">
              <span className="text-green-600 dark:text-green-400">الربح:</span>
              <span className="text-green-600 dark:text-green-400">{activeProfit.toLocaleString()} د.ج</span>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={saveInvoice}
              disabled={invoiceItems.length === 0 || saving}
              className={`w-full flex items-center justify-center gap-2 text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg mt-2 ${isReturnMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? "جاري الحفظ..." : (isReturnMode ? "تأكيد الاسترجاع" : "حفظ البيعة")}
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 pb-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">®HERMA_LAISSAOUI_ISLAM_Developer</p>
        </div>
      </div>

      {/* زر المسح العائم */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-center">
        {showScanMenu && !isScanning && (
          <div className="mb-4 flex flex-col gap-3 origin-bottom animate-in fade-in slide-in-from-bottom-4 items-center">
            <label className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110" title="رفع صورة">
               <ImagePlus className="h-5 w-5" />
               <input type="file" accept="image/*" className="hidden" onChange={handleImageScan} />
            </label>
            <button 
              onClick={() => { setIsScanning(true); setShowScanMenu(false); }}
              className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-transform hover:scale-110" title="كاميرا المسح"
            >
               <Camera className="h-5 w-5" />
            </button>
          </div>
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
