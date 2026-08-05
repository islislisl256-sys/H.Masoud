"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Search, Loader2, Eye, Share2, Trash2, X, Undo2, Receipt, Calendar as CalendarIcon, CircleDollarSign, TrendingUp as TrendingUpIcon, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (!error) fetchInvoices();
      else alert("خطأ أثناء الحذف");
    }
  };

  const handleSharePDF = async (invoice: Invoice) => {
    // Load items if needed
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

    // RTL content via text
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">إدارة الفواتير</h1>
            <p className="text-muted-foreground mt-1">سجل المبيعات والفواتير الصادرة</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-medium">لا توجد فواتير</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInvoices.map(invoice => (
                  <div key={invoice.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className={`font-mono text-sm px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 ${isReturn(invoice) ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        <Receipt className="h-4 w-4" /> {invoice.invoice_number}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" /> {formatDate(invoice.created_at)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                        <span className="text-xs text-gray-500 block mb-1">الإجمالي</span>
                        <span className={`font-bold text-lg ${isReturn(invoice) ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>{invoice.total} د.ج</span>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                        <span className="text-xs text-gray-500 block mb-1">الربح</span>
                        <span className={`font-bold text-lg ${isReturn(invoice) ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>{invoice.profit} د.ج</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 mt-1 border-t border-gray-200 dark:border-gray-600 pt-3">
                      <button onClick={() => handleViewInvoice(invoice)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye className="h-4 w-4" /> عرض
                      </button>
                      <button onClick={() => handleSharePDF(invoice)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                        <Share2 className="h-4 w-4" /> PDF
                      </button>
                      <button onClick={() => handleDelete(invoice.id)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 border border-red-100 dark:border-red-800 rounded-lg transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className={`p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${isReturn(selectedInvoice) ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-primary/5'}`}>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {isReturn(selectedInvoice) ? <Undo2 className="h-5 w-5 text-orange-500" /> : <Receipt className="h-5 w-5 text-primary" />}
                  {isReturn(selectedInvoice) ? 'وصل استرجاع' : 'تفاصيل الفاتورة'}
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

            {/* Invoice Info */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/40 flex gap-4 text-sm flex-wrap">
              <span className="text-gray-500 flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formatDate(selectedInvoice.created_at)}</span>
              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5"><CircleDollarSign className="h-4 w-4 text-primary" /> {selectedInvoice.total} د.ج</span>
              <span className="text-green-600 flex items-center gap-1.5"><TrendingUpIcon className="h-4 w-4" /> ربح: {selectedInvoice.profit} د.ج</span>
            </div>

            {/* Items */}
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.products?.name || 'منتج غير معروف'}</p>
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
