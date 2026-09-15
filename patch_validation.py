import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add validation check
pattern = r'(if \(!payload\.client_name\) \{ alert\(".*?"\); return; \})'
replacement = '''\\1
    
    if (!payload.store_name || !payload.store_activity || !payload.store_rc || !payload.store_nif || !payload.store_art) {
      alert("لا يمكن إنشاء الفاتورة: يجب ملء جميع المعلومات الأساسية للمتجر (اسم المتجر، النشاط، RC، NIF، ART)");
      return;
    }'''

content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added validation check to CustomInvoicesTab!")