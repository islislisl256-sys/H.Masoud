const fs = require('fs');

function fixFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // In products/page.tsx:
    // <label className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors w-full text-xs">
    content = content.replace(
        /<label className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors w-full text-xs">/g,
        '<label className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors w-full text-xs relative overflow-hidden">'
    );

    // In pos/page.tsx:
    content = content.replace(
        /<label className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors text-right w-full text-xs">/g,
        '<label className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors text-right w-full text-xs relative overflow-hidden">'
    );

    // In returns/page.tsx:
    content = content.replace(
        /<label className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors text-right w-full text-xs">/g,
        '<label className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors text-right w-full text-xs relative overflow-hidden">'
    );

    fs.writeFileSync(path, content, 'utf8');
}

const files = [
    'src/app/pos/page.tsx',
    'src/app/products/page.tsx',
    'src/app/returns/page.tsx'
];

files.forEach(fixFile);
console.log('Fixed floating label issues');