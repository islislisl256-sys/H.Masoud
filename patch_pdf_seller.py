import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add seller_name to destructured payload
content = content.replace('amount_in_words_arabic, store_logo', 'amount_in_words_arabic, store_logo, seller_name')

# Receipt footer
# In PDF: renderReceiptFooter
receipt_footer_pattern = r'(<div className="text-right font-bold text-lg mt-4 pr-4 mb-4">)\s*\{receipt_date\}\s*(</div>)'
receipt_footer_repl = r'\1\n          {receipt_date}\n          {seller_name && <div className="text-sm mt-2 text-gray-600">البائع: {seller_name}</div>}\n        \2'
content = re.sub(receipt_footer_pattern, receipt_footer_repl, content)

# Invoice footer
invoice_footer_pattern = r'(<div className="text-center font-bold text-lg mb-1">)\s*\{receipt_date\}\s*(</div>)'
invoice_footer_repl = r'\1\n          {receipt_date}\n          {seller_name && <div className="text-sm mt-1 text-gray-600">البائع: {seller_name}</div>}\n        \2'
content = re.sub(invoice_footer_pattern, invoice_footer_repl, content)

# Wait, Invoice has a footer at the bottom too?
# renderInvoiceClientAndTitle has date. Let's put seller name next to total_amount_invoice or amount_in_words_arabic
# actually let's just append it to amount_in_words_arabic:
words_pattern = r'(<div className="text-right font-bold text-xl mt-4 mb-8">)\s*المبلغ الإجمالي بالحروف: \{amount_in_words_arabic\}\s*(</div>)'
words_repl = r'\1\n          المبلغ الإجمالي بالحروف: {amount_in_words_arabic}\n          {seller_name && <div className="text-sm mt-2 text-gray-600">البائع: {seller_name}</div>}\n        \2'
content = re.sub(words_pattern, words_repl, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated InvoicePrintLayout with seller_name")