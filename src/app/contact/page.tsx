"use client";

import React from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-primary/10 text-primary rounded-xl">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              اتصل بنا
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              نحن هنا لمساعدتك! تواصل مع الدعم الفني لأي استفسار أو مشكلة.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center gap-3 hover:border-primary transition-colors">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">الهاتف المحمول</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">متاح من 8 صباحاً حتى 5 مساءً</p>
            <a href="tel:+213000000000" className="text-primary font-bold hover:underline" dir="ltr">+213 000 000 000</a>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center gap-3 hover:border-primary transition-colors">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">البريد الإلكتروني</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">نرد على جميع الرسائل خلال 24 ساعة</p>
            <a href="mailto:support@example.com" className="text-primary font-bold hover:underline" dir="ltr">support@example.com</a>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center gap-3 hover:border-primary transition-colors">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">العنوان</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">المقر الرئيسي للشركة</p>
            <p className="text-gray-900 dark:text-white font-bold">الجزائر العاصمة، الجزائر</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">أرسل لنا رسالة</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("تم إرسال الرسالة بنجاح!"); }}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الاسم الكامل</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="أدخل اسمك الكريم" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رقم الهاتف أو البريد</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="أدخل وسيلة للتواصل" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">موضوع الرسالة</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="عنوان الاستفسار" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الرسالة</label>
              <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-shadow resize-none" placeholder="اكتب رسالتك هنا..." required></textarea>
            </div>
            
            <button type="submit" className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
              <Send className="h-5 w-5" />
              إرسال الرسالة
            </button>
          </form>
        </div>

      </div>
    </ProtectedLayout>
  );
}
