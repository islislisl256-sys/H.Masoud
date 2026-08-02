"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { TrendingUp, Users, Package, DollarSign, AlertTriangle, ShoppingCart, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    invoicesCount: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Today's start date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: invoices } = await supabase.from('invoices').select('total, profit, created_at');
        const { data: products } = await supabase.from('products').select('quantity');

        let sales = 0;
        let profit = 0;
        let invCount = 0;

        if (invoices) {
          invoices.forEach(inv => {
            sales += Number(inv.total);
            profit += Number(inv.profit);
            if (new Date(inv.created_at) >= today) {
              invCount++;
            }
          });
        }

        let lowStock = 0;
        if (products) {
          products.forEach(p => {
            if (p.quantity < 10) lowStock++;
          });
        }

        setStats({ totalSales: sales, totalProfit: profit, invoicesCount: invCount, lowStockCount: lowStock });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
     return <ProtectedLayout><div className="flex items-center justify-center h-[calc(100vh-8rem)]"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div></ProtectedLayout>
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على نشاط المكتبة اليوم</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="إجمالي المبيعات"
            value={`${stats.totalSales.toLocaleString()} د.ج`}
            icon={DollarSign}
            trend="عبر كل الأوقات"
            trendUp={true}
          />
          <DashboardCard
            title="إجمالي الأرباح"
            value={`${stats.totalProfit.toLocaleString()} د.ج`}
            icon={TrendingUp}
            trend="عبر كل الأوقات"
            trendUp={true}
          />
          <DashboardCard
            title="الفواتير (اليوم)"
            value={stats.invoicesCount.toString()}
            icon={ShoppingCart}
            trend="فواتير مسجلة اليوم"
            trendUp={true}
          />
          <DashboardCard
            title="تنبيهات المخزون"
            value={stats.lowStockCount.toString()}
            icon={AlertTriangle}
            trend="منتجات قاربت على النفاد (أقل من 10)"
            trendUp={false}
            alert={true}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="font-semibold leading-none tracking-tight mb-4 text-gray-900 dark:text-white">المبيعات والأرباح</h3>
            <div className="h-[300px] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              مساحة الرسم البياني (سيتم برمجتها قريباً)
            </div>
          </div>
          
          <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="font-semibold leading-none tracking-tight mb-4 text-gray-900 dark:text-white">المنتجات الأكثر مبيعاً</h3>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                يتم جمع بيانات المبيعات لعرضها هنا
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  alert = false
}: { 
  title: string, 
  value: string, 
  icon: any, 
  trend: string, 
  trendUp: boolean,
  alert?: boolean
}) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-sm p-6 dark:border-gray-700 bg-white dark:bg-gray-800 ${alert ? 'border-red-200 dark:border-red-900/50' : ''}`}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <Icon className={`h-4 w-4 ${alert ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
      </div>
      <div className="space-y-1">
        <div className={`text-2xl font-bold text-gray-900 dark:text-white ${alert ? 'text-red-600 dark:text-red-400' : ''}`}>{value}</div>
        <p className={`text-xs ${alert ? 'text-red-500' : (trendUp ? 'text-green-500' : 'text-gray-500')}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}
