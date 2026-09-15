import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'alert\(".*?"\);', 'showSystemToast("تنبيه", "يرجى التحقق من البيانات.", "warning");', content)
content = re.sub(r'alert\(`.*?\`\);', 'showSystemToast("خطأ", "حدث خطأ غير متوقع.", "error");', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

path2 = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Modals/CloudinarySetupModal.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'alert\(".*?"\);', 'showSystemToast("تنبيه", "تأكد من إدخال البيانات المطلوبة.", "warning");', content)

with open(path2, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced alerts using regex")