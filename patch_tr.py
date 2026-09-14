import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "pagebreak:    { mode: ['css', 'legacy'] },",
    "pagebreak:    { mode: ['css', 'legacy'], avoid: 'tr' },"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added tr avoid")