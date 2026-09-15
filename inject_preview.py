import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_stmt = "import { showProductToast, showPermissionToast } from '@/components/CustomToasts';\n"
if 'CustomToasts' not in content:
    content = content.replace('import ProtectedLayout from "@/components/Layout/ProtectedLayout";', 'import ProtectedLayout from "@/components/Layout/ProtectedLayout";\n' + import_stmt)

# Add preview useEffect
preview_effect = """  useEffect(() => {
    // ----------------------------------------------------------------------
    // PREVIEW NOTIFICATIONS (Requested by user for styling preview)
    // ----------------------------------------------------------------------
    const timer = setTimeout(() => {
      showProductToast("تم إضافة المنتج", "تم إضافة 'كتاب الرياضيات' إلى المخزون بنجاح.", "add");
      
      setTimeout(() => {
        showProductToast("عملية بيع ناجحة", "تم بيع 'قلم رصاص' وإضافته للفاتورة.", "sale");
      }, 1000);

      setTimeout(() => {
        showPermissionToast();
      }, 2000);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);
"""

if 'PREVIEW NOTIFICATIONS' not in content:
    # insert before return (
    content = content.replace('return (', preview_effect + '\n  return (')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected preview in page.tsx")