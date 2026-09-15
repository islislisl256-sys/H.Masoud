import re
path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/invoices/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'showSystemToast' not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { showSystemToast } from '@/components/CustomToasts';")

# toast("حدث خطأ ما") might be there. Let's replace generic toast with showSystemToast
content = content.replace('toast("حدث خطأ ما");', 'showSystemToast("خطأ", "حدث خطأ أثناء حذف الفاتورة.", "error");')
# wait, my previous search found `toast("حدث خطأ ما")`?
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)