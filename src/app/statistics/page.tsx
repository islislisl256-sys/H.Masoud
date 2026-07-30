"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { BarChart3, TrendingUp, Package, DollarSign, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("الشهر الحالي");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    invoicesCount: 0,
    productsSold: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: invoices } = await supabase.from('invoices').select('*');
        const { data: invoiceItems } = await supabase.from('invoice_items').select('quantity');

        let sales = 0;
        let profit = 0;
        let invCount = 0;
        let pSold = 0;

        if (invoices) {
          invoices.forEach(inv => {
            sales += Number(inv.total_amount);
            profit += Number(inv.total_profit);
            invCount++;
          });
        }

        if (invoiceItems) {
           invoiceItems.forEach(item => {
             pSold += Number(item.quantity);
           });
        }

        setStats({ totalSales: sales, totalProfit: profit, invoicesCount: invCount, productsSold: pSold });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">الإحصائيات والتقارير</h1>
            <p className="text-muted-foreground mt-1">تحليل أداء المكتبة والمبيعات (مجموع كلي)</p>
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
           </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="إجمالي المبيعات" value={`${stats.totalSales.toLocaleString()} د.ج`} trend="" icon={DollarSign} />
              <StatCard title="إجمالي الأرباح" value={`${stats.totalProfit.toLocaleString()} د.ج`} trend="" icon={TrendingUp} />
              <StatCard title="المنتجات المباعة" value={stats.productsSold.toString()} trend="" icon={Package} />
              <StatCard title="عدد الفواتير" value={stats.invoicesCount.toString()} trend="" icon={BarChart3} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {/* Chart Placeholder 1 */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">المبيعات والأرباح</h3>
                <div className="h-64 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                  رسم بياني خطي (Line Chart) سيضاف هنا
                </div>
              </div>

              {/* Chart Placeholder 2 */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">أفضل المنتجات مبيعاً</h3>
                <div className="h-64 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                  رسم بياني دائري (Pie Chart) سيضاف هنا
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedLayout>
  );
}

function StatCard({ title, value, trend, icon: Icon }: { title: string, value: string, trend: string, icon: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className="text-green-500 font-medium">{trend}</span>
          <span className="text-gray-500 dark:text-gray-400 mr-2">مقارنة بالشهر الماضي</span>
        </div>
      )}
    </div>
  );
}
