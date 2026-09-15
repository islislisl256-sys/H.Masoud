import React from "react";
import { Download, Monitor, Smartphone, ShieldCheck, Apple } from "lucide-react";
import Link from "next/link";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            تحميل التطبيقات
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            احصل على أفضل تجربة من خلال تثبيت النظام على أجهزتك مباشرة.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          
          {/* Windows App */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full z-0" />
            <Monitor className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-6 relative z-10" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">
              برنامج الويندوز (كمبيوتر)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 flex-grow relative z-10">
              نسخة خفيفة وسريعة لأجهزة الكمبيوتر. تتصل دائماً بأحدث نسخة من النظام بشكل تلقائي.
              بعد التثبيت، سيتم مسح ملف التثبيت تلقائياً لتوفير مساحة جهازك.
            </p>
            <a 
              href="/downloads/LibrarySystem-Setup.exe" 
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors relative z-10"
              download
            >
              <Download className="w-5 h-5" />
              تحميل نسخة الويندوز
            </a>
          </div>

          {/* iOS App */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gray-500/10 rounded-br-full z-0" />
            <Apple className="w-16 h-16 text-gray-800 dark:text-gray-200 mb-6 relative z-10" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">
              تطبيق الآيفون (iOS)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 flex-grow relative z-10">
              لتثبيت التطبيق رسمياً بدون متجر (App Store)، افتح هذا الموقع من متصفح (Safari) في هاتفك، ثم اضغط على زر "مشاركة" واختر "إضافة للشاشة الرئيسية".
            </p>
            <div className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative z-10">
              <ol className="text-right text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside font-medium">
                <li>افتح الموقع عبر متصفح Safari.</li>
                <li>اضغط على أيقونة المشاركة (Share).</li>
                <li>اختر "إضافة للشاشة الرئيسية" (Add to Home Screen).</li>
              </ol>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
          <ShieldCheck className="w-5 h-5" />
          التطبيقات متصلة برابط الموقع لتلقي التحديثات بشكل فوري ومجاني.
        </div>
      </div>
    </div>
  );
}