import re

# products/page.tsx
path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/products/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('if (confirm(', 'confirmDialog("تأكيد", "هل أنت متأكد من تنفيذ هذا الإجراء؟ لا يمكن التراجع.", async () => { /*__CONFIRM__*/ ')
# wait, if I just replace `if (confirm("...")) {` with `confirmDialog("...", "...", async () => {`
# then the closing brace `}` of that `if` statement needs to be `});`

# Instead of fighting regex, let's just write exactly the replace string.
old_str = """  const handleDelete = async (id: string) => {
    if (confirm("هل تريد حذف هذا المنتج؟")) {"""
# wait, what was the text in confirm?