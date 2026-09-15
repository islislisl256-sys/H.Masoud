"use client";

import React, { useState, useEffect } from "react";
import { showSystemToast, confirmDialog } from "@/components/CustomToasts";
import { Plus, Trash2, Save, FileText, Loader2, Download, History, Store, User, Edit, Calculator, Lock } from "lucide-react";
import { motion } from "framer-motion";
import InvoicePrintLayout from "./InvoicePrintLayout";
import { useAuth } from "@/contexts/AuthContext";

type InvoiceItem = {
  item_index: number;
  item_designation: string;
  item_unit: string;
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
  const { currentUser } = useAuth();
  const isPremium = currentUser?.plan_tier === 'PREMIUM';

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
    store_logo: "",
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
  const [pagesToPrint, setPagesToPrint] = useState<'receipt' | 'invoice' | 'both'>('both');
  
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
    showSystemToast("تنبيه", "يرجى التحقق من البيانات.", "warning");
  };

  
  const MAX_COL = 3; // 0=designation, 1=unit, 2=quantity, 3=unit_price

  const focusInput = (row: number, col: number) => {
    const el = document.getElementById(`input-${row}-${col}`);
    if (el) {
      (el as HTMLInputElement).focus();
      (el as HTMLInputElement).select();
      return true;
    }
    return false;
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    let nextRow = rowIndex;
    let nextCol = colIndex;

    if (e.key === 'ArrowUp') {
      nextRow = Math.max(0, rowIndex - 1);
    } else if (e.key === 'ArrowDown') {
      nextRow = Math.min(items.length - 1, rowIndex + 1);
    } else if (e.key === 'ArrowRight') {
      nextCol = Math.max(0, colIndex - 1);
    } else if (e.key === 'ArrowLeft') {
      nextCol = Math.min(MAX_COL, colIndex + 1);
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (colIndex < MAX_COL) {
        focusInput(rowIndex, colIndex + 1);
      } else if (rowIndex < items.length - 1) {
        focusInput(rowIndex + 1, 0);
      }
      return;
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      if (colIndex > 0) {
        focusInput(rowIndex, colIndex - 1);
      } else if (rowIndex > 0) {
        focusInput(rowIndex - 1, MAX_COL);
      }
      return;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex === items.length - 1) {
        // Last row: add new item then focus it
        addItem();
        setTimeout(() => focusInput(rowIndex + 1, 0), 50);
      } else {
        focusInput(rowIndex + 1, colIndex);
      }
      return;
    } else {
      return;
    }

    e.preventDefault();
    focusInput(nextRow, nextCol);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        item_index: items.length + 1,
        item_designation: "",
        item_unit: "",
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
      seller_name: currentUser?.full_name || currentUser?.store_name || "البائع",
    };
  };

  const handleGenerate = async (formatOrPayload?: 'pdf' | 'docx' | any, payloadOverride?: any) => {
    // دعم التوافق مع الاستدعاءات القديمة من السجل
    let format: 'pdf' | 'docx' = 'pdf';
    let payload: any;
    if (typeof formatOrPayload === 'string' && (formatOrPayload === 'pdf' || formatOrPayload === 'docx')) {
      format = formatOrPayload;
      payload = payloadOverride || buildPayload();
    } else if (formatOrPayload && typeof formatOrPayload === 'object') {
      payload = formatOrPayload;
    } else {
      payload = buildPayload();
    }

    if (!payload.client_name) { showSystemToast("تنبيه", "يرجى التحقق من البيانات.", "warning"); return; }
    
    const isInvalid = (val: any) => !val || (typeof val === 'string' && val.trim() === '');
    if (isInvalid(payload.store_name) || isInvalid(payload.store_activity) || isInvalid(payload.store_rc) || isInvalid(payload.store_nif) || isInvalid(payload.store_art)) {
      showSystemToast("تنبيه", "يرجى التحقق من البيانات.", "warning");
      return;
    }
    
    setGenerating(true);
    
    try {
      if (format === 'docx') {
        const { generateInvoiceDocx } = await import('@/lib/generateDocx');
        await generateInvoiceDocx(payload, pagesToPrint);
      } else {
        const element = document.getElementById('invoice-print-container');
        if (element) {
          const html2pdfModule = await import('html2pdf.js');
          const html2pdf = html2pdfModule.default || html2pdfModule;
          
          const opt: any = {
            margin:       0.4,
            pagebreak:    { mode: ['css', 'legacy'], avoid: 'tr' },
            filename:     `Invoice_${payload.client_name}_${payload.invoice_number || Date.now()}_${payload.seller_name || "seller"}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
          };
          
          await html2pdf().set(opt).from(element).save();
        } else {
          throw new Error("لم يتم العثور على قالب الطباعة");
        }
      }

      if (!payloadOverride && typeof formatOrPayload !== 'object') {
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
      showSystemToast("خطأ", "حدث خطأ غير متوقع.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const loadHistoryItem = (entry: HistoryEntry) => {
    const p = entry.payload;
    confirmDialog("استعادة الفاتورة", "هل أنت متأكد من استعادة هذه الفاتورة؟ سيتم مسح البيانات الحالية.", () => {
      setClientInfo({
        client_name: p.client_name || "",
        receipt_date: p.receipt_date || "", invoice_number: p.invoice_number || "",
      });
      setItems(p.items || []);
      setFinancials({ tva_amount: p.tva_amount || 0, stamp_duty: p.stamp_duty || 0 });
      setAmountInWords(p.amount_in_words_arabic || "");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const deleteHistoryItem = (id: string) => {
    confirmDialog("مسح السجل", "هل أنت متأكد من مسح هذا السجل؟", () => {
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem("custom_invoice_history_v2", JSON.stringify(newHistory));
    });
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
            <div>
              <label className="text-xs text-gray-500 font-bold">شعار المتجر (اختياري - يظهر كعلامة مائية)</label>
              <div className="flex items-center gap-3 mt-1">
                {storeInfo.store_logo && <img src={storeInfo.store_logo} alt="شعار" className="w-12 h-12 rounded object-contain border" />}
                <input type="file" accept="image/*" className="text-sm" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setStoreInfo({...storeInfo, store_logo: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }} />
                {storeInfo.store_logo && <button onClick={() => setStoreInfo({...storeInfo, store_logo: ""})} className="text-xs text-red-500 hover:text-red-700">إزالة</button>}
              </div>
            </div>
            <button onClick={saveStoreInfo} className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors text-sm font-medium mt-4"><Save className="h-4 w-4" /> حفظ</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3"><User className="h-5 w-5 text-primary" /> الزبون والوثيقة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="text-xs text-gray-500 font-bold">اسم_الزبون</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-primary" value={clientInfo.client_name} onChange={e => setClientInfo({...clientInfo, client_name: e.target.value})} /></div>
              <div><label className="text-xs text-gray-500 font-bold">رقم_الفاتورة_و_الوصل</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-primary" value={clientInfo.invoice_number} onChange={e => setClientInfo({...clientInfo, invoice_number: e.target.value})} /></div>
                <div><label className="text-xs text-gray-500 font-bold">التاريخ</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-primary" value={clientInfo.receipt_date} onChange={e => setClientInfo({...clientInfo, receipt_date: e.target.value})} /></div>
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
                    <div className="flex-1 min-w-[150px]"><label className="text-[10px] text-gray-500">item_designation</label><input type="text" id={`input-${index}-0`} className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" value={item.item_designation} onChange={e => updateItem(index, 'item_designation', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 0)} onFocus={(e) => e.target.select()} /></div>
                    <div className="w-16"><label className="text-[10px] text-gray-500">item_unit</label><input type="text" id={`input-${index}-1`} className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 text-center outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all dark:text-white" value={item.item_unit || ''} onChange={e => updateItem(index, 'item_unit', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 1)} onFocus={(e) => e.target.select()} /></div>
                    <div className="w-16"><label className="text-[10px] text-gray-500">item_quantity</label><input type="number" id={`input-${index}-2`} className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 text-center outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all dark:text-white" value={item.item_quantity} onChange={e => updateItem(index, 'item_quantity', e.target.value === '' ? 0 : Number(e.target.value))} onKeyDown={(e) => handleKeyDown(e, index, 2)} onFocus={(e) => e.target.select()} /></div>
                    <div className="w-24"><label className="text-[10px] text-gray-500">item_unit_price</label><input type="number" id={`input-${index}-3`} className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 text-center outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all dark:text-white" value={item.item_unit_price} onChange={e => updateItem(index, 'item_unit_price', e.target.value === '' ? 0 : Number(e.target.value))} onKeyDown={(e) => handleKeyDown(e, index, 3)} onFocus={(e) => e.target.select()} /></div>
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
                  <span>رسم_ع_القيمة_المضافة:</span>
                  <div className="flex items-center gap-2">
                    <input type="number" readOnly className={`w-28 px-3 py-1.5 border rounded text-right bg-gray-50 dark:bg-gray-700 cursor-default ${!includeTva ? 'opacity-40' : ''}`} value={computed_tva.toFixed(2)} />
                    <input type="checkbox" checked={includeTva} onChange={e => setIncludeTva(e.target.checked)} className="w-4 h-4 accent-blue-500 cursor-pointer" title="تضمين في المجموع" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm"><span>الرسم_ع_الطابع:</span><input type="number" className="w-28 px-3 py-1.5 border rounded text-right" value={financials.stamp_duty} onChange={e => setFinancials({...financials, stamp_duty: Number(e.target.value)})} /></div>
                <div className="flex justify-between items-center font-bold pt-2 border-t border-dashed"><span>المجموع_الكلي:</span><span className="text-primary font-mono text-xl bg-primary/10 px-3 py-1 rounded-lg">{grand_total_invoice.toFixed(2)}</span></div>
              </div>
              <div className="flex-1">
                <label className="text-sm font-bold block mb-2">المبلغ_بالحروف_للمجموع_الكلي</label>
                <textarea rows={4} className="w-full px-3 py-2 border rounded-lg text-sm resize-none dark:bg-gray-700" placeholder="أقفلت هذه الفاتورة عند مبلغ..." value={amountInWords} onChange={e => setAmountInWords(e.target.value)} />
              </div>
            </div>

            {/* اختيار الصفحات */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-dashed">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">الصفحات:</span>
              <label className={`flex items-center gap-1.5 ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} title={!isPremium ? "يتطلب الباقة المميزة" : ""}>
                <input type="radio" name="pages" disabled={!isPremium} checked={pagesToPrint === 'receipt'} onChange={() => setPagesToPrint('receipt')} className="accent-primary" />
                <span className="text-sm">وصل الاستلام فقط</span>
                {!isPremium && <Lock className="w-3 h-3 text-amber-500" />}
              </label>
              <label className={`flex items-center gap-1.5 ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} title={!isPremium ? "يتطلب الباقة المميزة" : ""}>
                <input type="radio" name="pages" disabled={!isPremium} checked={pagesToPrint === 'invoice'} onChange={() => setPagesToPrint('invoice')} className="accent-primary" />
                <span className="text-sm">الفاتورة فقط</span>
                {!isPremium && <Lock className="w-3 h-3 text-amber-500" />}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="pages" checked={pagesToPrint === 'both' || !isPremium} onChange={() => setPagesToPrint('both')} className="accent-primary" />
                <span className="text-sm">الاثنين معاً {isPremium ? '' : '(متاح)'}</span>
              </label>
            </div>

            {/* أزرار التوليد */}
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleGenerate('pdf')} disabled={generating} className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-colors">
                {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} توليد PDF
              </motion.button>
              <motion.button 
                whileTap={isPremium && !generating ? { scale: 0.98 } : {}} 
                onClick={() => isPremium && handleGenerate('docx')} 
                disabled={generating || !isPremium} 
                title={!isPremium ? "توليد ملفات Word متاح في الباقة المميزة فقط" : ""}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${!isPremium ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} توليد Word
                {!isPremium && <Lock className="w-4 h-4 text-amber-500" />}
              </motion.button>
            </div>
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
          <InvoicePrintLayout payload={buildPayload()} pagesToPrint={pagesToPrint} />
        </div>
      </div>
    </div>
  );
}

