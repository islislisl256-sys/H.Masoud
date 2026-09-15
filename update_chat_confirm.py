import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/chat/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'confirmDialog' not in content:
    content = re.sub(r'^(import.*?)$', r'\1\nimport { confirmDialog, showSystemToast } from "@/components/CustomToasts";', content, count=1, flags=re.MULTILINE)

pattern = r'if \(confirm\("هل أنت متأكد من مسح هذه الرسالة؟"\)\) \{([\s\S]*?toast\.error\("حدث خطأ"\);\s*\}\s*)\}'
replacement = r'confirmDialog("مسح الرسالة", "هل أنت متأكد من مسح هذه الرسالة؟", async () => {\1});'
content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated chat confirm")