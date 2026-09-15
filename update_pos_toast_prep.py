import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/pos/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'showSystemToast' not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { showSystemToast } from '@/components/CustomToasts';")

# Replacing: toast("تم الدفع بنجاح!")
# Actually let's just find `toast("تم دفع الفاتورة بنجاح!")` or similar. Let's see what it says exactly.