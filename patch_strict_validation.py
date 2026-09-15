import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the simple truthy check with a robust trim check
pattern = r'if \(!payload\.store_name \|\| !payload\.store_activity \|\| !payload\.store_rc \|\| !payload\.store_nif \|\| !payload\.store_art\) \{\s*alert\(".*?"\);\s*return;\s*\}'
replacement = '''const isInvalid = (val: any) => !val || (typeof val === 'string' && val.trim() === '');
    if (isInvalid(payload.store_name) || isInvalid(payload.store_activity) || isInvalid(payload.store_rc) || isInvalid(payload.store_nif) || isInvalid(payload.store_art)) {
      alert("لا يمكن إنشاء الفاتورة: يجب ملء جميع المعلومات الأساسية للمتجر (اسم المتجر، النشاط، RC، NIF، ART) ولا يمكن تركها فراغاً.");
      return;
    }'''

content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated strict validation!")