"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { QrCode, Search, Trash2, Plus, Minus, Save, ShoppingCart, Loader2 } from "lucide-react";
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
      setIsScanning(false);
    } else {
      alert("المنتج غير موجود في قاعدة البيانات!");
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
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{ total_amount: total, total_profit: totalProfit }])
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;

      // 2. Insert Invoice Items
      const itemsToInsert = invoiceItems.map(item => ({
        invoice_id: invoice.id,
        product_id: item.id,
        quantity: item.quantity,
        sale_price_at_time: item.sale_price,
        purchase_price_at_time: item.purchase_price,
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
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        
        {/* Left Side: Invoice Panel */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">تفاصيل الفاتورة</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {invoiceItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                <p>الفاتورة فارغة. قم بمسح منتج للإضافة.</p>
              </div>
            ) : (
              invoiceItems.map(item => (
                <div key={item.id} className="flex flex-col gap-2 p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-700/20">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-primary font-bold">{item.sale_price} د.ج</span>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-left mt-1 border-t border-dashed pt-1">
                    الإجمالي: <span className="font-bold text-gray-900 dark:text-white">{item.sale_price * item.quantity} د.ج</span>
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
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-b border-dashed border-gray-300 dark:border-gray-600 pb-2">
              <span>الإجمالي:</span>
              <span className="text-primary">{total.toLocaleString()} د.ج</span>
            </div>
            
            <button 
              onClick={saveInvoice}
              disabled={invoiceItems.length === 0 || saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg mt-2"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? "جاري الحفظ..." : "حفظ الفاتورة"}
            </button>
          </div>
        </div>

        {/* Right Side: Scanner & Quick Search */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden group">
            {isScanning ? (
              <div className="w-full h-full flex flex-col items-center">
                 <button onClick={() => setIsScanning(false)} className="mb-4 text-sm text-red-500 border border-red-200 px-4 py-2 rounded hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20">
                    إلغاء المسح
                 </button>
                 <BarcodeScanner 
                    onScanSuccess={handleScanSuccess} 
                 />
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="mx-auto w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <QrCode className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">امسح رمز QR الخاص بالمنتج</h3>
                  <p className="text-gray-500 dark:text-gray-400">وجه الكاميرا أو القارئ نحو رمز المنتج لإضافته مباشرة إلى الفاتورة</p>
                </div>
                <button 
                  onClick={() => setIsScanning(true)}
                  className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-md shadow-primary/20"
                >
                  تشغيل الكاميرا
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">أو أضف يدوياً (بحث سريع)</h3>
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
        </div>

      </div>
    </ProtectedLayout>
  );
}
