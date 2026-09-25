"use client";

import React, {/* Android Button */}
          <a
            href="/hanutak_mobile.apk"
            download="hanutak.apk"
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-green-600/25 transition-all active:scale-95"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.34a.5.5 0 0 0 .5-.5v-5.18a.5.5 0 0 0-.5-.5h-.5V6.5A4.5 4.5 0 0 0 12.523 2h-1.046A4.5 4.5 0 0 0 6.977 6.5v2.66h-.5a.5.5 0 0 0-.5.5v5.18a.5.5 0 0 0 .5.5h.5v1.16a1.5 1.5 0 0 0 1.5 1.5h.5v2.5a1 1 0 0 0 2 0v-2.5h2.046v2.5a1 1 0 0 0 2 0v-2.5h.5a1.5 1.5 0 0 0 1.5-1.5v-1.16h.5zM8.977 6.5A2.5 2.5 0 0 1 11.477 4h1.046a2.5 2.5 0 0 1 2.5 2.5v2.66H8.977V6.5zM4.977 10.16a1 1 0 0 1 2 0v3.18a1 1 0 0 1-2 0v-3.18zm14.046 0a1 1 0 0 1 2 0v3.18a1 1 0 0 1-2 0v-3.18z"/>
            </svg>
            تثبيت تطبيق الأندرويد
          </a>

          {/* iPhone Button */}
          <a
            href="/hanutak_ios.mobileconfig"
            download="hanutak.mobileconfig"
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-gray-800/25 transition-all active:scale-95"
          >
            <Smartphone className="w-6 h-6" />
            تثبيت تطبيق الآيفون
          </a>
        </div>

        {/* iOS Instructions Panel */}
        {showIOSInstructions && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-5 rounded-xl text-sm leading-relaxed mt-4 border border-blue-200 dark:border-blue-800"
          >
            <p className="font-bold mb-3 text-base">خطوات تثبيت التطبيق على الآيفون:</p>
            <ol className="text-right list-decimal list-inside space-y-2">
              <li>افتح هذا الرابط في متصفح <strong>Safari</strong>.</li>
              <li>اضغط على زر <strong>المشاركة</strong> (المربع الذي يخرج منه سهم للأعلى) في أسفل الشاشة.</li>
              <li>مرر لأسفل واختر <strong>إضافة للشاشة الرئيسية (Add to Home Screen)</strong>.</li>
              <li>اضغط <strong>إضافة</strong> وسيظهر التطبيق على شاشتك الرئيسية.</li>
            </ol>
          </motion.div>
        )}
          
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-6">
          <ShieldCheck className="w-4 h-4" />
          <span>تطبيق آمن ومشفر</span>
        </div>
      </motion.div>
    </div>
  );
}