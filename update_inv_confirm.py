import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/invoices/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'confirmDialog' not in content:
    content = content.replace('import { showSystemToast } from \'@/components/CustomToasts\';', 'import { showSystemToast, confirmDialog } from \'@/components/CustomToasts\';')

pattern = r'if \(confirm\("هل تريد حذف هذه الفاتورة؟"\)\) \{([\s\S]*?else \{ showSystemToast\("خطأ", "حدث خطأ ما", "error"\); \}\s*)\}'
replacement = r'confirmDialog("حذف الفاتورة", "هل أنت متأكد من حذف هذه الفاتورة؟", async () => {\1});'
content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated invoices page confirm")