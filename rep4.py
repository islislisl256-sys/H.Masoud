path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 'if (confirm(' in line and 'setClientName("");' in lines[i+2]:
        new_lines.append('    confirmDialog("فاتورة جديدة", "هل تريد تفريغ كل المنتجات الحالية لإنشاء فاتورة جديدة فارغة؟", () => {\n')
    elif 'setReceiptDate' in line and '}' in lines[i+1] and 'if (confirm(' not in line:
        new_lines.append(line)
        new_lines.append('    });\n')
        lines[i+1] = '' # skip the closing brace
    elif 'if (confirm(' in line and 'setInvoiceItems([]);' in lines[i+1] and '}' in lines[i+2]:
        new_lines.append('    confirmDialog("تفريغ الجدول", "هل أنت متأكد من تفريغ الجدول؟", () => {\n')
        new_lines.append(lines[i+1])
        new_lines.append('    });\n')
        lines[i+1] = ''
        lines[i+2] = ''
    elif line != '':
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

path2 = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Modals/CloudinarySetupModal.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    lines2 = f.readlines()
new_lines2 = []
for i, line in enumerate(lines2):
    if 'if (!confirm(' in line and 'localStorage.removeItem' in lines2[i+1]:
        new_lines2.append('    confirmDialog("مسح الإعدادات", "هل أنت متأكد من مسح جميع إعدادات التخزين السحابي؟", () => {\n')
    elif 'onClose();' in line and '}' in lines2[i+1]:
        new_lines2.append(line)
        new_lines2.append('    });\n')
        # skip the closing brace
        # wait, we didn't remove the closing brace. But there is a closing brace for `handleClearSettings`.
    elif line != '':
        new_lines2.append(line)
with open(path2, 'w', encoding='utf-8') as f:
    f.writelines(new_lines2)
print("Done index replace")