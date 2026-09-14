import re
path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const renderInvoiceClientAndTitle = () => (\n    <div className="mb-1">',
    'const renderInvoiceClientAndTitle = () => (\n    <div className="mb-0">'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched mb-0!")