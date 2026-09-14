import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix receipt spacing
content = content.replace(
    '<div className="mb-1">\n      <div className="text-right mb-4">',
    '<div className="mb-0">\n      <div className="text-right mb-4">'
)
content = content.replace(
    '<div className="text-center font-bold text-2xl mb-1">\n        وصل تسليم رقم {invoice_number}\n      </div>',
    '<div className="text-center font-bold text-2xl mb-0 leading-none">\n        وصل تسليم رقم {invoice_number}\n      </div>'
)

# 2. Fix invoice spacing
content = content.replace(
    '<div className="text-center font-bold text-2xl mb-0">\n        فاتورة رقم {invoice_number}\n      </div>',
    '<div className="text-center font-bold text-2xl mb-0 leading-none">\n        فاتورة رقم {invoice_number}\n      </div>'
)

# Also let's tighten the date space above the title, if it's contributing to the feeling of separation.
content = content.replace(
    '<div className="text-center font-bold text-lg mb-0">\n        التاريخ: {receipt_date}\n      </div>',
    '<div className="text-center font-bold text-lg mb-0 leading-none">\n        التاريخ: {receipt_date}\n      </div>'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Tightened spacing!")