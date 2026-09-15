import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any Arabic date labels before {receipt_date}
# We match things like "التاريخ: {receipt_date}" or "التاريخ : {receipt_date}"
pattern = r'(التاريخ\s*:\s*)\{receipt_date\}'
replacement = r'{receipt_date}'
content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated InvoicePrintLayout date strings!")