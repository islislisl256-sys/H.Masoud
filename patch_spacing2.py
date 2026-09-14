import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix receipt titles spacing
content = content.replace(
    '<div className="text-center font-bold text-lg mb-0 leading-none">\n        التاريخ: {receipt_date}\n      </div>\n      <div className="text-center font-bold text-2xl mb-0 leading-none">\n        وصل تسليم رقم {invoice_number}\n      </div>',
    '<div className="text-center font-bold text-lg mb-1">\n        التاريخ: {receipt_date}\n      </div>\n      <div className="text-center font-bold text-2xl mb-4">\n        وصل تسليم رقم {invoice_number}\n      </div>'
)

# Fix invoice titles spacing
content = content.replace(
    '<div className="text-center font-bold text-lg mb-0 leading-none">\n        التاريخ: {receipt_date}\n      </div>\n      <div className="text-center font-bold text-2xl mb-0 leading-none">\n        فاتورة رقم {invoice_number}\n      </div>',
    '<div className="text-center font-bold text-lg mb-1">\n        التاريخ: {receipt_date}\n      </div>\n      <div className="text-center font-bold text-2xl mb-4">\n        فاتورة رقم {invoice_number}\n      </div>'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added controlled mb-4 spacing")