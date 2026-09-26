const fs = require('fs');

function fixFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Fix 1: The label wrapping the file input needs 'relative'
    // Specifically in products/page.tsx line 418: <label className="cursor-pointer shrink-0 ml-1">
    content = content.replace(
        /<label className="cursor-pointer shrink-0 ml-1">/g,
        '<label className="cursor-pointer shrink-0 ml-1 relative overflow-hidden">'
    );
    
    // Specifically the add product manual buttons:
    // <label className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
    content = content.replace(
        /<label className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700\/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">/g,
        '<label className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative overflow-hidden">'
    );

    // Settings page logo upload:
    // <label className="relative cursor-pointer group">
    // Already has relative!

    // Invoices page:
    // <label className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors text-sm text-gray-500 dark:text-gray-400">
    content = content.replace(
        /<label className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary\/50 hover:bg-primary\/5 cursor-pointer transition-colors text-sm text-gray-500 dark:text-gray-400">/g,
        '<label className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors text-sm text-gray-500 dark:text-gray-400 relative overflow-hidden">'
    );

    // Replace all file inputs that have className="hidden" with the overlay class
    // We'll replace className="hidden" with className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
    // Wait, sometimes it's `<input type="file" accept="image/*" className="hidden"`
    content = content.replace(
        /className="hidden"\s*onChange/g,
        'className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" onChange'
    );
    
    // For pos and products scan button:
    // <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
    content = content.replace(
        /<label className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-primary hover:border-primary hover:bg-primary\/5 cursor-pointer transition-all">/g,
        '<label className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 cursor-pointer transition-all relative overflow-hidden">'
    );

    // Also the add manual option in Scanner Options:
    // <label className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group">
    content = content.replace(
        /<label className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-primary\/5 cursor-pointer transition-all group">/g,
        '<label className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group relative overflow-hidden">'
    );

    fs.writeFileSync(path, content, 'utf8');
}

const files = [
    'src/app/pos/page.tsx',
    'src/app/products/page.tsx',
    'src/app/returns/page.tsx',
    'src/app/settings/page.tsx',
    'src/components/Invoices/CustomInvoicesTab.tsx'
];

files.forEach(fixFile);
console.log('Fixed all file inputs');