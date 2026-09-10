"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Shield, Smartphone, Trash2, UserPlus, Save, X, Key } from "lucide-react";

// Secure Password Hashing
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState("");
  const [adminSupabase, setAdminSupabase] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // New Account State
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newMaxDevices, setNewMaxDevices] = useState(1);
  const [newDbUrl, setNewDbUrl] = useState("");
  const [newDbKey, setNewDbKey] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey) return;
    
    // Create a secure client that bypasses RLS using the service_role key
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL_HERE"; // The URL remains the same
    // We get the URL from the normal client setup or env
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || localStorage.getItem('supabase_url') || "";
    
    if(!supabaseUrl) {
      alert("يرجى التأكد من أن رابط Supabase موجود في الإعدادات");
    }

    const client = createClient(supabaseUrl, adminKey, {
      auth: { persistSession: false }
    });
    setAdminSupabase(client);
    setIsAuthenticated(true);
  };

  const fetchAdminData = async () => {
    if (!adminSupabase) return;
    setIsLoading(true);
    try {
      const { data: usersData, error: uErr } = await adminSupabase.from("fortress_users").select("*").order("created_at", { ascending: false });
      const { data: devicesData, error: dErr } = await adminSupabase.from("devices").select("*");
      
      if (uErr) {
        if (uErr.code === '42501' || uErr.message.includes('permission')) {
          alert("المفتاح السري غير صحيح أو لا يملك صلاحيات (Service Role)");
          setIsAuthenticated(false);
          return;
        }
        throw uErr;
      }
      
      if (usersData) setUsers(usersData);
      if (devicesData) setDevices(devicesData);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ في جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated, adminSupabase]);

  const handleUnlinkDevice = async (deviceId: string) => {
    if (!confirm("هل أنت متأكد من فك ارتباط هذا الجهاز؟")) return;
    try {
      await adminSupabase.from("devices").delete().eq("id", deviceId);
      alert("تم فك ارتباط الجهاز بنجاح");
      fetchAdminData();
    } catch (e) {
      alert("حدث خطأ أثناء فك الارتباط");
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await adminSupabase.from("fortress_users").update(updates).eq("id", userId);
      alert("تم التحديث بنجاح");
      fetchAdminData();
    } catch (e) {
      alert("حدث خطأ في التحديث");
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return alert("مطلوب البريد وكلمة المرور.");

    try {
      const hashedPassword = await hashPassword(newPassword);

      const { data, error } = await adminSupabase.from("fortress_users").insert({
        email: newEmail,
        password_hash: hashedPassword,
        account_status: 'active_open',
        max_total_devices: newMaxDevices,
        db_url: newDbUrl || null,
        db_key: newDbKey || null,
      }).select();

      if (error) throw error;

      alert("تم إنشاء الحساب بنجاح!");
      setIsAdding(false);
      fetchAdminData();
    } catch (error: any) {
      console.error(error);
      alert("حدث خطأ أثناء إنشاء الحساب. تأكد من أن الإيميل غير مكرر.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-center">دخول لوحة الإدارة</h1>
            <p className="text-sm text-gray-500 mt-2 text-center">أدخل المفتاح السري للإدارة (Service Role Key) لفك قفل الحماية.</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input 
                type="password" 
                required 
                value={adminKey} 
                onChange={e => setAdminKey(e.target.value)} 
                placeholder="eyJh..." 
                className="w-full border px-4 py-3 rounded-lg dark:bg-gray-700 font-mono text-sm" 
                dir="ltr"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              <Key className="w-5 h-5" /> فك القفل
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">لوحة تحكم القلعة الأمنية</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold transition-colors"
          >
            إقفال
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            {isAdding ? <X className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
            {isAdding ? 'إلغاء' : 'إضافة حساب جديد'}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-2 border-blue-100 dark:border-blue-900 mb-8">
          <h2 className="text-lg font-bold mb-4">إنشاء حساب عميل جديد</h2>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">البريد الإلكتروني *</label>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-700" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">كلمة المرور *</label>
                <input type="text" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-700" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">عدد الأجهزة المسموحة</label>
                <input type="number" min="1" value={newMaxDevices} onChange={e => setNewMaxDevices(parseInt(e.target.value))} className="w-full border p-2 rounded dark:bg-gray-700" />
              </div>
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-xl mt-4">
              إنشاء الحساب
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold">العملاء والأجهزة ({users.length})</h2>
          <button onClick={fetchAdminData} className="text-sm text-blue-600 hover:underline">تحديث</button>
        </div>
        
        {isLoading ? <div className="p-10 text-center">جاري التحميل...</div> : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[800px] overflow-y-auto">
            {users.map(user => {
              const userDevices = devices.filter(d => d.user_id === user.id);
              return (
                <div key={user.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{user.email}</h3>
                      <p className="text-sm text-gray-500">حالة الحساب: {user.account_status} | تم الإعداد: {user.onboarding_completed ? 'نعم' : 'لا'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateUser(user.id, { account_status: user.account_status === 'inactive' ? 'active_open' : 'inactive' })} className="px-3 py-1.5 text-xs font-bold rounded bg-gray-100 hover:bg-gray-200 text-gray-800">
                        {user.account_status === 'inactive' ? 'تفعيل' : 'تعطيل'}
                      </button>
                      <button onClick={() => handleUpdateUser(user.id, { onboarding_completed: false })} className="px-3 py-1.5 text-xs font-bold rounded bg-amber-100 text-amber-800">
                        إعادة التهيئة
                      </button>
                      <button onClick={() => { if(confirm("حذف نهائي؟")) adminSupabase.from("fortress_users").delete().eq("id", user.id).then(() => fetchAdminData()) }} className="px-3 py-1.5 text-xs font-bold rounded bg-red-600 text-white">
                        حذف
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold flex items-center gap-2">الأجهزة ({userDevices.length} / {user.max_total_devices})</span>
                    </div>
                    <div className="space-y-2">
                      {userDevices.map(device => (
                        <div key={device.id} className="flex items-center justify-between bg-white dark:bg-gray-800 border p-3 rounded-lg">
                          <div>
                            <p className="text-xs font-bold">{device.device_type.toUpperCase()}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-1" dir="ltr">{device.hardware_fingerprint}</p>
                          </div>
                          <button onClick={() => handleUnlinkDevice(device.id)} className="text-xs text-red-600 font-bold border px-2 py-1.5 rounded">
                            فك الارتباط
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
