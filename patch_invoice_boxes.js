const fs = require('fs');
const path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix Receipt Client Box (الوثيقة الأولى)
content = content.replace(
  /const renderReceiptClientAndTitle = \(\) => \([\s\S]*?<div className="text-lg mb-1">الزبون: \{client_name\}<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<div className="text-center font-bold text-lg mb-1">/,
  \const renderReceiptClientAndTitle = () => (
    <div className="mb-2">
      <div className="text-right mb-4">
        <div style={{ border: '1px solid #000000', padding: '10px', display: 'inline-block', minWidth: '350px', textAlign: 'right', fontWeight: 'bold' }}>
          <div className="text-lg mb-1">الزبون: {client_name}</div>
          <div>س.ت: {client_rc || ""}</div>
          <div>الرقم الجبائي: {client_mf || ""}</div>
          <div>رقم المادة: {client_art || ""}</div>
        </div>
      </div>
      <div className="text-center font-bold text-lg mb-1">\
);

// Fix Invoice Client Box (الوثيقة الثانية - الفاتورة) & Fix Margin mb-6 -> mb-2
content = content.replace(
  /const renderInvoiceClientAndTitle = \(\) => \(\s*<div className="mb-6">\s*<div className="text-right mb-4">\s*<div style=\{\{ border: '1px solid #000000', padding: '10px', display: 'inline-block', minWidth: '350px', textAlign: 'right', fontWeight: 'bold' \}\}>\s*<div className="text-xl mb-1">في ذمة \{client_name\}<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<div className="text-center font-bold text-lg mb-1">/,
  \const renderInvoiceClientAndTitle = () => (
    <div className="mb-2">
      <div className="text-right mb-4">
        <div style={{ border: '1px solid #000000', padding: '10px', display: 'inline-block', minWidth: '350px', textAlign: 'right', fontWeight: 'bold' }}>
          <div className="text-xl mb-1">في ذمة {client_name}</div>
          <div>س.ت: {client_rc || ""}</div>
          <div>الرقم الجبائي: {client_mf || ""}</div>
          <div>رقم المادة: {client_art || ""}</div>
        </div>
      </div>
      
      <div className="text-center font-bold text-lg mb-1">\
);

// Fix Footer Word المورد -> الممون in renderInvoiceFooter
content = content.replace(
  /const renderInvoiceFooter = \(\) => \([\s\S]*?<div className="text-left font-bold text-xl ml-20">\s*المورد\s*<\/div>\s*<\/div>\s*\);/,
  \const renderInvoiceFooter = () => (
    <div style={{ paddingBottom: '60px' }}>
      <div className="text-center font-bold text-lg mb-12 px-4">
        أوقفت هذه الفاتورة عند مبلغ: {amount_in_words_arabic}
      </div>
      <div className="text-left font-bold text-xl ml-20">
        الممون
      </div>
    </div>
  );\
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched');
