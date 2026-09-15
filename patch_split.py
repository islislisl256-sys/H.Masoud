import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the receipt header splitting
content = re.sub(
    r'<p>\s*\{store_rc && `RC : \$\{store_rc\} - `\}\s*\{store_mf && `MF: \$\{store_mf\} - `\}\s*\{store_art && `ART: \$\{store_art\} - `\}\s*\{store_nif && `NIF: \$\{store_nif\}`\}\s*</p>',
    '''<p>
        {store_rc && `RC : ${store_rc}`} {store_rc && store_mf && ' - '} {store_mf && `MF: ${store_mf}`}
      </p>
      <p>
        {store_art && `ART: ${store_art}`} {store_art && store_nif && ' - '} {store_nif && `NIF: ${store_nif}`}
      </p>''',
    content
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated InvoicePrintLayout!")