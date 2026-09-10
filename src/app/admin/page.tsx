"use client";

import React, { useState, useEffect } from "react";
import { mainSupabase } from "@/lib/supabase";
import { Shield, Smartphone, Trash2, Edit, Save, X } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const { data: usersData } = await mainSupabase.from("fortress_users").select("*");
      const { data: devicesData } = await mainSupabase.from("devices").select("*");
      
      if (usersData) setUsers(usersData);
      if (devicesData) setDevices(devicesData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUnlinkDevice = async (deviceId: string) => {
    if (!confirm("هل أنت متأكد من فك ارتباط هذا الجهاز؟ سيسمح ذلك للمستخدم بتسجيل الدخول من جهاز جديد.")) return;
    try {
      await mainSupabase.from("devices").delete().eq("id", deviceId);
      alert("تم فك ارتباط الجهاز بنجاح");
      fetchAdminData();
    } catch (e) {
      alert("حدث خطأ أثناء فك الارتباط");
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await mainSupabase.from("fortress_users").update(updates).eq("id", userId);
      alert("تم تحديث الحساب بنجاح");
      fetchAdminData();
    } catch (e) {
      alert("حدث خطأ في التحديث");
    }
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500 font-bold">جاري تحميل لوحة التحكم...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center gap-3 border-b pb-4">
        <Shield className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">لوحة تحكم القلعة الأمنية (Admin Panel)</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">إدارة العملاء والأجهزة</h2>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {users.map(user => {
            const userDevices = devices.filter(d => d.user_id === user.id);
            return (
              <div key={user.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{user.email}</h3>
                    <p className="text-sm text-gray-500">حالة الحساب: {user.account_status} | نوع التجارة: {user.trade_type || 'لم يُحدد بعد'}</p>
                    <p className="text-sm text-gray-500">تم إكمال الإعداد: {user.onboarding_completed ? 'نعم' : 'لا'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateUser(user.id, { account_status: user.account_status === 'inactive' ? 'active_open' : 'inactive' })}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
                    >
                      {user.account_status === 'inactive' ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                    </button>
                    <button 
                      onClick={() => handleUpdateUser(user.id, { onboarding_completed: false })}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800"
                    >
                      إعادة فتح معالج الإعداد
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold flex items-center gap-2"><Smartphone className="w-4 h-4"/> الأجهزة المرتبطة ({userDevices.length} / {user.max_total_devices})</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">الحد الأقصى:</span>
                      <input 
                        type="number" 
                        defaultValue={user.max_total_devices} 
                        className="w-16 px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800"
                        onBlur={(e) => {
                          if (e.target.value !== String(user.max_total_devices)) {
                            handleUpdateUser(user.id, { max_total_devices: parseInt(e.target.value) });
                          }
                        }}
                      />
                    </div>
                  </div>

                  {userDevices.length === 0 ? (
                    <p className="text-xs text-gray-400">لا يوجد أجهزة مرتبطة بهذا الحساب حالياً.</p>
                  ) : (
                    <div className="space-y-2">
                      {userDevices.map(device => (
                        <div key={device.id} className="flex items-center justify-between bg-white dark:bg-gray-800 border dark:border-gray-700 p-3 rounded-lg">
                          <div>
                            <p className="text-xs font-bold">{device.device_type.toUpperCase()}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-1" dir="ltr">{device.hardware_fingerprint}</p>
                          </div>
                          <button 
                            onClick={() => handleUnlinkDevice(device.id)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-md transition-colors font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> فك الارتباط
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {users.length === 0 && <p className="p-5 text-center text-gray-500">لا يوجد مستخدمين بعد.</p>}
        </div>
      </div>
    </div>
  );
}
