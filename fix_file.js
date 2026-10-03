const fs = require('fs');

function fixFile(file) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if the file has the absolute input missing relative on parent label
    // The class starts with "flex items-center justify-center gap-2 w-full py-3"
    
    // We can just add 'relative' to the label if it's missing.
    content = content.replace(
      /<label className="flex items-center/g,
      '<label className="relative flex items-center'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + file);
  }
}

fixFile('src/app/settings/page.tsx');
fixFile('src/components/Invoices/CustomInvoicesTab.tsx');