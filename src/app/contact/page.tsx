"use client";

import React from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Mail, Phone, MapPin, MessageCircle, ExternalLink } from "lucide-react";

export default function ContactPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6 pb-12 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">تواصل معنا</h1>
          <p className="text-muted-foreground mt-1">نسعد بالإجابة على استفساراتكم ومساعدتكم</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-8">
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">كيف يمكننا مساعدتك؟</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">فريق الدعم متاح للرد على جميع تساؤلاتك وحل أي مشكلة قد تواجهك في أقرب وقت.</p>
          </div>

          <div className="grid gap-4">
            <a href="https://wa.me/213555555555" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-300">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 dark:text-white">واتساب (الدعم السريع)</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">+213 55 55 55 55</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>

            <a href="mailto:support@masoud.com" className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 dark:text-white">البريد الإلكتروني</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">support@masoud.com</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 dark:text-white">المقر الرئيسي</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">الجزائر، ولاية الجلفة</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              أوقات العمل: من الأحد إلى الخميس، من 8:00 صباحاً إلى 4:00 مساءً
            </p>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
