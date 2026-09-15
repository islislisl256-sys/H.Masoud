import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Invoice footer string in PDF is:
# <div className="text-center font-bold text-lg mb-12 px-4">
#   أوقفت هذه الفاتورة عند مبلغ: {amount_in_words_arabic}
# </div>
invoice_footer2_pattern = r'(<div className="text-center font-bold text-lg mb-12 px-4">)\s*أوقفت هذه الفاتورة عند مبلغ: \{amount_in_words_arabic\}\s*(</div>)'
invoice_footer2_repl = r'\1\n          أوقفت هذه الفاتورة عند مبلغ: {amount_in_words_arabic}\n          {seller_name && <div className="text-sm mt-2 text-gray-600">البائع: {seller_name}</div>}\n        \2'
content = re.sub(invoice_footer2_pattern, invoice_footer2_repl, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated InvoicePrintLayout with seller_name for invoice")