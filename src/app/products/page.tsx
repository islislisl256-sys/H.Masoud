"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Plus, Search, Trash2, Loader2, Save, X, QrCode, Camera, ScanFace, ImagePlus, CheckCircle, Pencil, Package } from "lucide-react";
import PhoneCameraPicker from '@/components/PhoneCameraPicker';
import { supabase } from "@/lib/supabase";
import BarcodeScanner from "@/components/Scanner/BarcodeScanner";
import { Html5Qrcode } from "html5-qrcode";
import { useNotification } from "@/contexts/NotificationContext";

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
  imageDataUrl?: string;
};

import { motion } from "framer-motion";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [scanMode, setScanMode] = useState<"environment" | "user" | null>(null);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);
  const [imagePickerIndex, setImagePickerIndex] = useState<number | null>(null);
  const [editField, setEditField] = useState<'name' | 'sale_price' | 'quantity' | null>(null);
  // State to control PhoneCameraPicker visibility for product image upload
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { showNotification } = useNotification();
  const [editValue, setEditValue] = useState<string>('');

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
    // Prevent duplicate barcodes
    if (products.some(p => p.product_number === decodedText)) {
      showNotification("رقم الباركود موجود مسبقاً!", "error");
      return;
    }
    if (pendingProducts.some(p => p.product_number === decodedText)) return;
    setPendingProducts(prev => [...prev, {
      product_number: decodedText,
      name: '',
      purchase_price: 0,
      sale_price: 0,
      quantity: 0,
      imageDataUrl: ''
    }]);
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
      showNotification("الرجاء إدخال رقم واسم المنتج", "error");
      return;
    }
    if (products.some(prod => prod.name === p.name)) {
      showNotification("اسم المنتج موجود مسبقاً!", "error");
      return;
    }
    if (products.some(prod => prod.product_number === p.product_number)) {
      showNotification("رقم الباركود موجود مسبقاً!", "error");
      return;
    }
    setSaving(true);
    const payload = { ...p };
    delete payload.imageDataUrl;
    const { data, error } = await supabase.from('products').insert([payload]).select().single();
    if (error) {
      showNotification("خطأ أثناء الإضافة. تأكد من أن البيانات صحيحة.", "error");
    } else {
      setProducts(prev => [data, ...prev]);
      removePending(index);
      showNotification("تمت إضافة المنتج بنجاح!", "success");
    }
    setSaving(false);
  };

  const saveAll = async () => {
    const valid = pendingProducts.filter(p => p.product_number && p.name).map(p => {
      const { imageDataUrl, ...rest } = p;
      return rest;
    });
    
    const uniqueValid = [];
    for (const p of valid) {
       if (products.some(prod => prod.name === p.name || prod.product_number === p.product_number)) {
           showNotification(`المنتج ${p.name} أو باركوده موجود مسبقاً، تم تجاهله`, "error");
       } else {
           uniqueValid.push(p);
       }
    }
    
    if (uniqueValid.length === 0) {
      showNotification("لا توجد منتجات صالحة للحفظ", "error");
      return;
    }
    
    setSaving(true);
    const { data, error } = await supabase.from('products').insert(uniqueValid).select();
    if (error) {
      showNotification("خطأ أثناء الحفظ الجماعي", "error");
    } else if (data) {
      setProducts(prev => [...data, ...prev]);
      setPendingProducts([]);
      showNotification(`تم حفظ ${data.length} منتجات بنجاح!`, "success");
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
        showNotification("لم يتم العثور على باركود في الصورة، تأكد من وضوح الصورة.", "error");
      }
      setShowScanMenu(false);
    }
  };

  const handleUpdateQuantity = async (id: string) => {
    if (editQty <= 0) {
       const product = products.find(p => p.id === id);
       const { error } = await supabase.from('products').delete().eq('id', id);
       if (!error) {
         setProducts(prev => prev.filter(p => p.id !== id));
         showNotification(`تم مسح المنتج "${product?.name}" لانتهاء الكمية`, "info");
       }
    } else {
       const { error } = await supabase.from('products').update({ quantity: editQty }).eq('id', id);
       if (!error) {
         setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: editQty } : p));
         showNotification("تم تحديث الكمية بنجاح", "success");
       }
    }
    setEditingId(null);
    setEditField(null);
  };

  const handleUpdateField = async (id: string, field: 'name' | 'sale_price') => {
    const val = field === 'sale_price' ? Number(editValue) : editValue;
    const { error } = await supabase.from('products').update({ [field]: val }).eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    }
    setEditingId(null);
    setEditField(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        showNotification("خطأ أثناء الحذف", "error");
      } else {
        fetchProducts();
        showNotification("تم حذف المنتج", "success");
      }
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

  const filteredProducts = products.filter(p =>
    p.name.includes(searchTerm) || p.product_number.includes(searchTerm)
  );

  return (
    <ProtectedLayout>
      <div className="space-y-4">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">إدارة المنتجات</h1>
            <p className="text-muted-foreground mt-1">عرض وإدارة جميع المنتجات في المكتبة</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleAdding}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
              isAdding
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{isAdding ? "إلغاء الإضافة" : "إضافة منتج"}</span>
          </motion.button>
        </div>

        {/* Scanner + pending products – appears directly below header */}
        {isAdding && (
          <div className="space-y-3">

            {/* Scan controls row */}
            <div className="flex items-center gap-2 relative flex-wrap">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => isScanning ? setIsScanning(false) : setShowScanMenu(!showScanMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isScanning
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {isScanning ? <X className="h-5 w-5" /> : <QrCode className="h-5 w-5" />}
                {isScanning ? "إيقاف المسح" : "مسح الباركود"}
              </motion.button>

              {pendingProducts.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={saveAll}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  حفظ الكل ({pendingProducts.length})
                </motion.button>
              )}

              {/* Camera selection dropdown */}
              {showScanMenu && !isScanning && (
                <div className="absolute top-full mt-2 left-0 w-64 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 flex flex-col gap-1">
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full text-blue-600 dark:text-blue-400">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">رفع صورة من الهاتف</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageScan} />
                  </label>
                  <button
                    onClick={() => { setScanMode("environment"); setIsScanning(true); setShowScanMenu(false); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-right"
                  >
                    <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full text-green-600 dark:text-green-400">
                      <Camera className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">تصوير بالكاميرا الخلفية</span>
                  </button>
                  <button
                    onClick={() => { setScanMode("user"); setIsScanning(true); setShowScanMenu(false); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-right"
                  >
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full text-purple-600 dark:text-purple-400">
                      <ScanFace className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">تصوير بالكاميرا الأمامية</span>
                  </button>
                </div>
              )}
            </div>

            {/* Camera view – full width, white background */}
            {isScanning && (
              <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-2 shadow-sm">
                <BarcodeScanner
                  defaultMode={scanMode || "environment"}
                  continuous={true}
                  onScanSuccess={handleScanSuccess}
                />
              </div>
            )}

            {/* Pending product cards */}
            {pendingProducts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  المنتجات المنتظرة للحفظ ({pendingProducts.length})
                </p>
                {pendingProducts.map((p, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" /> {p.product_number}
                      </span>
                      <button onClick={() => removePending(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="اسم المنتج *"
                        className="col-span-2 md:col-span-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        value={p.name}
                        onChange={e => updatePending(index, 'name', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="سعر الشراء"
                        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        value={p.purchase_price || ''}
                        onChange={e => updatePending(index, 'purchase_price', Number(e.target.value))}
                      />
                      <input
                        type="number"
                        placeholder="سعر البيع"
                        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        value={p.sale_price || ''}
                        onChange={e => updatePending(index, 'sale_price', Number(e.target.value))}
                      />
                      <input
                        type="number"
                        placeholder="الكمية"
                        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        value={p.quantity || ''}
                        onChange={e => updatePending(index, 'quantity', Number(e.target.value))}
                      />
                      {/* Image picker button */}
                      <div className="flex items-center mt-2">
                        {p.imageDataUrl && <img src={p.imageDataUrl} alt="منتج" className="w-12 h-12 object-cover rounded mr-2" />}
                        <button
                          type="button"
                          onClick={() => setImagePickerIndex(index)}
                          className="flex items-center gap-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                        >
                          <ImagePlus className="h-4 w-4" />
                          إضافة صورة
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveSingle(index)}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        حفظ هذا المنتج
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
)}
              {/* PhoneCameraPicker modal */}
              {imagePickerIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md w-full">
                    <PhoneCameraPicker
                      onCapture={(dataUrl, source) => {
                        setPendingProducts(prev =>
                          prev.map((p, i) =>
                            i === imagePickerIndex ? { ...p, imageDataUrl: dataUrl } : p
                          )
                        );
                        setImagePickerIndex(null);
                      }}
                    />
                    <button
                      onClick={() => setImagePickerIndex(null)}
                      className="mt-2 w-full px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
                    >إلغاء</button>
                  </div>
                </div>
              )}

          </div>
        )}

        {/* Products List (Cards) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث عن منتج (بالاسم أو الرقم)..."
                className="w-full pl-3 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-medium">لا توجد منتجات</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {editingId === product.id && editField === 'name' ? (
                          <div className="flex items-center gap-2 mb-2">
                            <input autoFocus type="text" className="w-full px-3 py-2 border rounded-lg text-base dark:bg-gray-800 dark:border-gray-500 dark:text-white focus:ring-2 focus:ring-primary outline-none" value={editValue} onChange={e => setEditValue(e.target.value)} />
                            <button onClick={() => handleUpdateField(product.id, 'name')} className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg"><Save className="h-5 w-5" /></button>
                            <button onClick={() => { setEditingId(null); setEditField(null); }} className="p-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg"><X className="h-5 w-5" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                              {product.name}
                              <button onClick={() => { setEditingId(product.id); setEditField('name'); setEditValue(product.name); }} className="p-1.5 text-gray-400 hover:text-primary transition-colors rounded bg-white dark:bg-gray-800 border shadow-sm"><Pencil className="h-4 w-4" /></button>
                            </h3>
                            <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors bg-white dark:bg-gray-800 border shadow-sm">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                          <Package className="h-4 w-4" /> {product.product_number}
                        </span>
                      </div>
                    </div>
                    
                    {/* Body */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">سعر الشراء</span>
                        <span className="font-medium text-lg">{product.purchase_price} د.ج</span>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">سعر البيع</span>
                        {editingId === product.id && editField === 'sale_price' ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input autoFocus type="number" className="w-full px-2 py-1.5 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white" value={editValue} onChange={e => setEditValue(e.target.value)} />
                            <button onClick={() => handleUpdateField(product.id, 'sale_price')} className="p-1.5 bg-green-100 text-green-700 rounded-md"><Save className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary text-lg">{product.sale_price} د.ج</span>
                            <button onClick={() => { setEditingId(product.id); setEditField('sale_price'); setEditValue(String(product.sale_price)); }} className="p-1 text-gray-400 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">الربح</span>
                        <span className="font-bold text-green-600 dark:text-green-400 text-lg">{product.sale_price - product.purchase_price} د.ج</span>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">الكمية</span>
                        {editingId === product.id && editField !== 'name' && editField !== 'sale_price' ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input type="number" className="w-full px-2 py-1.5 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-white" value={editQty} onChange={e => setEditQty(Number(e.target.value))} autoFocus />
                            <button onClick={() => handleUpdateQuantity(product.id)} className="p-1.5 bg-green-100 text-green-700 rounded-md"><Save className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className={`font-bold text-lg ${product.quantity > 10 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                              {product.quantity}
                            </span>
                            <button onClick={() => { setEditingId(product.id); setEditQty(product.quantity); setEditField(null); }} className="p-1 text-gray-400 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div id="hidden-qr-reader" className="hidden"></div>
      </div>
    </ProtectedLayout>
  );
}
