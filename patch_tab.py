import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pass pagesToPrint
content = content.replace(
    '<InvoicePrintLayout payload={buildPayload()} />',
    '<InvoicePrintLayout payload={buildPayload()} pagesToPrint={pagesToPrint} />'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Tab!")