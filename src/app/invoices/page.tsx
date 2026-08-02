"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Search, Filter, Eye, Printer, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Invoice = {
  id: string;
  invoice_number: string;
  total: number;
  profit: number;
  created_at: string;
};

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setInvoices(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟ (سيتم حذف التفاصيل المتعلقة بها أيضاً)")) {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (!error) {
        fetchInvoices();
      } else {
        alert("خطأ أثناء الحذف");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-DZ', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number?.includes(searchTerm) || inv.id.includes(searchTerm)
  );

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
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث بمعرف الفاتورة..."
                className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <input type="date" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm" />
              <button className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Filter className="h-4 w-4" />
                <span>تصفية</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">معرف الفاتورة</th>
                  <th scope="col" className="px-6 py-4 font-bold">التاريخ والوقت</th>
                  <th scope="col" className="px-6 py-4 font-bold">الإجمالي</th>
                  <th scope="col" className="px-6 py-4 font-bold">الربح</th>
                  <th scope="col" className="px-6 py-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">لا توجد فواتير</td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <span className="font-mono text-xs">{invoice.invoice_number}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{invoice.total} د.ج</td>
                      <td className="px-6 py-4 text-green-600 dark:text-green-400">{invoice.profit} د.ج</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                            <Printer className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(invoice.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
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
