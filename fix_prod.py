import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/products/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'const handleDelete = async \(id: string\) => \{\n\s*if \(confirm\(".*?"\)\) \{([\s\S]*?fetchProducts\(\);\n\s*\}\n\s*\}\n\s*\};'
repl = r'''const handleDelete = async (id: string) => {
    confirmDialog("تأكيد الحذف", "هل أنت متأكد من مسح هذا المنتج؟", async () => {\1      }
    });
  };'''

content = re.sub(pattern, repl, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done products")