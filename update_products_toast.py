import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/products/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'showSystemToast' not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { showSystemToast } from '@/components/CustomToasts';")

# Replace standard toasts
# Adding product: toast.success("تم إضافة المنتج بنجاح");
content = content.replace('toast.success("تم إضافة المنتج بنجاح");', 'showSystemToast("تمت الإضافة", "تم إضافة المنتج إلى المخزون بنجاح.", "add");')
# Updating product: toast.success("تم تحديث المنتج بنجاح");
content = content.replace('toast.success("تم تحديث المنتج بنجاح");', 'showSystemToast("تحديث بيانات", "تم تحديث بيانات المنتج بنجاح.", "edit_user");')
# Deleting product: toast.success("تم حذف المنتج بنجاح");
content = content.replace('toast.success("تم حذف المنتج بنجاح");', 'toast.success("تم حذف المنتج بنجاح");') # standard is fine for delete, or use 'edit_user'

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated products page")