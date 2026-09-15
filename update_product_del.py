import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/products/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace generic toast with delete toast
content = content.replace('toast.success("تم حذف المنتج بنجاح");', 'showSystemToast("تم الحذف", "تم حذف المنتج بنجاح.", "delete");')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated product delete toast")