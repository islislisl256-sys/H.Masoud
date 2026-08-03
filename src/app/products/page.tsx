"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Download, Upload, Loader2, Save, X, QrCode, Camera, ScanFace, ImagePlus } from "lucide-react";
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

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [scanMode, setScanMode] = useState<"environment" | "user" | null>(null);
  
  // New Product State
  const [newProduct, setNewProduct] = useState({
    product_number: "", name: "", purchase_price: 0, sale_price: 0, quantity: 0
  });
  const [saving, setSaving] = useState(false);

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

  const handleAddProduct = async () => {
    if (!newProduct.product_number || !newProduct.name) {
      alert("الرجاء إدخال رقم واسم المنتج");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
    if (error) {
      console.error(error);
      alert("حدث خطأ أثناء الإضافة. تأكد من أن رقم المنتج غير مكرر.");
    } else {
      // Update local state without refresh, keep form & scanner open for next product
      setProducts([data, ...products]);
      setNewProduct({ name: '', purchase_price: 0, sale_price: 0, quantity: 0, product_number: '' });
      // Keep isAdding=true and isScanning=true so user can scan next product
    }
    setSaving(false);
  };

  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const html5QrCode = new Html5Qrcode("hidden-qr-reader");
        const decodedText = await html5QrCode.scanFile(file, true);
        setNewProduct({...newProduct, product_number: decodedText});
      } catch (err) {
        alert("لم يتم العثور على باركود في الصورة، تأكد من وضوح الصورة.");
      }
      setShowScanMenu(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
         alert("خطأ أثناء الحذف");
      } else {
         fetchProducts();
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.includes(searchTerm) || p.product_number.includes(searchTerm)
  );

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">إدارة المنتجات</h1>
            <p className="text-muted-foreground mt-1">عرض وإدارة جميع المنتجات في المكتبة</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{isAdding ? "إلغاء" : "إضافة منتج"}</span>
            </button>
          </div>
        </div>

        {isAdding && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="font-bold mb-4">إضافة منتج جديد</h3>

            {/* Row 1: barcode field + scan button */}
            <div className="flex gap-2 mb-3 relative">
              <input type="text" placeholder="رقم الباركود" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newProduct.product_number} 
                onChange={e => setNewProduct({...newProduct, product_number: e.target.value})}
              />
              <button 
                onClick={() => isScanning ? setIsScanning(false) : setShowScanMenu(!showScanMenu)} 
                className={`p-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  isScanning 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
                title={isScanning ? 'إيقاف المسح' : 'تشغيل المسح'}
              >
                {isScanning ? <X className="h-5 w-5" /> : <QrCode className="h-5 w-5" />}
              </button>

              {showScanMenu && !isScanning && (
                <div className="absolute top-full mt-2 right-0 w-64 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 flex flex-col gap-1">
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

            {/* Inline scanner – full width, white bg, continuous */}
            {isScanning && (
              <div className="mb-3 w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-2">
                <BarcodeScanner 
                  defaultMode={scanMode || "environment"}
                  continuous={true}
                  onScanSuccess={(decodedText) => {
                    setNewProduct(prev => ({...prev, product_number: decodedText}));
                  }} 
                />
              </div>
            )}

            {/* Row 2: rest of fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <input type="text" placeholder="اسم المنتج" className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input type="number" placeholder="سعر الشراء" className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newProduct.purchase_price || ''} onChange={e => setNewProduct({...newProduct, purchase_price: Number(e.target.value)})} />
              <input type="number" placeholder="سعر البيع" className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newProduct.sale_price || ''} onChange={e => setNewProduct({...newProduct, sale_price: Number(e.target.value)})} />
              <input type="number" placeholder="المخزون (الكمية)" className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newProduct.quantity || ''} onChange={e => setNewProduct({...newProduct, quantity: Number(e.target.value)})} />
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleAddProduct}
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ المنتج
              </button>
            </div>
            
            <div id="hidden-qr-reader" className="hidden"></div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث عن منتج (بالاسم أو الرقم)..."
                className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">الرقم</th>
                  <th scope="col" className="px-6 py-4 font-bold">اسم المنتج</th>
                  <th scope="col" className="px-6 py-4 font-bold">سعر الشراء</th>
                  <th scope="col" className="px-6 py-4 font-bold">سعر البيع</th>
                  <th scope="col" className="px-6 py-4 font-bold">الربح</th>
                  <th scope="col" className="px-6 py-4 font-bold">الكمية</th>
                  <th scope="col" className="px-6 py-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">لا توجد منتجات</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.product_number}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                      <td className="px-6 py-4">{product.purchase_price} د.ج</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{product.sale_price} د.ج</td>
                      <td className="px-6 py-4 text-green-600 dark:text-green-400">{product.sale_price - product.purchase_price} د.ج</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.quantity > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
