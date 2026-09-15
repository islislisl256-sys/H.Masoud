import re

def process_file(filepath, pattern, replacement):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'confirmDialog' not in content:
        if 'showSystemToast' in content:
            content = content.replace("import { showSystemToast }", "import { showSystemToast, confirmDialog }")
        else:
            content = re.sub(r'^(import.*?)$', r'\1\nimport { confirmDialog, showSystemToast } from "@/components/CustomToasts";', content, count=1, flags=re.MULTILINE)

    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'

# Products
process_file(base + 'app/products/page.tsx', 
             r'if \(confirm\(".*?"\)\) \{([\s\S]*?fetchProducts\(\);\s*\}\s*catch \(err\) \{\s*toast\.error\(".*?"\);\s*\}\s*)\}', 
             r'confirmDialog("تأكيد الحذف", "هل أنت متأكد من مسح هذا العنصر؟ لا يمكن التراجع.", async () => {\1});')

# Invoices
process_file(base + 'app/invoices/page.tsx', 
             r'if \(confirm\(".*?"\)\) \{([\s\S]*?else \{ showSystemToast\(".*?", ".*?", ".*?"\); \}\s*)\}', 
             r'confirmDialog("حذف الفاتورة", "هل أنت متأكد من حذف هذه الفاتورة؟", async () => {\1});')

# CustomInvoices
process_file(base + 'components/Invoices/CustomInvoicesTab.tsx', 
             r'if \(confirm\("هل تريد تفريغ كل المنتجات الحالية لإنشاء فاتورة جديدة فارغة؟"\)\) \{', 
             r'confirmDialog("فاتورة جديدة", "هل تريد تفريغ كل المنتجات الحالية لإنشاء فاتورة جديدة فارغة؟", () => {')

process_file(base + 'components/Invoices/CustomInvoicesTab.tsx', 
             r'if \(confirm\("تفريغ الجدول؟"\)\) \{([\s\S]*?setInvoiceItems\(\[\]\);\s*)\}', 
             r'confirmDialog("تفريغ الجدول", "هل أنت متأكد من تفريغ الجدول؟", () => {\1});')

# Chat
process_file(base + 'app/chat/page.tsx', 
             r'if \(confirm\(".*?"\)\) \{([\s\S]*?toast\.error\(".*?"\);\s*\}\s*)\}', 
             r'confirmDialog("مسح الرسالة", "هل أنت متأكد من مسح هذه الرسالة؟", async () => {\1});')

# Cloud stats
process_file(base + 'app/cloud-stats/page.tsx', 
             r'if \(!confirm\(".*?"\)\) return;\n\s*setDeletingId\(public_id\);\n\s*try \{([\s\S]*?)setDeletingId\(null\);\n\s*\}', 
             r'''confirmDialog("تأكيد الحذف", "هل أنت متأكد من مسح هذه الصورة سحابياً؟", async () => {
    setDeletingId(public_id);
    try {\1setDeletingId(null);
    }
  });''')

# Modals
process_file(base + 'components/Modals/CloudinarySetupModal.tsx', 
             r'if \(!confirm\(".*?"\)\) return;\n\s*localStorage\.removeItem([\s\S]*?)onClose\(\);\n\s*\}', 
             r'''confirmDialog("تأكيد مسح الإعدادات", "هل أنت متأكد من مسح جميع إعدادات التخزين السحابي؟", () => {
      localStorage.removeItem\1onClose();
    });
  }''')

print("Replaced all confirm() calls")