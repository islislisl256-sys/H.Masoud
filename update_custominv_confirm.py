import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'confirmDialog' not in content:
    content = content.replace('import { showSystemToast } from \'@/components/CustomToasts\';', 'import { showSystemToast, confirmDialog } from \'@/components/CustomToasts\';')

pattern1 = r'if \(confirm\("هل تريد تفريغ كل المنتجات الحالية لإنشاء فاتورة جديدة فارغة؟"\)\) \{([\s\S]*?setReceiptDate\(new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\]\);\s*)\}'
replacement1 = r'confirmDialog("فاتورة جديدة", "هل تريد تفريغ كل المنتجات الحالية لإنشاء فاتورة جديدة فارغة؟", () => {\1});'
content = re.sub(pattern1, replacement1, content)

pattern2 = r'if \(confirm\("تفريغ الجدول؟"\)\) \{([\s\S]*?setInvoiceItems\(\[\]\);\s*)\}'
replacement2 = r'confirmDialog("تفريغ الجدول", "هل أنت متأكد من تفريغ الجدول؟", () => {\1});'
content = re.sub(pattern2, replacement2, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated custom invoices confirm")