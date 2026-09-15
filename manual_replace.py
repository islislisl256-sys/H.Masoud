import re

def process_file(filepath, replacer):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'confirmDialog' not in content:
        if 'showSystemToast' in content:
            content = content.replace("import { showSystemToast }", "import { showSystemToast, confirmDialog }")
        else:
            content = re.sub(r'^(import.*?)$', r'\1\nimport { confirmDialog, showSystemToast } from "@/components/CustomToasts";', content, count=1, flags=re.MULTILINE)

    content = replacer(content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'

# Products
def prod_repl(c):
    return re.sub(r'if \(confirm\([^)]+\)\) \{([\s\S]*?fetchProducts\(\);\s*\}\s*catch \(err\) \{\s*toast\.error\([^)]+\);\s*\}\s*)\}', 
             r'confirmDialog("تأكيد الحذف", "هل أنت متأكد من مسح هذا المنتج؟", async () => {\1});', c)
process_file(base + 'app/products/page.tsx', prod_repl)

# CustomInvoicesTab
def custom_repl(c):
    c = re.sub(r'if \(confirm\([^)]+\)\) \{([\s\S]*?setReceiptDate\(new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\]\);\s*)\}', 
               r'confirmDialog("فاتورة جديدة", "هل تريد تفريغ كل المنتجات لإنشاء فاتورة فارغة؟", () => {\1});', c)
    c = re.sub(r'if \(confirm\([^)]+\)\) \{([\s\S]*?setInvoiceItems\(\[\]\);\s*)\}', 
               r'confirmDialog("تفريغ الجدول", "هل أنت متأكد من تفريغ الجدول؟", () => {\1});', c)
    return c
process_file(base + 'components/Invoices/CustomInvoicesTab.tsx', custom_repl)

# Modals
def modal_repl(c):
    return re.sub(r'if \(!confirm\([^)]+\)\) return;\n\s*localStorage\.removeItem([\s\S]*?)onClose\(\);\n\s*\}', 
                  r'''confirmDialog("تأكيد مسح الإعدادات", "هل أنت متأكد من مسح جميع إعدادات التخزين السحابي؟", () => {
      localStorage.removeItem\1onClose();
    });
  }''', c)
process_file(base + 'components/Modals/CloudinarySetupModal.tsx', modal_repl)

print("Manual replace")