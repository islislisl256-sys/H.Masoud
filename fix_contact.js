const fs = require('fs');

let content = fs.readFileSync('src/app/contact/page.tsx', 'utf8');

// Fix contact page overflows
content = content.replace(/<div className="text-right">/g, '<div className="text-right flex-1 min-w-0">');
content = content.replace(/<div className="flex items-center gap-4">/g, '<div className="flex items-center gap-4 flex-1 min-w-0">');
content = content.replace(/<p className="text-sm text-gray-500 dark:text-gray-400">/g, '<p className="text-sm text-gray-500 dark:text-gray-400 truncate break-words">');

fs.writeFileSync('src/app/contact/page.tsx', content, 'utf8');
console.log('Fixed contact page');