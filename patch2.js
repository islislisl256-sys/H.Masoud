const fs = require('fs');
const path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix Receipt Footer
content = content.replace(
  /const renderReceiptFooter = \(\) => \([\s\S]*?<div style=\{\{ paddingBottom: '60px' \}\}>[\s\S]*?المشتري[\s\S]*?المورد[\s\S]*?<\/div>\s*<\/div>\s*\);/,
  \const renderReceiptFooter = () => (
    <div style={{ paddingBottom: '60px' }}>
      <div className="text-right font-bold text-lg mt-4 pr-4 mb-4">
        التاريخ: {receipt_date}
      </div>
      <div className="flex justify-between px-10">
        <div className="text-right font-bold text-xl">
          المستلم
        </div>
        <div className="text-left font-bold text-xl">
          الممون
        </div>
      </div>
    </div>
  );\
);

// Fix Invoice Footer
content = content.replace(
  /const renderInvoiceFooter = \(\) => \([\s\S]*?<div>\s*<div className="text-center font-bold text-lg mb-12 px-4">\s*أوقفت هذه الفاتورة عند مبلغ: \{amount_in_words_arabic\}\s*<\/div>\s*<div className="text-left font-bold text-xl ml-20">\s*المورد\s*<\/div>\s*<\/div>\s*\);/,
  \const renderInvoiceFooter = () => (
    <div style={{ paddingBottom: '60px' }}>
      <div className="text-center font-bold text-lg mb-12 px-4">
        أوقفت هذه الفاتورة عند مبلغ: {amount_in_words_arabic}
      </div>
      <div className="text-left font-bold text-xl ml-20">
        المورد
      </div>
    </div>
  );\
);

// Update page boundaries to avoid text cutoff and add more padding
content = content.replace(
  /<div className="w-full pb-8" style=\{\{ position: 'relative', minHeight: '800px' \}\}>/g,
  '<div className="w-full pb-16" style={{ position: \\'relative\\', minHeight: \\'100vh\\', paddingBottom: \\'80px\\' }}>'
);
content = content.replace(
  /<div className="w-full pt-8" style=\{\{ position: 'relative', minHeight: '800px' \}\}>/g,
  '<div className="w-full pt-8 pb-16" style={{ position: \\'relative\\', minHeight: \\'100vh\\', paddingBottom: \\'80px\\' }}>'
);

fs.writeFileSync(path, content, 'utf8');
