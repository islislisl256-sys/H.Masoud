import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Revert renderReceiptHeader back to English abbreviations
content = re.sub(
    r'<p>\s*\{store_rc && `س\.ت: \$\{store_rc\} - `\}\s*\{store_mf && `MF: \$\{store_mf\} - `\}\s*\{store_art && `رقم المادة: \$\{store_art\} - `\}\s*\{store_nif && `الرقم الجبائي: \$\{store_nif\}`\}\s*</p>',
    '''<p>
        {store_rc && `RC : ${store_rc} - `}
        {store_mf && `MF: ${store_mf} - `}
        {store_art && `ART: ${store_art} - `}
        {store_nif && `NIF: ${store_nif}`}
      </p>''',
    content
)

# 2. Revert renderInvoiceHeader back to English abbreviations
content = re.sub(
    r'<div className="text-left font-bold text-sm" style=\{\{ direction: \'rtl\' \}\}>[\s\S]*?</div>',
    '''<div className="text-left font-bold text-sm" style={{ direction: 'rtl' }}>
        {store_rc && <div>RC : {store_rc}</div>}
        {store_art && <div>ART : {store_art}</div>}
        {store_mf && <div>MF : {store_mf}</div>}
        {(store_ccp_1 || store_ccp_2) && <div>CCP : {store_ccp_1} {store_ccp_2 ? ` Clé: ${store_ccp_2}` : ''}</div>}
        {store_nif && <div>NIF : {store_nif}</div>}
      </div>''',
    content,
    count=1
)

# 3. Update Client Info boxes to use store variables
content = re.sub(
    r'<div className="text-lg mb-1">الزبون: \{client_name\}</div>\s*\{client_rc && <div>س\.ت: \{client_rc\}</div>\}\s*\{client_mf && <div>الرقم الجبائي: \{client_mf\}</div>\}\s*\{client_art && <div>رقم المادة: \{client_art\}</div>\}',
    '''<div className="text-lg mb-1">الزبون: {client_name}</div>
          {store_rc && <div>س.ت: {store_rc}</div>}
          {store_nif && <div>الرقم الجبائي: {store_nif}</div>}
          {store_art && <div>رقم المادة: {store_art}</div>}''',
    content
)

content = re.sub(
    r'<div className="text-xl mb-1">في ذمة \{client_name\}</div>\s*\{client_rc && <div>س\.ت: \{client_rc\}</div>\}\s*\{client_mf && <div>الرقم الجبائي: \{client_mf\}</div>\}\s*\{client_art && <div>رقم المادة: \{client_art\}</div>\}',
    '''<div className="text-xl mb-1">في ذمة {client_name}</div>
          {store_rc && <div>س.ت: {store_rc}</div>}
          {store_nif && <div>الرقم الجبائي: {store_nif}</div>}
          {store_art && <div>رقم المادة: {store_art}</div>}''',
    content
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched completely!")