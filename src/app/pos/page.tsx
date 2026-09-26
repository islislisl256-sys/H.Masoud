"use client";
import toast from 'react-hot-toast';
import { showSystemToast } from '@/components/CustomToasts';

import React, { useState, useEffect, useMemo } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { QrCode, Search, Trash2, Pencil, Plus, Minus, Save, ShoppingCart, Loader2, X, ImagePlus, Camera, Package, Weight, Printer, ScanLine, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import BarcodeScanner from "@/components/Scanner/BarcodeScanner";
import ReceiptTemplate from "@/components/POS/ReceiptTemplate";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useBarcode } from "@/contexts/BarcodeContext";
import { useAuth } from "@/contexts/AuthContext";

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
  const { currentUser } = useAuth();
  const [carts, setCarts] = useState<Cart[]>([{ id: 'cart-1', name: 'فاتورة 1', items: [] }]);
  const [activeCartId, setActiveCartId] = useState<string>('cart-1');
  
  const [isScanning, setIsScanning] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customTotal, setCustomTotal] = useState<string>("");

  // Hardware Scanner & Printer Settings
  const [hardwareScannerActive, setHardwareScannerActive] = useState(true);
  const [printerSize, setPrinterSize] = useState<'58mm' | '80mm'>('80mm');
  const [lastSavedInvoice, setLastSavedInvoice] = useState<{ number: string, items: any[], total: number, date: Date } | null>(null);

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
      toast("المنتج غير موجود!");
    }
  };

  const { scannedBarcode, clearBarcode } = useBarcode();

  useEffect(() => {
    if (scannedBarcode) {
      handleScanSuccess(scannedBarcode);
      clearBarcode();
    }
  }, [scannedBarcode, products]);

  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const html5QrCode = new Html5Qrcode("hidden-qr-reader-pos");
        const decodedText = await html5QrCode.scanFile(file, true);
        handleScanSuccess(decodedText);
      } catch (err) {
        toast("لم يتم العثور على باركود في الصورة.");
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

  const calculatedTotal = invoiceItems.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
  const activeTotal = customTotal !== "" ? Number(customTotal) : calculatedTotal;
  const calculatedProfit = invoiceItems.reduce((sum, item) => sum + ((item.sale_price - item.purchase_price) * item.quantity), 0);
  const activeProfit = customTotal !== "" ? calculatedProfit - (calculatedTotal - Number(customTotal)) : calculatedProfit;

  const saveInvoice = async (printReceipt: boolean) => {
    if (invoiceItems.length === 0) return;
    setSaving(true);
    
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{ invoice_number: invoiceNumber, total: activeTotal, profit: activeProfit, owner_id: (currentUser?.workspace_id || currentUser?.id) }])
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;

      const itemsToInsert = invoiceItems.map(item => ({
        invoice_id: invoice.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.sale_price,
        total_price: item.sale_price * item.quantity,
        profit: (item.sale_price - item.purchase_price) * item.quantity,
        owner_id: (currentUser?.workspace_id || currentUser?.id),
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      for (const item of invoiceItems) {
         const product = products.find(p => p.id === item.id);
         if (product) {
           const newQuantity = product.quantity - item.quantity;
           await supabase.from('products').update({ quantity: newQuantity }).eq('id', item.id);
         }
      }

      if (printReceipt) {
        setLastSavedInvoice({
          number: invoiceNumber,
          items: invoiceItems,
          total: activeTotal,
          date: new Date()
        });
        
        setTimeout(() => {
          window.print();
          setLastSavedInvoice(null);
          closeCart(activeCartId);
          fetchProducts();
          setSaving(false);
        }, 500);
      } else {
        toast("تم حفظ البيعة بنجاح!");
        closeCart(activeCartId);
        fetchProducts();
        setSaving(false);
      }
    } catch (error) {
      console.error(error);
      toast("حدث خطأ أثناء الحفظ");
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
      <div className="flex flex-col h-full gap-2 pb-2">
        {/* Row 1: Carts Navigation */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide shadow-sm shrink-0">
          {carts.map(cart => (
            <button
              key={cart.id}
              onClick={() => setActiveCartId(cart.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${
                activeCartId === cart.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              {cart.name}
              {cart.items.length > 0 && <span className="bg-white/30 text-[10px] px-1.5 rounded-full">{cart.items.length}</span>}
              {carts.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); closeCart(cart.id); }}
                  className={`ml-1 p-0.5 rounded-full hover:bg-black/20 ${activeCartId === cart.id ? 'text-white/70' : 'text-gray-400'}`}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </button>
          ))}
          <button
            onClick={createNewCart}
            className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-sm bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" /> جديد
          </button>
        </div>

        {/* Row 2: Search Bar & Total Price */}
        <div className="flex flex-col md:flex-row gap-3 items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
          <div className="flex-1 flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm text-right font-mono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleManualSearch}
                dir="rtl"
              />
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                  {searchResults.map(p => (
                    <button key={p.id} onClick={() => { addProduct(p); setSearchQuery(''); }} className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-right text-sm border-b last:border-b-0 border-gray-100 dark:border-gray-700">
                      {p.image_url ? <img src={p.image_url} className="w-6 h-6 rounded object-cover" /> : <Package className="h-4 w-4 text-gray-400" />}
                      <span className="flex-1 font-bold text-gray-800 dark:text-gray-200 truncate">{p.name}</span>
                      <span className="text-primary font-bold text-xs">{p.sale_price} د.ج</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setHardwareScannerActive(!hardwareScannerActive)} className={`p-2 rounded-lg transition-colors ${hardwareScannerActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`} title="USB Scanner">
               <ScanLine className="h-5 w-5" />
            </button>
            <button onClick={() => setIsScanning(!isScanning)} className={`p-2 rounded-lg transition-colors ${isScanning ? 'bg-red-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}>
               {isScanning ? <X className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
            </button>
            <label className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
               <ImagePlus className="h-5 w-5" />
               <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" onChange={handleImageScan} />
            </label>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0">
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">الإجمالي:</span>
            <input 
               type="number" 
               value={customTotal !== "" ? customTotal : calculatedTotal} 
               onChange={(e) => setCustomTotal(e.target.value)} 
               className="w-24 bg-transparent border-b-2 border-primary outline-none text-xl font-bold text-primary text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               dir="ltr"
            />
            <span className="text-primary font-bold text-sm">د.ج</span>
          </div>
        </div>

        {/* Scanner view */}
        {isScanning && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-2 shadow-sm shrink-0 flex items-center justify-center">
            <BarcodeScanner onScanSuccess={handleScanSuccess} continuous={true} />
          </div>
        )}

        {/* Row 3: Quick Products Horizontal Slider */}
        <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0 flex items-center">
           <button onClick={() => document.getElementById('quick-products')?.scrollBy({ left: -200, behavior: 'smooth' })} className="p-1.5 text-gray-400 hover:text-primary bg-white/80 dark:bg-gray-800/80 rounded-full shrink-0">
              <ChevronRight className="h-5 w-5" />
           </button>
           <div id="quick-products" className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1">
              {products.filter(p => !p.product_number || p.product_number.trim() === '' || p.product_number.startsWith('NOBC') || p.image_url).map(p => (
                 <button key={p.id} onClick={() => addProduct(p)} className="flex items-center gap-2 bg-gray-50 hover:bg-primary/10 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 min-w-[130px] max-w-[150px] transition-colors shrink-0">
                    {p.image_url ? (
                       <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded object-cover border bg-white shrink-0" />
                    ) : (
                       <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 border">
                          <Package className="h-4 w-4 text-gray-400" />
                       </div>
                    )}
                    <div className="flex flex-col text-right overflow-hidden">
                       <span className="text-xs font-bold truncate text-gray-800 dark:text-gray-200">{p.name}</span>
                       <span className="text-[10px] text-primary font-bold">{p.sale_price} د.ج</span>
                    </div>
                 </button>
              ))}
              {products.length === 0 && <span className="text-xs text-gray-400 p-2">لا توجد منتجات...</span>}
           </div>
           <button onClick={() => document.getElementById('quick-products')?.scrollBy({ left: 200, behavior: 'smooth' })} className="p-1.5 text-gray-400 hover:text-primary bg-white/80 dark:bg-gray-800/80 rounded-full shrink-0">
              <ChevronLeft className="h-5 w-5" />
           </button>
        </div>

        {/* Row 4: Cart Items Table */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto overflow-x-auto">
             <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 shadow-sm">
                   <tr>
                      <th className="p-1.5 text-[11px] font-bold text-gray-500 border-b w-10 text-center">صورة</th>
                      <th className="p-1.5 text-[11px] font-bold text-gray-500 border-b">المنتج</th>
                      <th className="p-1.5 text-[11px] font-bold text-gray-500 border-b w-16 text-center">السعر</th>
                      <th className="p-1.5 text-[11px] font-bold text-gray-500 border-b w-24 text-center">الكمية</th>
                      <th className="p-1.5 text-[11px] font-bold text-gray-500 border-b w-20 text-center">المجموع</th>
                      <th className="p-1.5 text-[11px] font-bold text-gray-500 border-b w-10"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                   {invoiceItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                         <td className="p-1 text-center align-middle">
                            <div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-700 mx-auto flex items-center justify-center border"><Package className="h-3 w-3 text-gray-400" /></div>
                         </td>
                         <td className="p-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                            <div className="leading-tight">{item.name}</div>
                            {(item.sale_type === 'weight' || item.sale_type === 'volume') && <span className="text-[9px] text-amber-600 bg-amber-50 px-1 rounded">ميزان</span>}
                         </td>
                         <td className="p-1.5 text-xs font-mono text-center text-gray-600 dark:text-gray-400">{item.sale_price}</td>
                         <td className="p-1.5 text-center">
                            <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded overflow-hidden border border-gray-200 dark:border-gray-600 mx-auto w-fit">
                               <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-1.5 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><Minus className="h-3 w-3" /></button>
                               <input 
                                  type="number" 
                                  step={(item.sale_type === 'weight' || item.sale_type === 'volume') ? "0.01" : "1"}
                                  value={item.quantity} 
                                  onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)} 
                                  className="w-10 text-center text-xs font-bold bg-white dark:bg-gray-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none py-0.5" 
                               />
                               <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-1.5 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><Plus className="h-3 w-3" /></button>
                            </div>
                         </td>
                         <td className="p-1.5 text-xs font-bold font-mono text-center text-primary">{(item.sale_price * item.quantity).toFixed(2)}</td>
                         <td className="p-1 text-center">
                            <button onClick={() => removeItem(item.id)} className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                         </td>
                      </tr>
                   ))}
                   {invoiceItems.length === 0 && (
                      <tr><td colSpan={6} className="p-6 text-center text-xs text-gray-400">السلة فارغة، قم بمسح منتج للبدء.</td></tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Row 5: Footer Actions */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">الورق:</span>
              <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700">
                 <button onClick={() => setPrinterSize("80mm")} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${printerSize === "80mm" ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}>80mm</button>
                 <button onClick={() => setPrinterSize("58mm")} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${printerSize === "58mm" ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}>58mm</button>
              </div>
           </div>
           <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }}
                 onClick={() => saveInvoice(false)} 
                 disabled={invoiceItems.length === 0 || saving} 
                 className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                 {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 بيع بدون تذكرة
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                 onClick={() => saveInvoice(true)} 
                 disabled={invoiceItems.length === 0 || saving} 
                 className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                 {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                 بيع وطباعة
              </motion.button>
           </div>
        </div>

        <div id="hidden-qr-reader-pos" className="hidden"></div>
        {lastSavedInvoice && (
          <ReceiptTemplate invoiceNumber={lastSavedInvoice.number} items={lastSavedInvoice.items} total={lastSavedInvoice.total} date={lastSavedInvoice.date} size={printerSize} />
        )}
      </div>
    </ProtectedLayout>
  );
}
