"use client";

import React, { useEffect, useState, useMemo } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { BarChart3, TrendingUp, Package, DollarSign, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";

type Invoice = {
  id: string;
  total: number;
  profit: number;
  created_at: string;
};

type InvoiceItem = {
  quantity: number;
  profit: number;
  products: { name: string } | null;
};

// الألوان للرسم البياني الشريطي
const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export default function StatisticsPage() {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [allItems, setAllItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // فلتر التاريخ
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  const [fromDate, setFromDate] = useState(defaultFrom.toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: invoices } = await supabase.from('invoices').select('*').order('created_at', { ascending: true });
        const { data: items } = await supabase.from('invoice_items').select('quantity, profit, products(name)');
        setAllInvoices(invoices || []);
        setAllItems((items as InvoiceItem[]) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // الفواتير المصفاة حسب نطاق التاريخ
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
      const d = inv.created_at.slice(0, 10);
      return d >= fromDate && d <= toDate;
    });
  }, [allInvoices, fromDate, toDate]);

  // إحصائيات ملخصة
  const stats = useMemo(() => {
    const totalSales = filteredInvoices.reduce((s, i) => s + Number(i.total), 0);
    const totalProfit = filteredInvoices.reduce((s, i) => s + Number(i.profit), 0);
    return { totalSales, totalProfit, invoicesCount: filteredInvoices.length };
  }, [filteredInvoices]);

  // بيانات الرسم البياني الخطي (مجمّعة يومياً)
  const chartData = useMemo(() => {
    const map: Record<string, { date: string; sales: number; profit: number }> = {};
    filteredInvoices.forEach(inv => {
      const d = inv.created_at.slice(0, 10);
      if (!map[d]) map[d] = { date: d, sales: 0, profit: 0 };
      map[d].sales += Number(inv.total);
      map[d].profit += Number(inv.profit);
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredInvoices]);

  // أفضل 5 منتجات (بناءً على الكمية المباعة)
  const top5 = useMemo(() => {
    const map: Record<string, { name: string; qty: number; profit: number }> = {};
    allItems.forEach(item => {
      const name = item.products?.name || 'غير معروف';
      if (!map[name]) map[name] = { name, qty: 0, profit: 0 };
      map[name].qty += Number(item.quantity);
      map[name].profit += Number(item.profit);
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [allItems]);

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">الإحصائيات والتقارير</h1>
          <p className="text-muted-foreground mt-1">تحليل أداء المكتبة والمبيعات</p>
        </div>

        {/* فلتر الفترة الزمنية */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">الفترة الزمنية:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
              <span className="text-gray-400 self-center">→</span>
              <input
                type="date"
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map(days => (
                <button key={days} onClick={() => {
                  const f = new Date(); f.setDate(f.getDate() - days);
                  setFromDate(f.toISOString().slice(0, 10));
                  setToDate(new Date().toISOString().slice(0, 10));
                }} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors">
                  {days === 7 ? 'أسبوع' : days === 30 ? 'شهر' : '3 أشهر'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* بطاقات الملخص */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <StatCard title="إجمالي المبيعات" value={`${stats.totalSales.toLocaleString()} د.ج`} icon={DollarSign} color="blue" />
          <StatCard title="إجمالي الأرباح" value={`${stats.totalProfit.toLocaleString()} د.ج`} icon={TrendingUp} color="green" />
          <StatCard title="عدد الفواتير" value={stats.invoicesCount.toString()} icon={BarChart3} color="purple" />
        </div>

        {/* الرسم البياني الخطي */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">📈 المبيعات والأرباح اليومية</h3>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">لا توجد بيانات في هذه الفترة</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString()} د.ج`]}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} dot={false} name="المبيعات" />
                <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2.5} dot={false} name="الأرباح" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* أفضل 5 منتجات */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">🏆 أفضل 5 منتجات مبيعاً</h3>
          {top5.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400">لا توجد بيانات</div>
          ) : (
            <div className="space-y-3">
              {top5.map((item, i) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="text-2xl font-black text-gray-200 dark:text-gray-600 w-6 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.qty} وحدة</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.qty / top5[0].qty) * 100}%`,
                          backgroundColor: COLORS[i],
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400 w-20 text-left">{item.profit.toLocaleString()} د.ج</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </ProtectedLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 leading-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
