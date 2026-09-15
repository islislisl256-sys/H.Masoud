import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/invoices/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add success toast to handleDelete
pattern = r'(if \(!error\) fetchInvoices\(\);)'
repl = r'\1 showSystemToast("تم الحذف", "تم حذف الفاتورة بنجاح.", "delete");'
content = re.sub(pattern, repl, content)

# update the error toast
content = re.sub(r'else toast\(".*?"\);', 'else showSystemToast("خطأ", "حدث خطأ ما", "error");', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated invoice delete toast")