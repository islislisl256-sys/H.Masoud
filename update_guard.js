const fs = require('fs');
let code = fs.readFileSync('src/components/Layout/PwaGuard.tsx', 'utf8');

const regex = /<div className="space-y-3">[\s\S]*?<\/div>\s*\{\/\* iOS Instructions Panel \*\/\}/;

const replacement = `<div className="space-y-3">
          {/* Temporary Redirect Button */}
          <a
            href="https://google.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Download className="w-5 h-5" />
            الذهاب لصفحة التحميلات
          </a>
          <p className="text-xs text-gray-500 mt-2">
            * سيتم نقلك إلى الموقع المخصص لتحميل التطبيقات الآمنة
          </p>
        </div>

        {/* iOS Instructions Panel */}`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/Layout/PwaGuard.tsx', code, 'utf8');
console.log('Updated PwaGuard to use external download link');