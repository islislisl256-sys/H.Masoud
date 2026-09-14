const fs = require('fs');
let c = fs.readFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/chat/page.tsx', 'utf8');

c = c.replace(
  /<button[\s\S]*?onClick=\{\(\) => router\.back\(\)\}[\s\S]*?<\/button>/,
  \<button 
          onClick={() => router.push('/settings')}
          className="flex items-center gap-1.5 p-2 ml-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span className="font-medium text-sm">رجوع</span>
        </button>\
);

fs.writeFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/chat/page.tsx', c, 'utf8');
