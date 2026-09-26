const fs = require('fs');

function fixFile(path, regex, replacement) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
}

// POS page specific fix
fixFile('src/app/pos/page.tsx', 
    /<label className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">/g, 
    '<label className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer relative overflow-hidden">'
);

// Returns page specific fix
fixFile('src/app/returns/page.tsx', 
    /<label className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110" title=".*?">/g, 
    '<label className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 relative overflow-hidden" title="رفع صورة">'
);

console.log('Fixed additional POS and Returns labels');