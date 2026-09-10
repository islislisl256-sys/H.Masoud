"use client";

import React, { useState, useEffect } from "react";
import { mainSupabase } from "@/lib/supabase";
import { Shield, Smartphone, Trash2, UserPlus, Save, X } from "lucide-react";

// Secure Password Hashing (SHA-256 via WebCrypto) matching AuthContext
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New Account State
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newMaxDevices, setNewMaxDevices] = useState(1);
  const [newDbUrl, setNewDbUrl] = useState("");
  const [newDbKey, setNewDbKey] = useState("");

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const { data: usersData } = await mainSupabase.from("fortress_users").select("*").order("created_at", { ascending: false });
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

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return alert("البريد الإلكتروني وكلمة المرور مطلوبان.");

    try {
      const hashedPassword = await hashPassword(newPassword);

      const { data, error } = await mainSupabase.from("fortress_users").insert({
        email: newEmail,
        password_hash: hashedPassword,
        account_status: 'active_open', // تفعيل تلقائي
        max_total_devices: newMaxDevices,
        db_url: newDbUrl || null,
        db_key: newDbKey || null,
      }).select();

      if (error) throw error;

      alert("تم إنشاء الحساب بنجاح!");
      setIsAdding(false);
      setNewEmail("");
      setNewPassword("");
      setNewMaxDevices(1);
      setNewDbUrl("");
      setNewDbKey("");
      
      fetchAdminData();
    } catch (error: any) {
      console.error(error);
      alert("حدث خطأ أثناء إنشاء الحساب. قد يكون الإيميل مسجلاً مسبقاً.");
    }
  };

  if (isLoading && users.length === 0) return <div className="p-10 text-center text-gray-500 font-bold">جاري تحميل لوحة التحكم...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">لوحة تحكم القلعة الأمنية</h1>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          {isAdding ? <X className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
          {isAdding ? 'إلغاء' : 'إضافة حساب جديد'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-2 border-blue-100 dark:border-blue-900 mb-8">
          <h2 className="text-lg font-bold mb-4">إنشاء حساب عميل جديد</h2>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">البريد الإلكتروني (الإيميل) *</label>
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
            
            <div className="pt-4 border-t mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-2">إعدادات قاعدة البيانات الخاصة بالعميل (Supabase) - اختيارية يمكن للعميل إدخالها لاحقاً</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">DB URL</label>
                <input type="text" value={newDbUrl} onChange={e => setNewDbUrl(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-700 text-xs" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">DB ANON KEY</label>
                <input type="text" value={newDbKey} onChange={e => setNewDbKey(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-700 text-xs" dir="ltr" />
              </div>
            </div>

            <button type="submit" className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-xl mt-4">
              <Save className="w-5 h-5" /> إنشاء الحساب الآن
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold">إدارة العملاء والأجهزة ({users.length})</h2>
          <button onClick={fetchAdminData} className="text-sm text-blue-600 hover:underline">تحديث البيانات</button>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[800px] overflow-y-auto">
          {users.map(user => {
            const userDevices = devices.filter(d => d.user_id === user.id);
            return (
              <div key={user.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{user.email}</h3>
                    <p className="text-sm text-gray-500">حالة الحساب: {user.account_status} | نوع التجارة: {user.trade_type || 'لم يُحدد بعد'}</p>
                    <p className="text-sm text-gray-500">تم إكمال الإعداد: {user.onboarding_completed ? 'نعم' : 'لا'}</p>
                    <p className="text-xs text-blue-500 mt-1" dir="ltr">{user.db_url ? "DB Linked" : "No Custom DB"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateUser(user.id, { account_status: user.account_status === 'inactive' ? 'active_open' : 'inactive' })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg ${user.account_status === 'inactive' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                    >
                      {user.account_status === 'inactive' ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                    </button>
                    <button 
                      onClick={() => handleUpdateUser(user.id, { onboarding_completed: false })}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800"
                    >
                      إعادة فتح معالج الإعداد
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm("هل أنت متأكد من حذف الحساب بشكل نهائي؟ لا يمكن التراجع!")) {
                           mainSupabase.from("fortress_users").delete().eq("id", user.id).then(() => fetchAdminData());
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white"
                    >
                      حذف نهائي
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
                            <p className="text-[10px] text-gray-400 mt-1">تاريخ الربط: {new Date(device.created_at).toLocaleDateString()}</p>
                          </div>
                          <button 
                            onClick={() => handleUnlinkDevice(device.id)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-md transition-colors font-bold border border-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> فك الارتباط (حذف الجهاز)
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
