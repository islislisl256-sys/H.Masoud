"use client";

import React from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Mail, Phone, MessageCircle, ExternalLink, Facebook, Instagram, Users } from "lucide-react";

export default function ContactPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6 pb-12 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">اتصل بنا</h1>
          <p className="text-muted-foreground mt-1">نحن هنا للإجابة على استفساراتك واستقبال شكاواك.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-8">
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">كيف يمكننا مساعدتك؟</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">لا تتردد في التواصل معنا عبر أي من القنوات التالية.</p>
          </div>

          <div className="grid gap-4">
            
            {/* WhatsApp Group */}
            <a href="https://chat.whatsapp.com/BuPN9fxp31TK0ZqO5KrwvQ" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-300">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 dark:text-white">مجموعة الشكاوى للمستخدمين</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">انضم لمجموعة الواتساب</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>

            {/* Facebook */}
            <a href="https://www.facebook.com/share/17yFJQbTTz/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300">
                  <Facebook className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 dark:text-white">صفحة الفيسبوك الخاصة بالشركة المنتجة</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@laissaoui_dev_dz</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>

            {/* Instagram */}
            <a href="https://www.instagram.com/laissaoui_dev_dz?stkn=MW02a2h1cHVuN2F0dA==" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors border border-pink-100 dark:border-pink-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-800 rounded-full text-pink-600 dark:text-pink-300">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 dark:text-white">صفحة الانستقرام الخاصة بالشركة المنتجة</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@laissaoui_dev_dz</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>

            {/* Email */}
            <a href="mailto:laissaouilaissaoui89@gmail.com" className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 dark:text-white">ايميل المراسلة</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">laissaouilaissaoui89@gmail.com</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <a href="/contact" className="inline-block text-sm font-bold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors cursor-pointer py-4 my-2">
              ©LAISSAOUI-DEV-DZ
            </a>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}