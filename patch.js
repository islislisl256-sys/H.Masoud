const fs = require('fs');
let content = fs.readFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx', 'utf8');

const target1 = "{isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}\n            </button>";
const replacement1 = "{isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}\n            </button>\n            <button type=\"button\" onClick={handleBackToStep1} disabled={isLoading} className=\"w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mt-3\">\n              <ArrowRight className=\"w-4 h-4\" />\n              رجوع لإدخال رقم المؤسسة\n            </button>";
content = content.replace(target1, replacement1);

const target2 = "{isLoading ? 'جاري الحفظ...' : 'حفظ والدخول للنظام'}\n            </button>";
const replacement2 = "{isLoading ? 'جاري الحفظ...' : 'حفظ والدخول للنظام'}\n            </button>\n            <button type=\"button\" onClick={handleBackToStep2} disabled={isLoading} className=\"w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mt-3\">\n              <ArrowRight className=\"w-4 h-4\" />\n              تسجيل خروج والرجوع\n            </button>";
content = content.replace(target2, replacement2);

fs.writeFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx', content, 'utf8');
