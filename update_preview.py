import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update import
content = content.replace('import { showProductToast, showPermissionToast }', 'import { showSystemToast, showPermissionToast }')

# Replace preview body
preview_effect = """  useEffect(() => {
    // ----------------------------------------------------------------------
    // PREVIEW NOTIFICATIONS (Requested by user for styling preview)
    // ----------------------------------------------------------------------
    const timer = setTimeout(() => {
      showSystemToast("تم إضافة المنتج", "تم إضافة 'كتاب الرياضيات' إلى المخزون بنجاح.", "add");
      
      setTimeout(() => {
        showSystemToast("عملية بيع ناجحة", "تم بيع 'قلم رصاص' وإضافته للفاتورة.", "sale");
      }, 1000);
      
      setTimeout(() => {
        showSystemToast("تحديث بيانات", "تم تغيير معلومات المستخدم بنجاح.", "edit_user");
      }, 2000);

      setTimeout(() => {
        showSystemToast("تمت الإضافة", "تم استخراج فاتورة مخصصة بنجاح.", "invoice");
      }, 3000);
      
      setTimeout(() => {
        showSystemToast("قاعدة البيانات", "تم ربط قاعدة البيانات الخاصة بالصور بنجاح.", "db");
      }, 4000);

      setTimeout(() => {
        // Only show if permissions are NOT granted (preview mode: we just show it to test)
        if (typeof window !== 'undefined' && Notification.permission !== 'granted') {
          showPermissionToast();
        } else {
          // Force show for styling preview as requested by user
          showPermissionToast();
        }
      }, 5000);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);
"""

# Replace the old useEffect
pattern = r'  useEffect\(\(\) => \{\n    // -{70}\n    // PREVIEW NOTIFICATIONS.*?\n  \}, \[\]\);\n'
content = re.sub(pattern, preview_effect, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated page.tsx preview")