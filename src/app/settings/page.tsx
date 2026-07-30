"use client";

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Save, Upload, Database, Moon, Sun, Lock, User, Store, Download } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);
  const [libraryName, setLibraryName] = useState("مكتبة الحاج مسعود");
  const [username, setUsername] = useState("HERMA");
  
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">إعدادات النظام</h1>
          <p className="text-muted-foreground mt-1">تخصيص النظام وإدارة الحساب</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
              <Store className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">إعدادات المكتبة</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المكتبة</label>
                <input
                  type="text"
                  value={libraryName}
                  onChange={(e) => setLibraryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شعار المكتبة</label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
                    <Store className="h-8 w-8 text-gray-400" />
                  </div>
                  <button className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                    <Upload className="h-4 w-4" />
                    <span>تغيير الشعار</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">الوضع الليلي</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">تفعيل الوضع المظلم بشكل افتراضي</p>
                </div>
                {mounted && (
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? '-translate-x-5' : 'translate-x-0'}`} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                <Save className="h-4 w-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">إعدادات الحساب</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المستخدم</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    placeholder="اترك الحقل فارغاً إذا لم ترد التغيير"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Save className="h-4 w-4" />
                  <span>تحديث الحساب</span>
                </button>
              </div>
            </div>

            {/* Database & Backup Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">قاعدة البيانات والنسخ الاحتياطي</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                <button className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="h-5 w-5 text-primary" />
                  <span className="font-medium">إنشاء نسخة احتياطية (Backup)</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Upload className="h-5 w-5 text-primary" />
                  <span className="font-medium">استعادة نسخة احتياطية (Restore)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
