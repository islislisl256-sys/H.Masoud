import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'showSystemToast' not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { showSystemToast } from '@/components/CustomToasts';")

content = content.replace('toast.success("تم حفظ البيانات بنجاح!");', 'showSystemToast("تحديث بيانات", "تم حفظ معلومات الحساب والمتجر بنجاح.", "edit_user");')
content = content.replace('toast.success("تم رفع الشعار بنجاح");', 'showSystemToast("تحديث بيانات", "تم رفع الشعار بنجاح.", "edit_user");')
content = content.replace('toast.success("تم ضبط إعدادات Cloudinary بنجاح!");', 'showSystemToast("قاعدة البيانات", "تم ربط قاعدة البيانات الخاصة بالصور بنجاح.", "db");')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated settings page")