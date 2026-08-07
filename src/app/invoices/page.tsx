"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Loader2, Eye, Share2, Trash2, X, Undo2, Receipt, Calendar as CalendarIcon, CircleDollarSign, TrendingUp as TrendingUpIcon, Package, FileText, FileEdit } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CustomInvoicesTab from "@/components/Invoices/CustomInvoicesTab";

type Invoice = {
  id: string;
  invoice_number: string;
  total: number;
  profit: number;
  created_at: string;
};

type InvoiceItem = {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  profit: number;
  products: { name: string; product_number: string } | null;
};

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'custom'>('system');
  const [searchDate, setSearchDate] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setInvoices(data);
    setLoading(false);
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setLoadingItems(true);
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*, products(name, product_number)')
      .eq('invoice_id', invoice.id);
    if (!error && data) setInvoiceItems(data as InvoiceItem[]);
    setLoadingItems(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("حذف هذه البيعة؟")) {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (!error) fetchInvoices();
      else alert("خطأ أثناء الحذف");
    }
  };

  const handleSharePDF = async (invoice: Invoice) => {
    let items = invoiceItems;
    if (!selectedInvoice || selectedInvoice.id !== invoice.id) {
      const { data } = await supabase
        .from('invoice_items')
        .select('*, products(name, product_number)')
        .eq('invoice_id', invoice.id);
      items = (data as InvoiceItem[]) || [];
    }

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFontSize(18);
    doc.text(`Invoice: ${invoice.invoice_number}`, 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Date: ${formatDate(invoice.created_at)}`, 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Product', 20, 45);
    doc.text('Qty', 100, 45);
    doc.text('Unit Price', 120, 45);
    doc.text('Total', 155, 45);
    doc.line(20, 48, 190, 48);

    let y = 55;
    items.forEach(item => {
      const name = item.products?.name || 'Unknown';
      doc.text(name.substring(0, 30), 20, y);
      doc.text(String(item.quantity), 100, y);
      doc.text(`${item.unit_price} DA`, 120, y);
      doc.text(`${item.total_price} DA`, 155, y);
      y += 8;
    });

    doc.line(20, y, 190, y);
    y += 6;
    doc.setFontSize(12);
    doc.text(`Total: ${invoice.total} DA`, 155, y, { align: 'right' });
    y += 6;
    doc.text(`Profit: ${invoice.profit} DA`, 155, y, { align: 'right' });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-DZ', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const filteredInvoices = invoices.filter(inv => {
    if (!searchDate) return true;
    const invDate = new Date(inv.created_at).toISOString().slice(0, 10);
    return invDate >= searchDate;
  });

  const isReturn = (inv: Invoice) => inv.invoice_number?.startsWith('RET-');

  return (
    <ProtectedLayout>
      <div className="space-y-4 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">الفواتير والمبيعات</h1>
          
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('system')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'system'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              سجل المبيعات
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FileEdit className="h-4 w-4" />
              فواتير مخصصة
            </button>
          </div>
        </div>

        {activeTab === 'custom' ? (
          <CustomInvoicesTab />
        ) : (
          <>
            {/* فلتر التاريخ */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              className="w-full pl-3 pr-10 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
            />
          </div>
        </div>

        {/* عدد النتائج */}
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{filteredInvoices.length} بيعة</p>

        {/* البيعات على شكل بطاقات */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد مبيعات</div>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map(invoice => (
              <div key={invoice.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden ${isReturn(invoice) ? 'border-orange-200 dark:border-orange-800' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="p-4 space-y-3">
                  {/* السطر الأول: الرقم + التاريخ */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`font-mono text-sm px-2.5 py-1 rounded-full font-bold ${isReturn(invoice) ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {invoice.invoice_number}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(invoice.created_at)}</span>
                  </div>

                  {/* السطر الثاني: الإجمالي + الربح */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">الإجمالي</p>
                      <p className={`text-xl font-bold ${isReturn(invoice) ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>{invoice.total.toLocaleString()} د.ج</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">الربح</p>
                      <p className={`text-lg font-bold ${isReturn(invoice) ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>{invoice.profit.toLocaleString()} د.ج</p>
                    </div>
                  </div>

                  {/* السطر الثالث: الأزرار */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => handleViewInvoice(invoice)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                      <Eye className="h-4 w-4" /> عرض
                    </button>
                    <button onClick={() => handleSharePDF(invoice)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 transition-colors">
                      <Share2 className="h-4 w-4" /> PDF
                    </button>
                    <button onClick={() => handleDelete(invoice.id)} className="flex items-center justify-center p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

            {/* Footer */}
            <div className="pt-8 pb-4 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">®HERMA_LAISSAOUI_ISLAM_Developer</p>
            </div>
          </>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className={`p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${isReturn(selectedInvoice) ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-primary/5'}`}>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {isReturn(selectedInvoice) ? <Undo2 className="h-5 w-5 text-orange-500" /> : <Receipt className="h-5 w-5 text-primary" />}
                  {isReturn(selectedInvoice) ? 'استرجاع' : 'تفاصيل البيعة'}
                </h2>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{selectedInvoice.invoice_number}</p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => handleSharePDF(selectedInvoice)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" /> PDF
                </button>
                <button onClick={() => { setSelectedInvoice(null); setInvoiceItems([]); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/40 flex gap-4 text-sm flex-wrap">
              <span className="text-gray-500 flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formatDate(selectedInvoice.created_at)}</span>
              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5"><CircleDollarSign className="h-4 w-4 text-primary" /> {selectedInvoice.total} د.ج</span>
              <span className="text-green-600 flex items-center gap-1.5"><TrendingUpIcon className="h-4 w-4" /> ربح: {selectedInvoice.profit} د.ج</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {loadingItems ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : invoiceItems.length === 0 ? (
                <p className="text-center text-gray-400 py-8">لا توجد منتجات</p>
              ) : (
                invoiceItems.map((item, i) => (
                  <div key={item.id || i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.products?.name || 'غير معروف'}</p>
                        <p className="text-xs text-gray-400">{item.products?.product_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.total_price} د.ج</p>
                      <p className="text-xs text-gray-400">x{item.quantity} × {item.unit_price}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
