"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Plus, Search, Trash2, Loader2, Save, X, QrCode, Camera, ImagePlus, CheckCircle, Pencil, Package, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BarcodeScanner from "@/components/Scanner/BarcodeScanner";
import { Html5Qrcode } from "html5-qrcode";

type Product = {
  id: string;
  product_number: string;
  name: string;
  purchase_price: number;
  sale_price: number;
  quantity: number;
};

type PendingProduct = {
  product_number: string;
  name: string;
  purchase_price: number;
  sale_price: number;
  quantity: number;
};

import { motion } from "framer-motion";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<'name' | 'sale_price' | 'quantity' | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    if (pendingProducts.some(p => p.product_number === decodedText)) return;
    setPendingProducts(prev => [...prev, {
      product_number: decodedText,
      name: '',
      purchase_price: 0,
      sale_price: 0,
      quantity: 0
    }]);
    setIsScanning(false);
  };

  const updatePending = (index: number, field: keyof PendingProduct, value: string | number) => {
    setPendingProducts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const removePending = (index: number) => {
    setPendingProducts(prev => prev.filter((_, i) => i !== index));
  };

  const saveSingle = async (index: number) => {
    const p = pendingProducts[index];
    if (!p.product_number || !p.name) {
      alert("أدخل رقم واسم المنتج");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from('products').insert([p]).select().single();
    if (error) {
      alert("خطأ: تأكد أن الرقم غير مكرر.");
    } else {
      setProducts(prev => [data, ...prev]);
      removePending(index);
    }
    setSaving(false);
  };

  const saveAll = async () => {
    const valid = pendingProducts.filter(p => p.product_number && p.name);
    if (valid.length === 0) {
      alert("تأكد من إدخال اسم كل منتج");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from('products').insert(valid).select();
    if (error) {
      alert("خطأ أثناء الحفظ");
    } else if (data) {
      setProducts(prev => [...data, ...prev]);
      setPendingProducts([]);
    }
    setSaving(false);
  };

  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const html5QrCode = new Html5Qrcode("hidden-qr-reader");
        const decodedText = await html5QrCode.scanFile(file, true);
        handleScanSuccess(decodedText);
      } catch {
        alert("لم يتم العثور على باركود في الصورة.");
      }
      setShowScanMenu(false);
    }
  };

  const handleUpdateField = async (id: string, field: 'name' | 'sale_price' | 'quantity') => {
    const val = field === 'name' ? editValue : Number(editValue);
    const { error } = await supabase.from('products').update({ [field]: val }).eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    }
    setEditingId(null);
    setEditField(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("حذف هذا المنتج؟")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
    }
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

  const startEditField = (productId: string, field: 'name' | 'sale_price' | 'quantity', currentValue: string | number) => {
    setEditingId(productId);
    setEditField(field);
    setEditValue(String(currentValue));
  };

  return (
    <ProtectedLayout>
      <div className="space-y-4 pb-12">

        {/* العنوان وزر الإضافة */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">المنتجات</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleAdding}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-bold text-base ${
              isAdding
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {isAdding ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            <span>{isAdding ? "إلغاء" : "إضافة"}</span>
          </motion.button>
        </div>

        {/* تنبيه المخزون المنخفض */}
        {lowStockProducts.length > 0 && (
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-right">
                <p className="font-bold text-red-700 dark:text-red-400 text-base">{lowStockProducts.length} منتج مخزون منخفض</p>
                <p className="text-xs text-red-500">اضغط للعرض</p>
              </div>
            </div>
          </button>
        )}

        {showLowStock && lowStockProducts.length > 0 && (
          <div className="space-y-2">
            {lowStockProducts.map(p => (
              <div key={p.id} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.product_number}</p>
                </div>
                <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold">{p.quantity}</span>
              </div>
            ))}
          </div>
        )}

        {/* قسم الإضافة */}
        {isAdding && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 relative flex-wrap">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => isScanning ? setIsScanning(false) : setShowScanMenu(!showScanMenu)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-base transition-colors ${
                  isScanning
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {isScanning ? <X className="h-5 w-5" /> : <QrCode className="h-5 w-5" />}
                {isScanning ? "إيقاف" : "مسح"}
              </motion.button>

              {pendingProducts.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={saveAll}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-base bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  حفظ الكل ({pendingProducts.length})
                </motion.button>
              )}

              {showScanMenu && !isScanning && (
                <div className="absolute top-full mt-2 left-0 w-64 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 flex flex-col gap-1">
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full text-blue-600 dark:text-blue-400">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-base text-gray-700 dark:text-gray-200">رفع صورة</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageScan} />
                  </label>
                  <button
                    onClick={() => { setIsScanning(true); setShowScanMenu(false); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-right w-full"
                  >
                    <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full text-green-600 dark:text-green-400">
                      <Camera className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-base text-gray-700 dark:text-gray-200">كاميرا المسح</span>
                  </button>
                </div>
              )}
            </div>

            {isScanning && (
              <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-2 shadow-sm">
                <BarcodeScanner
                  onScanSuccess={handleScanSuccess}
                  continuous={true}
                />
              </div>
            )}

            {pendingProducts.length > 0 && (
              <div className="space-y-2">
                <p className="text-base font-bold text-gray-500 dark:text-gray-400">
                  منتجات جديدة ({pendingProducts.length})
                </p>
                {pendingProducts.map((p, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" /> {p.product_number}
                      </span>
                      <button onClick={() => removePending(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="اسم المنتج *"
                        className="col-span-2 px-3 py-3 border rounded-lg text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                        value={p.name}
                        onChange={e => updatePending(index, 'name', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="سعر الشراء"
                        className="px-3 py-3 border rounded-lg text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                        value={p.purchase_price || ''}
                        onChange={e => updatePending(index, 'purchase_price', Number(e.target.value))}
                      />
                      <input
                        type="number"
                        placeholder="سعر البيع"
                        className="px-3 py-3 border rounded-lg text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                        value={p.sale_price || ''}
                        onChange={e => updatePending(index, 'sale_price', Number(e.target.value))}
                      />
                      <input
                        type="number"
                        placeholder="الكمية"
                        className="col-span-2 px-3 py-3 border rounded-lg text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                        value={p.quantity || ''}
                        onChange={e => updatePending(index, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex justify-end">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveSingle(index)}
                        disabled={saving}
                        className="flex items-center gap-1 px-4 py-2.5 text-base bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-bold"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        حفظ
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* بحث */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="بحث عن منتج..."
              className="w-full pl-3 pr-10 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* المنتجات على شكل بطاقات */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-lg">لا توجد منتجات</div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                {/* اسم المنتج + الرقم */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingId === product.id && editField === 'name' ? (
                      <div className="flex items-center gap-1">
                        <input autoFocus type="text" className="flex-1 px-3 py-2 border rounded-lg text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none" value={editValue} onChange={e => setEditValue(e.target.value)} />
                        <button onClick={() => handleUpdateField(product.id, 'name')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save className="h-4 w-4" /></button>
                        <button onClick={() => { setEditingId(null); setEditField(null); }} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg text-gray-900 dark:text-white truncate">{product.name}</p>
                        <button onClick={() => startEditField(product.id, 'name', product.name)} className="p-1 text-gray-300 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                      </div>
                    )}
                    <p className="text-sm text-gray-400 font-mono">{product.product_number}</p>
                  </div>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* الأسعار والكمية */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">الشراء</p>
                    <p className="font-bold text-base text-gray-700 dark:text-gray-300">{product.purchase_price} د.ج</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">البيع</p>
                    {editingId === product.id && editField === 'sale_price' ? (
                      <div className="flex items-center gap-1">
                        <input autoFocus type="number" className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none text-center" value={editValue} onChange={e => setEditValue(e.target.value)} />
                        <button onClick={() => handleUpdateField(product.id, 'sale_price')} className="p-1 text-green-600"><Save className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <p className="font-bold text-base text-gray-900 dark:text-white">{product.sale_price} د.ج</p>
                        <button onClick={() => startEditField(product.id, 'sale_price', product.sale_price)} className="p-0.5 text-gray-300 hover:text-primary"><Pencil className="h-3 w-3" /></button>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">الكمية</p>
                    {editingId === product.id && editField === 'quantity' ? (
                      <div className="flex items-center gap-1">
                        <input autoFocus type="number" className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none text-center" value={editValue} onChange={e => setEditValue(e.target.value)} />
                        <button onClick={() => handleUpdateField(product.id, 'quantity')} className="p-1 text-green-600"><Save className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-sm font-bold ${product.quantity > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {product.quantity}
                        </span>
                        <button onClick={() => startEditField(product.id, 'quantity', product.quantity)} className="p-0.5 text-gray-300 hover:text-primary"><Pencil className="h-3 w-3" /></button>
                      </div>
                    )}
                  </div>
                </div>

                {/* الربح */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-400">الربح:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-base">{product.sale_price - product.purchase_price} د.ج</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 pb-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">®HERMA_LAISSAOUI_ISLAM_Developer</p>
        </div>

        <div id="hidden-qr-reader" className="hidden"></div>
      </div>
    </ProtectedLayout>
  );
}
