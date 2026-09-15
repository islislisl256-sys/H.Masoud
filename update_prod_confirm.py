import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/products/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure confirmDialog is imported
if 'confirmDialog' not in content:
    content = content.replace('import { showSystemToast } from \'@/components/CustomToasts\';', 'import { showSystemToast, confirmDialog } from \'@/components/CustomToasts\';')

# Replace confirm
pattern = r'if \(confirm\("هل أنت متأكد من حذف هذا المنتج؟"\)\) \{([\s\S]*?fetchProducts\(\);\s*\}\s*catch \(err\) \{\s*toast\.error\("حدث خطأ أثناء الحذف"\);\s*\}\s*)\}'
replacement = r'confirmDialog("تأكيد الحذف", "هل أنت متأكد من حذف هذا المنتج؟", async () => {\1});'
content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated products page confirm")