const fs = require('fs');
let content = fs.readFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx', 'utf8');

// Add padding to Receipt Footer
content = content.replace(
  'const renderReceiptFooter = () => (\\n    <div>\\n      <div className="text-right',
  'const renderReceiptFooter = () => (\\n    <div style={{ paddingBottom: \\"60px\\" }}>\\n      <div className="text-right'
);

// Add padding to Invoice Footer
content = content.replace(
  'const renderInvoiceFooter = () => (\\n    <div>\\n      <div className="text-center',
  'const renderInvoiceFooter = () => (\\n    <div style={{ paddingBottom: \\"60px\\" }}>\\n      <div className="text-center'
);

fs.writeFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx', content, 'utf8');
