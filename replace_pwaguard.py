import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Layout/PwaGuard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'showSystemToast' not in content:
    content = re.sub(r'^(import.*?)$', r'\1\nimport { showSystemToast } from "@/components/CustomToasts";', content, count=1, flags=re.MULTILINE)

content = re.sub(r'alert\(".*?"\);', 'showSystemToast("تنبيه", "تطبيقك يعمل بالفعل في وضع ملء الشاشة.", "warning");', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced PwaGuard alert")