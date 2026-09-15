import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/cloud-stats/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'confirmDialog' not in content:
    content = re.sub(r'^(import.*?)$', r'\1\nimport { confirmDialog, showSystemToast } from "@/components/CustomToasts";', content, count=1, flags=re.MULTILINE)

pattern = r'if \(!confirm\("هل أنت متأكد من مسح هذه الصورة سحابياً؟"\)\) return;\n\s*setDeletingId\(public_id\);\n\s*try \{([\s\S]*?)setDeletingId\(null\);\n\s*\}'
repl = r'''confirmDialog("تأكيد الحذف", "هل أنت متأكد من مسح هذه الصورة سحابياً؟", async () => {
    setDeletingId(public_id);
    try {\1setDeletingId(null);
    }
  });'''
content = re.sub(pattern, repl, content)

# ensure toast instead of alert if any left
content = re.sub(r'alert\((.*?)\);', r'showSystemToast("تنبيه", \1, "warning");', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated cloud-stats confirm")