const fs = require('fs');

function fix(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  if (file.includes('CustomInvoicesTab')) {
    c = c.replace('<div className="flex flex-col lg:flex-row gap-6">', '<div className="flex flex-col lg:flex-row gap-6 bg-white dark:bg-gray-900 p-6 rounded-xl w-full">');
  }

  // Force bg-white text-black on all inputs/textareas without a bg- class
  c = c.replace(/className="([^"]+)"/g, (match, p1) => {
    if (p1.includes('border') && p1.includes('dark:border-gray-600')) {
      let newClass = p1;
      if (!newClass.includes('bg-white') && !newClass.includes('bg-gray-100') && !newClass.includes('bg-gray-50')) {
        newClass += ' bg-white';
      }
      newClass = newClass.replace('text-gray-900', 'text-black');
      if (!newClass.includes('text-black')) {
        newClass += ' text-black';
      }
      // Also ensure it doesn't have text-white except dark:text-white
      const parts = newClass.split(' ').filter(p => p !== 'text-white' || p === 'dark:text-white');
      return `className="${parts.join(' ')}"`;
    }
    return match;
  });

  fs.writeFileSync(file, c, 'utf8');
  console.log('Fixed ' + file);
}

fix('src/components/Invoices/CustomInvoicesTab.tsx');
fix('src/app/pos/page.tsx');
fix('src/app/invoices/page.tsx');
fix('src/app/products/page.tsx');