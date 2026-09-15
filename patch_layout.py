import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Props
content = re.sub(
    r'type InvoicePrintLayoutProps = \{\n  payload: any;\n\};',
    '''type InvoicePrintLayoutProps = {
  payload: any;
  pagesToPrint?: 'receipt' | 'invoice' | 'both';
};''',
    content
)

content = re.sub(
    r'const InvoicePrintLayout = forwardRef<HTMLDivElement, InvoicePrintLayoutProps>\(\(\{ payload \}, ref\) => \{',
    'const InvoicePrintLayout = forwardRef<HTMLDivElement, InvoicePrintLayoutProps>(({ payload, pagesToPrint = \'both\' }, ref) => {',
    content
)

# 2. Remove date from Receipt
content = re.sub(
    r'<div className="text-center font-bold text-lg mb-1">\n\s*التاريخ: \{receipt_date\}\n\s*</div>\n\s*<div className="text-center font-bold text-2xl mb-4">\n\s*وصل تسليم رقم \{invoice_number\}\n\s*</div>',
    '''<div className="text-center font-bold text-2xl mb-4">
        وصل تسليم رقم {invoice_number}
      </div>''',
    content
)

# 3. Apply pagesToPrint logic
content = re.sub(
    r'<div className="w-full" style=\{\{ position: \'relative\', minHeight: \'100vh\', paddingBottom: \'80px\' \}\}>\s*\{store_logo && <div style=\{watermarkStyle\} />\}\s*<div style=\{\{ position: \'relative\', zIndex: 1 \}\}>\s*\{renderReceiptHeader\(\)\}\s*\{renderReceiptClientAndTitle\(\)\}\s*\{renderReceiptTable\(\)\}\s*\{renderReceiptFooter\(\)\}\s*</div>\s*</div>\s*<div className="html2pdf__page-break"></div>\s*\{/\* Page 2: Invoice \(Image 1 Style\) \*/\}\s*<div className="w-full pt-8" style=\{\{ position: \'relative\', minHeight: \'100vh\', paddingBottom: \'80px\' \}\}>\s*\{store_logo && <div style=\{watermarkStyle\} />\}\s*<div style=\{\{ position: \'relative\', zIndex: 1 \}\}>\s*\{renderInvoiceHeader\(\)\}\s*\{renderInvoiceClientAndTitle\(\)\}\s*\{renderInvoiceTable\(\)\}\s*\{renderInvoiceFooter\(\)\}\s*</div>\s*</div>',
    '''{(pagesToPrint === 'both' || pagesToPrint === 'receipt') && (
      <div className="w-full" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>
        {store_logo && <div style={watermarkStyle} />}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {renderReceiptHeader()}
          {renderReceiptClientAndTitle()}
          {renderReceiptTable()}
          {renderReceiptFooter()}
        </div>
      </div>
      )}

      {pagesToPrint === 'both' && <div className="html2pdf__page-break"></div>}

      {(pagesToPrint === 'both' || pagesToPrint === 'invoice') && (
      <div className="w-full pt-8" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>
        {store_logo && <div style={watermarkStyle} />}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {renderInvoiceHeader()}
          {renderInvoiceClientAndTitle()}
          {renderInvoiceTable()}
          {renderInvoiceFooter()}
        </div>
      </div>
      )}''',
    content
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Layout!")