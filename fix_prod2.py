path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/products/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_confirm = False
for i, line in enumerate(lines):
    if 'if (confirm(' in line and 'const product =' in lines[i+1]:
        new_lines.append('    confirmDialog("تأكيد الحذف", "هل أنت متأكد من مسح هذا المنتج؟", async () => {\n')
    elif 'fetchProducts();' in line and lines[i+1].strip() == '}' and lines[i+2].strip() == '}':
        # Need to replace the two closing braces with }); }
        new_lines.append(line)
        new_lines.append('      }\n')
        new_lines.append('    });\n')
        lines[i+1] = '' # skip
        lines[i+2] = '' # skip
    elif line != '':
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Done products logic")