"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Download, Upload, Loader2, Save, X, QrCode } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BarcodeScanner from "@/components/Scanner/BarcodeScanner";

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
    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) {
      console.error(error);
      alert("حدث خطأ أثناء الإضافة. تأكد من أن رقم المنتج غير مكرر.");
    } else {
      setIsAdding(false);
      setNewProduct({ product_number: "", name: "", purchase_price: 0, sale_price: 0, quantity: 0 });
      fetchProducts();
    }
    setSaving(false);
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex gap-2">
                <input type="text" placeholder="رقم الباركود (انقر للمسح بالكاميرا)" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  value={newProduct.product_number} 
                  onChange={e => setNewProduct({...newProduct, product_number: e.target.value})}
                  onClick={() => setIsScanning(true)} 
                />
                <button onClick={() => setIsScanning(true)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20" title="فتح الكاميرا">
                  <QrCode className="h-5 w-5" />
                </button>
              </div>
              <input type="text" placeholder="اسم المنتج" className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input type="number" placeholder="سعر الشراء" className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newProduct.purchase_price || ''} onChange={e => setNewProduct({...newProduct, purchase_price: Number(e.target.value)})} />
              <input type="number" placeholder="سعر البيع" className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newProduct.sale_price || ''} onChange={e => setNewProduct({...newProduct, sale_price: Number(e.target.value)})} />
              <input type="number" placeholder="المخزون (الكمية)" className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newProduct.quantity || ''} onChange={e => setNewProduct({...newProduct, quantity: Number(e.target.value)})} />
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleAddProduct}
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ المنتج
              </button>
            </div>
            
            {isScanning && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl w-full max-w-md flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">امسح الباركود</h3>
                    <button onClick={() => setIsScanning(false)} className="text-gray-500 hover:text-red-500"><X className="h-5 w-5" /></button>
                  </div>
                  <BarcodeScanner 
                    onScanSuccess={(decodedText) => {
                      setNewProduct({...newProduct, product_number: decodedText});
                      setIsScanning(false);
                    }} 
                  />
                  <button 
                    onClick={() => setIsScanning(false)}
                    className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
                  >
                    <X className="h-5 w-5" />
                    إيقاف المسح والإغلاق
                  </button>
                </div>
              </div>
            )}
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
