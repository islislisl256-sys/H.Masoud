const fs = require('fs');

function fixInputs(file) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add text-gray-900 to any input/textarea that has dark:text-white but no text-gray-something
    content = content.replace(/<input([^>]+)className="([^"]+)"/g, (match, p1, p2) => {
      if (!p2.includes('text-gray-') && !p2.includes('text-black')) {
        return `<input${p1}className="${p2} text-gray-900"`;
      }
      return match;
    });

    content = content.replace(/<textarea([^>]+)className="([^"]+)"/g, (match, p1, p2) => {
      if (!p2.includes('text-gray-') && !p2.includes('text-black')) {
        return `<textarea${p1}className="${p2} text-gray-900"`;
      }
      return match;
    });
    
    // Also find buttons with bg-white but no text-gray-something
    content = content.replace(/<button([^>]+)className="([^"]+)"/g, (match, p1, p2) => {
      if (p2.includes('bg-white') && !p2.includes('text-gray-') && !p2.includes('text-black') && !p2.includes('text-primary') && !p2.includes('text-red') && !p2.includes('text-blue') && !p2.includes('text-green') && !p2.includes('text-purple')) {
        return `<button${p1}className="${p2} text-gray-900"`;
      }
      return match;
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed inputs/buttons in ' + file);
  }
}

fixInputs('src/components/Invoices/CustomInvoicesTab.tsx');
fixInputs('src/app/pos/page.tsx');
fixInputs('src/app/invoices/page.tsx');
fixInputs('src/components/Invoices/InvoicePrintLayout.tsx');
