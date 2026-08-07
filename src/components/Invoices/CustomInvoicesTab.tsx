"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, FileText, Loader2, Download, History, Store, User } from "lucide-react";
import { motion } from "framer-motion";

type InvoiceItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

type HistoryEntry = {
  id: string;
  date: string;
  clientName: string;
  total: number;
};

export default function CustomInvoicesTab() {
  // Static state
  const [storeInfo, setStoreInfo] = useState({
    store_name: "مكتبة مسعود",
    store_address: "العنوان هنا",
    store_phone: "0000000000",
  });

  // Dynamic state
  const [clientInfo, setClientInfo] = useState({
    client_name: "",
    client_address: "",
    client_phone: "",
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [generating, setGenerating] = useState(false);

  // Load static info & history on mount
  useEffect(() => {
    const savedStore = localStorage.getItem("custom_invoice_store");
    if (savedStore) setStoreInfo(JSON.parse(savedStore));

    const savedHistory = localStorage.getItem("custom_invoice_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const saveStoreInfo = () => {
    localStorage.setItem("custom_invoice_store", JSON.stringify(storeInfo));
    alert("تم حفظ معلومات المتجر!");
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubTotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const calculateTotal = () => calculateSubTotal() - discount;

  const handleGenerate = async () => {
    if (!clientInfo.client_name) {
      alert("الرجاء إدخال اسم العميل");
      return;
    }
    
    setGenerating(true);
    
    const payload = {
      ...storeInfo,
      ...clientInfo,
      date: new Date().toLocaleDateString('ar-DZ'),
      items: items.map((item, index) => ({
        index: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      })),
      subtotal: calculateSubTotal(),
      discount: discount,
      total: calculateTotal()
    };

    try {
      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('فشل توليد الفاتورة');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${clientInfo.client_name}_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Add to history
      const newHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleString('ar-DZ'),
        clientName: clientInfo.client_name,
        total: calculateTotal()
      };
      
      const newHistory = [newHistoryEntry, ...history];
      setHistory(newHistory);
      localStorage.setItem("custom_invoice_history", JSON.stringify(newHistory));

      // Reset dynamic form
      setClientInfo({ client_name: "", client_address: "", client_phone: "" });
      setItems([]);
      setDiscount(0);
      
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التوليد");
    } finally {
      setGenerating(false);
    }
  };

  return (
      <div className="space-y-6 pb-12">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          توليد فواتير مخصصة (DOCX)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Static Info Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
              <Store className="h-5 w-5 text-gray-400" />
              معلومات المتجر (ثابتة)
            </h2>
            <div className="space-y-3">
              <input type="text" placeholder="اسم المتجر" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_name} onChange={e => setStoreInfo({...storeInfo, store_name: e.target.value})} />
              <input type="text" placeholder="العنوان" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_address} onChange={e => setStoreInfo({...storeInfo, store_address: e.target.value})} />
              <input type="text" placeholder="الهاتف" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_phone} onChange={e => setStoreInfo({...storeInfo, store_phone: e.target.value})} />
              <button onClick={saveStoreInfo} className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors text-sm font-medium">
                <Save className="h-4 w-4" /> حفظ للمرات القادمة
              </button>
            </div>
          </div>

          {/* Dynamic Info Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
              <User className="h-5 w-5 text-primary" />
              بيانات العميل والفاتورة
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="text" placeholder="اسم العميل *" className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-primary" value={clientInfo.client_name} onChange={e => setClientInfo({...clientInfo, client_name: e.target.value})} />
              <input type="text" placeholder="عنوان العميل" className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-primary" value={clientInfo.client_address} onChange={e => setClientInfo({...clientInfo, client_address: e.target.value})} />
              <input type="text" placeholder="هاتف العميل" className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-primary" value={clientInfo.client_phone} onChange={e => setClientInfo({...clientInfo, client_phone: e.target.value})} />
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-700 dark:text-gray-300">المنتجات</h3>
                <button onClick={addItem} className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                  <Plus className="h-4 w-4" /> إضافة منتج
                </button>
              </div>
              
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-4 border border-dashed rounded-lg dark:border-gray-700">لا توجد منتجات، أضف منتجاً للبدء.</p>
                ) : (
                  items.map((item, index) => (
                    <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                      <input type="text" placeholder="البيان (اسم المنتج)" className="flex-1 min-w-[150px] px-3 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} />
                      <input type="number" placeholder="الكمية" className="w-20 px-3 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none text-center" value={item.quantity} onChange={e => updateItem(index, 'quantity', Number(e.target.value))} />
                      <input type="number" placeholder="السعر" className="w-28 px-3 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none text-center" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', Number(e.target.value))} />
                      <div className="w-24 text-center font-bold text-sm text-gray-700 dark:text-gray-300">
                        {item.quantity * item.unit_price} د.ج
                      </div>
                      <button onClick={() => removeItem(index)} className="p-2 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded shadow-sm">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>المجموع الفرعي:</span>
                  <span>{calculateSubTotal()} د.ج</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>تخفيض:</span>
                  <input type="number" className="w-24 px-2 py-1 border rounded text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                </div>
                <div className="flex justify-between items-center font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-dashed dark:border-gray-700">
                  <span>الإجمالي:</span>
                  <span className="text-primary">{calculateTotal()} د.ج</span>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 mt-4"
            >
              {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              توليد وحفظ الفاتورة (DOCX)
            </motion.button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mt-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
            <History className="h-5 w-5 text-gray-400" />
            سجل الفواتير المخصصة
          </h2>
          
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-6">لا يوجد سجل للفواتير المخصصة بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 font-bold">التاريخ</th>
                    <th className="px-4 py-3 font-bold">العميل</th>
                    <th className="px-4 py-3 font-bold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">{entry.date}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{entry.clientName}</td>
                      <td className="px-4 py-3 font-bold text-primary">{entry.total} د.ج</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
}
