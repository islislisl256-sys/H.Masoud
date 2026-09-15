import re
import os

def process_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # ensure import
    if 'showSystemToast' not in content:
        # Find where to put it
        if 'import toast from' in content:
            content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { showSystemToast } from '@/components/CustomToasts';")
        else:
            # find first import
            content = re.sub(r'^(import.*?)$', r'\1\nimport { showSystemToast } from "@/components/CustomToasts";', content, count=1, flags=re.MULTILINE)

    for old, new in replacements:
        content = content.replace(old, new)
        # Also try regex for more complex cases
        if type(old) != str:
            content = re.sub(old, new, content)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'

# CustomInvoicesTab
process_file(base + 'components/Invoices/CustomInvoicesTab.tsx', [
    ('alert("يرجى ملء البيانات كاملة!");', 'showSystemToast("تنبيه", "يرجى ملء البيانات كاملة!", "warning");'),
    ('alert("الرجاء كتابة اسم الزبون");', 'showSystemToast("تنبيه", "الرجاء كتابة اسم الزبون", "warning");'),
    ('alert("لم يتم إعداد بيانات المؤسسة: يرجى أولاً إدخال واستكمال بيانات المتجر (اسم المتجر، والمعلومات الجبائية RC، NIF، ART) عبر صفحة الإعدادات.");', 'showSystemToast("تنبيه", "يرجى استكمال بيانات المؤسسة في الإعدادات أولاً.", "warning");'),
    (re.compile(r'alert\(`حدث خطأ أثناء إنشاء الفاتورة: \$\{.*?\}\`\);'), 'showSystemToast("خطأ", "حدث خطأ أثناء إنشاء الفاتورة.", "error");')
])

# ProtectedLayout
process_file(base + 'components/Layout/ProtectedLayout.tsx', [
    ('alert("✅ " + res.message);', 'showSystemToast("نجاح", res.message, "db");'),
    ('alert(res.message);', 'showSystemToast("خطأ", res.message, "error");')
])

# PwaGuard
process_file(base + 'components/Layout/PwaGuard.tsx', [
    ('alert("تطبيقك يعمل بالفعل في وضع ملء الشاشة أو كبيئة منفصلة حالياً. جرب التثبيت مباشرة من المتصفح.");', 'showSystemToast("تنبيه", "تطبيقك يعمل بالفعل في بيئة منفصلة.", "warning");')
])

# CloudinarySetupModal
process_file(base + 'components/Modals/CloudinarySetupModal.tsx', [
    ('alert("لم يتم رفع أي صورة.");', 'showSystemToast("تنبيه", "لم يتم رفع أي صورة.", "warning");'),
    ('alert("حدث خطأ مجهول في الرفع");', 'showSystemToast("خطأ", "حدث خطأ مجهول في الرفع.", "error");')
])

print("Replaced all alert() calls with showSystemToast")