"use client";

import React, { useState, useEffect, useMemo } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { QrCode, Search, Trash2, Plus, Minus, Save, ShoppingCart, Loader2, X, ImagePlus, Camera, Package, Weight } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import BarcodeScanner from "@/components/Scanner/BarcodeScanner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  product_number: string;
  name: string;
  sale_price: number;
  purchase_price: number;
  quantity: number;
  image_url: string;
  sale_type: string;
};

type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  sale_price: number;
  purchase_price: number;
  sale_type: string;
};

type Cart = {
  id: string;
  name: string;
  items: InvoiceItem[];
};

export default function POSPage() {
  const [carts, setCarts] = useState<Cart[]>([{ id: 'cart-1', name: 'فاتورة 1', items: [] }]);
  const [activeCartId, setActiveCartId] = useState<string>('cart-1');
  
  const [isScanning, setIsScanning] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customTotal, setCustomTotal] = useState<string>("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQ = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQ) || 
      p.product_number.toLowerCase().includes(lowerQ)
    ).slice(0, 5);
  }, [searchQuery, products]);

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
    setCarts(prevCarts => prevCarts.map(cart => {
      if (cart.id === activeCartId) {
        const existing = cart.items.find(item => item.id === product.id);
        if (existing) {
          return {
            ...cart,
            items: cart.items.map(item => 
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          };
        }
        return {
          ...cart,
          items: [...cart.items, { ...product, quantity: 1 }]
        };
      }
      return cart;
    }));
    setCustomTotal("");
  };

  const updateQuantity = (id: string, newQ: number) => {
    setCarts(prevCarts => prevCarts.map(cart => {
      if (cart.id === activeCartId) {
        return {
          ...cart,
          items: cart.items.map(item => {
            if (item.id === id) {
              return { ...item, quantity: Math.max(0.01, newQ) };
            }
            return item;
          })
        };
      }
      return cart;
    }));
    setCustomTotal("");
  };

  const removeItem = (id: string) => {
    setCarts(prevCarts => prevCarts.map(cart => {
      if (cart.id === activeCartId) {
        return {
          ...cart,
          items: cart.items.filter(item => item.id !== id)
        };
      }
      return cart;
    }));
    setCustomTotal("");
  };

  const createNewCart = () => {
    const newId = `cart-${Date.now()}`;
    setCarts(prev => [...prev, { id: newId, name: `فاتورة ${prev.length + 1}`, items: [] }]);
    setActiveCartId(newId);
    setCustomTotal("");
  };

  const closeCart = (id: string) => {
    if (carts.length === 1) {
      setCarts([{ id: 'cart-1', name: 'فاتورة 1', items: [] }]);
      setActiveCartId('cart-1');
    } else {
      const newCarts = carts.filter(c => c.id !== id);
      setCarts(newCarts);
      if (activeCartId === id) {
        setActiveCartId(newCarts[0].id);
      }
    }
    setCustomTotal("");
  };

  const activeCart = carts.find(c => c.id === activeCartId) || carts[0];
  const invoiceItems = activeCart.items;

  // الحسابات
  const calculatedTotal = invoiceItems.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
  const activeTotal = customTotal !== "" ? Number(customTotal) : calculatedTotal;
  const calculatedProfit = invoiceItems.reduce((sum, item) => sum + ((item.sale_price - item.purchase_price) * item.quantity), 0);
  const activeProfit = customTotal !== "" ? calculatedProfit - (calculatedTotal - Number(customTotal)) : calculatedProfit;

  const saveInvoice = async () => {
    if (invoiceItems.length === 0) return;
    setSaving(true);
    
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{ invoice_number: invoiceNumber, total: activeTotal, profit: activeProfit }])
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;

      const itemsToInsert = invoiceItems.map(item => ({
        invoice_id: invoice.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.sale_price,
        total_price: (item.sale_price * item.quantity),
        profit: ((item.sale_price - item.purchase_price) * item.quantity),
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      for (const item of invoiceItems) {
         const product = products.find(p => p.id === item.id);
         if (product) {
           await supabase.from('products').update({ quantity: product.quantity - item.quantity }).eq('id', item.id);
         }
      }

      alert("تم حفظ البيعة!");
      closeCart(activeCartId); // Close it after success
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

  // فرز المنتجات السريعة
  const quickProducts = products.filter(p => p.image_url || p.product_number.startsWith('NOBC'));
  // المنتجات التي تباع بالوزن
  const weightProducts = products.filter(p => p.sale_type === 'weight' || p.sale_type === 'volume');

  return (
    <ProtectedLayout>
      <div className="space-y-4 pb-24">
        
        {/* تعدد الفواتير */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {carts.map(cart => (
            <button
              key={cart.id}
              onClick={() => setActiveCartId(cart.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                activeCartId === cart.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              {cart.name}
              {cart.items.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeCartId === cart.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'}`}>
                  {cart.items.length}
                </span>
              )}
              {carts.length > 1 && (
                <div 
                  onClick={(e) => { e.stopPropagation(); closeCart(cart.id); }}
                  className="p-0.5 hover:bg-red-500 hover:text-white rounded-full ml-1"
                >
                  <X className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
          <button
            onClick={createNewCart}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors whitespace-nowrap border border-green-200 dark:border-green-900/50"
          >
            <Plus className="h-4 w-4" />
            فاتورة جديدة
          </button>
        </div>

        {/* بحث سريع */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 relative">
          <div className="relative z-10">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث سريع بالباركود أو الاسم..."
              className="w-full pl-3 pr-10 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              onKeyDown={handleManualSearch}
            />
          </div>
          {searchQuery.trim() && searchResults.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
              {searchResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => { addProduct(p); setSearchQuery(""); }}
                  className="w-full text-right px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.product_number}</p>
                  </div>
                  <span className="font-bold text-primary">{p.sale_price} د.ج</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* قائمة المنتجات السريعة (منتجات بلا باركود / بصور) */}
        {quickProducts.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 px-1">المنتجات السريعة</h3>
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
              {quickProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => addProduct(p)}
                  className="relative flex-shrink-0 w-28 h-32 flex flex-col items-center justify-end p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-primary transition-colors active:scale-95 overflow-hidden bg-white dark:bg-gray-800"
                >
                  {p.image_url ? (
                    <>
                      <img src={p.image_url} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="relative z-10 w-full text-center">
                        <p className="font-bold text-white text-sm truncate">{p.name}</p>
                        <p className="text-xs text-blue-300 font-bold mt-0.5">{p.sale_price} د.ج</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-2">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="w-full text-center">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{p.name}</p>
                        <p className="text-xs text-primary font-bold mt-0.5">{p.sale_price} د.ج</p>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* منتجات الميزان */}
        {weightProducts.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 px-1">الميزان واللتر</h3>
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
              {weightProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => addProduct(p)}
                  className="flex-shrink-0 flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-amber-500 transition-colors active:scale-95 pr-4 pl-6"
                >
                  <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2 rounded-lg">
                    <Weight className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white text-base">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sale_type === 'weight' ? 'بالكيلوغرام' : 'باللتر'} • <span className="text-primary font-bold">{p.sale_price} د.ج</span></p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* تفاصيل البيعة */}
        <div className="w-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-4">
          {isScanning && (
            <div className="w-full border-b border-gray-200 dark:border-gray-700 bg-black/5 dark:bg-white/5 py-4 px-4">
              <BarcodeScanner
                onScanSuccess={handleScanSuccess}
                continuous={true}
              />
            </div>
          )}
          
          <div className="overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
            {invoiceItems.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <ShoppingCart className="h-16 w-16 mb-3 opacity-20" />
                <p className="text-lg">السلة فارغة</p>
                <p className="text-sm mt-1">امسح منتج أو اختر من القائمة للبدء</p>
              </div>
            ) : (
              invoiceItems.map(item => (
                <div key={item.id} className="flex flex-col gap-2 p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-700/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</span>
                      {item.sale_type === 'weight' || item.sale_type === 'volume' ? (
                        <span className="inline-block mx-2 text-xs bg-amber-100 text-amber-700 px-2 rounded-full">ميزان</span>
                      ) : null}
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-5 w-5" /></button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-primary font-bold text-xl">{item.sale_price} د.ج</span>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><Minus className="h-5 w-5" /></button>
                      <input 
                        type="number" 
                        step={item.sale_type === 'weight' || item.sale_type === 'volume' ? "0.01" : "1"}
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)} 
                        className="w-16 text-center text-lg font-bold text-gray-900 dark:text-white bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><Plus className="h-5 w-5" /></button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-left mt-1 border-t border-dashed border-gray-200 dark:border-gray-600 pt-2">
                    المجموع: <span className="font-bold text-gray-900 dark:text-white">{(item.sale_price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ج</span>
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
              <span className="text-green-600 dark:text-green-400">{activeProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} د.ج</span>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={saveInvoice}
              disabled={invoiceItems.length === 0 || saving}
              className={`w-full flex items-center justify-center gap-2 text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg mt-2 bg-primary hover:bg-primary/90`}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? "جاري الحفظ..." : "تأكيد البيعة"}
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
