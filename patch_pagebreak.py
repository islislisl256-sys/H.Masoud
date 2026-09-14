import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix html2pdf pagebreak options
content = content.replace(
    "pagebreak:    { mode: ['avoid-all', 'css', 'legacy'], avoid: 'tr' },",
    "pagebreak:    { mode: ['css', 'legacy'] },"
)
# Also remove avoid: 'tr' entirely if it still causes jumps, but usually 'tr' is fine. Let's just use mode: ['css']

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed pagebreak in PDF options!")