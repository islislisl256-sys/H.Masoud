import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Modals/CloudinarySetupModal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'confirmDialog' not in content:
    content = content.replace('import { showSystemToast } from "@/components/CustomToasts";', 'import { showSystemToast, confirmDialog } from "@/components/CustomToasts";')

pattern = r'if \(!confirm\("هل أنت متأكد من مسح جميع إعدادات التخزين السحابي؟"\)\) return;\n\s*localStorage\.removeItem([\s\S]*?)onClose\(\);\n\s*\}'
repl = r'''confirmDialog("تأكيد مسح الإعدادات", "هل أنت متأكد من مسح جميع إعدادات التخزين السحابي؟", () => {
      localStorage.removeItem\1onClose();
    });
  }'''
content = re.sub(pattern, repl, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated cloudinary modal confirm")