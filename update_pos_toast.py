import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/pos/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'showSystemToast' not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { showSystemToast } from '@/components/CustomToasts';")

content = content.replace('toast("تم دفع الفاتورة بنجاح!");', 'showSystemToast("عملية بيع ناجحة", "تم دفع الفاتورة وتسجيل البيع بنجاح.", "sale");')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated POS page")