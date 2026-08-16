"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, FileText, Loader2, Download, History, Store, User, Edit, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import InvoicePrintLayout from "./InvoicePrintLayout";

type InvoiceItem = {
  item_index: number;
  item_designation: string;
  item_quantity: number;
  item_unit_price: number;
  item_total_price: number;
};

type HistoryEntry = {
  id: string;
  date: string;
  client_name: string;
  invoice_number: string;
  grand_total_invoice: number;
  payload: any;
};

export default function CustomInvoicesTab() {
  const [storeInfo, setStoreInfo] = useState({
    store_name: "بحصية الشيخ",
    store_activity: "تجارة للاجهزة الكهرومنزلية",
    store_address: "",
    store_ccp_1: "",
    store_ccp_2: "",
    store_rc: "",
    store_mf: "",
    store_art: "",
    store_nif: "",
  });

  const [clientInfo, setClientInfo] = useState({
    client_name: "",
    receipt_date: new Date().toLocaleDateString('en-GB'),
    invoice_number: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [financials, setFinancials] = useState({ tva_amount: 0, stamp_duty: 0 });
  const [includeTva, setIncludeTva] = useState(true);
  const [amountInWords, setAmountInWords] = useState("");
  
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const savedStore = localStorage.getItem("custom_invoice_store_v2");
    if (savedStore) setStoreInfo(JSON.parse(savedStore));

    const savedHistory = localStorage.getItem("custom_invoice_history_v2");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const saveStoreInfo = () => {
    localStorage.setItem("custom_invoice_store_v2", JSON.stringify(storeInfo));
    alert("تم حفظ معلومات المتجر!");
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        item_index: items.length + 1,
        item_designation: "",
        item_quantity: 1,
        item_unit_price: 0,
        item_total_price: 0,
      }
    ]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const updatedItem = { ...newItems[index], [field]: value };
    
    if (field === 'item_quantity' || field === 'item_unit_price') {
      updatedItem.item_total_price = (updatedItem.item_quantity || 0) * (updatedItem.item_unit_price || 0);
    }
    
    newItems[index] = updatedItem;
    newItems.forEach((it, i) => it.item_index = i + 1);
    
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    newItems.forEach((it, i) => it.item_index = i + 1);
    setItems(newItems);
  };

  const total_amount_receipt = items.reduce((sum, item) => sum + item.item_total_price, 0);
  const total_amount_invoice = total_amount_receipt;
  const computed_tva = Math.round(total_amount_invoice * 0.19 * 100) / 100;
  const grand_total_invoice = total_amount_invoice + (includeTva ? computed_tva : 0) + Number(financials.stamp_duty);

  const buildPayload = () => {
    return {
      ...storeInfo,
      ...clientInfo,
      items: items,
      total_amount_receipt,
      total_amount_invoice,
      tva_amount: includeTva ? computed_tva : 0,
      stamp_duty: Number(financials.stamp_duty),
      grand_total_invoice,
      amount_in_words_arabic: amountInWords,
    };
  };

  const handleGenerate = async (payloadOverride?: any) => {
    const payload = payloadOverride || buildPayload();
    if (!payload.client_name) { alert("الرجاء إدخال اسم العميل"); return; }
    
    setGenerating(true);
    
    try {
      const element = document.getElementById('invoice-print-container');
      if (element) {
        // Handle dynamic import more robustly
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default || html2pdfModule;
        
        const opt: any = {
          margin:       0,
          filename:     `Invoice_${payload.client_name}_${payload.invoice_number || Date.now()}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(opt).from(element).save();
      } else {
        throw new Error("لم يتم العثور على قالب الطباعة");
      }

      if (!payloadOverride) {
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toLocaleString('ar-DZ'),
          client_name: payload.client_name,
          invoice_number: payload.invoice_number,
          grand_total_invoice: payload.grand_total_invoice,
          payload
        };
        const newHistory = [newEntry, ...history];
        setHistory(newHistory);
        localStorage.setItem("custom_invoice_history_v2", JSON.stringify(newHistory));

        setClientInfo({
          client_name: "",
          receipt_date: new Date().toLocaleDateString('en-GB'), invoice_number: "",
        });
        setItems([]);
        setFinancials({ tva_amount: 0, stamp_duty: 0 });
        setAmountInWords("");
      }
    } catch (error: any) {
      console.error(error);
      alert(`حدث خطأ أثناء التوليد: ${error?.message || "خطأ غير معروف"}`);
    } finally {
      setGenerating(false);
    }
  };

  const loadHistoryItem = (entry: HistoryEntry) => {
    const p = entry.payload;
    if (confirm("هل تريد تحميل هذه الفاتورة للتعديل عليها؟ سيتم استبدال البيانات الحالية.")) {
      setClientInfo({
        client_name: p.client_name || "",
        receipt_date: p.receipt_date || "", invoice_number: p.invoice_number || "",
      });
      setItems(p.items || []);
      setFinancials({ tva_amount: p.tva_amount || 0, stamp_duty: p.stamp_duty || 0 });
      setAmountInWords(p.amount_in_words_arabic || "");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const deleteHistoryItem = (id: string) => {
    if (confirm("تأكيد الحذف؟")) {
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem("custom_invoice_history_v2", JSON.stringify(newHistory));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          توليد فواتير مخصصة (PDF)
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Store className="h-5 w-5 text-gray-400" /> معلومات المتجر
          </h2>
          <div className="space-y-3">
            <div><label className="text-xs text-gray-500 font-bold">اسمك_الكامل</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_name} onChange={e => setStoreInfo({...storeInfo, store_name: e.target.value})} /></div>
            <div><label className="text-xs text-gray-500 font-bold">النشاط</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_activity} onChange={e => setStoreInfo({...storeInfo, store_activity: e.target.value})} /></div>
            <div><label className="text-xs text-gray-500 font-bold">عنوان_المقر</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_address} onChange={e => setStoreInfo({...storeInfo, store_address: e.target.value})} /></div>
            <div><label className="text-xs text-gray-500 font-bold">cle</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_ccp_1} onChange={e => setStoreInfo({...storeInfo, store_ccp_1: e.target.value})} /></div>
            <div><label className="text-xs text-gray-500 font-bold">ccp</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_ccp_2} onChange={e => setStoreInfo({...storeInfo, store_ccp_2: e.target.value})} /></div>
            <div><label className="text-xs text-gray-500 font-bold">س.ت.رقم</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_rc} onChange={e => setStoreInfo({...storeInfo, store_rc: e.target.value})} /></div>
            <div><label className="text-xs text-gray-500 font-bold">رقم_الجبائي</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_mf} onChange={e => setStoreInfo({...storeInfo, store_mf: e.target.value})} /></div>
            <div><label className="text-xs text-gray-500 font-bold">رقم_المادة</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_art} onChange={e => setStoreInfo({...storeInfo, store_art: e.target.value})} /></div>
            <div><label className="text-xs text-gray-500 font-bold">nff</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={storeInfo.store_nif} onChange={e => setStoreInfo({...storeInfo, store_nif: e.target.value})} /></div>
            <button onClick={saveStoreInfo} className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors text-sm font-medium mt-4"><Save className="h-4 w-4" /> حفظ</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3"><User className="h-5 w-5 text-primary" /> الزبون والوثيقة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 font-bold">اسم_الزبون</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-primary" value={clientInfo.client_name} onChange={e => setClientInfo({...clientInfo, client_name: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500 font-bold">رقم_الفاتورة_و_الوصل</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-primary" value={clientInfo.invoice_number} onChange={e => setClientInfo({...clientInfo, invoice_number: e.target.value})} /></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <div className="flex justify-between items-center mb-3 border-b border-gray-100 dark:border-gray-700 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> المشتريات</h2>
              <button onClick={addItem} className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20"><Plus className="h-4 w-4" /> إضافة</button>
            </div>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-4 border border-dashed rounded-lg">أضف منتجاً للبدء</p>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <div className="w-8 text-center text-xs text-gray-400 font-bold">{item.item_index}</div>
                    <div className="flex-1 min-w-[150px]"><label className="text-[10px] text-gray-500">item_designation</label><input type="text" className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" value={item.item_designation} onChange={e => updateItem(index, 'item_designation', e.target.value)} /></div>
                    <div className="w-16"><label className="text-[10px] text-gray-500">item_quantity</label><input type="number" className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 text-center outline-none" value={item.item_quantity} onChange={e => updateItem(index, 'item_quantity', Number(e.target.value))} /></div>
                    <div className="w-24"><label className="text-[10px] text-gray-500">item_unit_price</label><input type="number" className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 text-center outline-none" value={item.item_unit_price} onChange={e => updateItem(index, 'item_unit_price', Number(e.target.value))} /></div>
                    <div className="w-24"><label className="text-[10px] text-gray-500">item_total_price</label><div className="w-full px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-sm text-center font-bold">{item.item_total_price}</div></div>
                    <button onClick={() => removeItem(index)} className="p-2 mt-4 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 pb-3"><Calculator className="h-5 w-5 text-green-500" /> المجاميع</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center text-sm"><span>المجموع:</span><span className="font-bold bg-gray-100 px-3 py-1 rounded">{total_amount_invoice}</span></div>
                <div className="flex justify-between items-center text-sm">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeTva}
                      onChange={e => setIncludeTva(e.target.checked)}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                    <span>\u0631\u0633\u0645_\u0639_\u0627\u0644\u0642\u064a\u0645\u0629_\u0627\u0644\u0645\u0636\u0627\u0641\u0629 (19%):</span>
                  </label>
                  <span className={`font-bold px-3 py-1 rounded ${includeTva ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'bg-gray-100 text-gray-400 line-through'}`}>{computed_tva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm"><span>الرسم_ع_الطابع:</span><input type="number" className="w-28 px-3 py-1.5 border rounded text-right" value={financials.stamp_duty} onChange={e => setFinancials({...financials, stamp_duty: Number(e.target.value)})} /></div>
                <div className="flex justify-between items-center font-bold pt-2 border-t border-dashed"><span>المجموع_الكلي:</span><span className="text-primary font-mono text-xl bg-primary/10 px-3 py-1 rounded-lg">{grand_total_invoice.toFixed(2)}</span></div>
              </div>
              <div className="flex-1">
                <label className="text-sm font-bold block mb-2">المبلغ_بالحروف_للمجموع_الكلي</label>
                <textarea rows={4} className="w-full px-3 py-2 border rounded-lg text-sm resize-none dark:bg-gray-700" placeholder="أقفلت هذه الفاتورة عند مبلغ..." value={amountInWords} onChange={e => setAmountInWords(e.target.value)} />
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleGenerate()} disabled={generating} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-colors">
              {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} توليد PDF نهائي
            </motion.button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mt-6">
        <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-3 mb-4"><History className="h-5 w-5 text-gray-400" /> سجل الفواتير المخصصة</h2>
        {history.length === 0 ? (
          <p className="text-center py-6 text-gray-400">لا يوجد سجل</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr><th className="px-4 py-3">التاريخ</th><th className="px-4 py-3">العميل</th><th className="px-4 py-3">الفاتورة</th><th className="px-4 py-3">الإجمالي</th><th className="px-4 py-3 text-center">إجراءات</th></tr>
              </thead>
              <tbody>
                {history.map(entry => (
                  <tr key={entry.id} className="border-b">
                    <td className="px-4 py-3">{entry.date}</td><td className="px-4 py-3">{entry.client_name}</td><td className="px-4 py-3">{entry.invoice_number}</td><td className="px-4 py-3 font-bold text-primary">{entry.grand_total_invoice}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => loadHistoryItem(entry)} className="p-1.5 text-blue-600 bg-blue-50 rounded" title="تعديل"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleGenerate(entry.payload)} className="p-1.5 text-green-600 bg-green-50 rounded" title="إعادة طباعة (PDF)"><Download className="h-4 w-4" /></button>
                        <button onClick={() => deleteHistoryItem(entry.id)} className="p-1.5 text-red-500 bg-red-50 rounded" title="حذف"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hidden PDF Layout */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div id="invoice-print-container">
          <InvoicePrintLayout payload={buildPayload()} />
        </div>
      </div>
    </div>
  );
}
