const fs = require('fs');
let c = fs.readFileSync('src/components/Invoices/CustomInvoicesTab.tsx', 'utf8');
c = c.replace('<div className="flex flex-col lg:flex-row gap-6 bg-white dark:bg-gray-900 p-6 rounded-xl w-full">', '<div className="flex flex-col lg:flex-row gap-6">');
fs.writeFileSync('src/components/Invoices/CustomInvoicesTab.tsx', c);