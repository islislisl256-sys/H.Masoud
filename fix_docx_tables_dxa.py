import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/lib/generateDocx.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add WidthType and TableLayoutType to imports if missing
if 'TableLayoutType' not in content:
    content = content.replace("WidthType, AlignmentType", "WidthType, AlignmentType, TableLayoutType")

# Replace Table definitions to use DXA and columnWidths
pattern = r'const receiptTable = new Table\(\{.*?rows: \['
replacement = '''const receiptTable = new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [1800, 1800, 900, 4050, 450],
    layout: TableLayoutType.FIXED,
    rows: ['''
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

pattern = r'const invoiceTable = new Table\(\{.*?rows: \['
replacement = '''const invoiceTable = new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [1350, 1350, 900, 900, 4050, 450],
    layout: TableLayoutType.FIXED,
    rows: ['''
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Fix Footer Tables
pattern = r'new Table\(\{\s*width: \{ size: 100, type: WidthType\.PERCENTAGE \},\s*borders: \{\s*top: \{ style: BorderStyle\.NONE \}'
replacement = '''new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [4500, 4500],
        layout: TableLayoutType.FIXED,
        borders: {
          top: { style: BorderStyle.NONE }'''
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Fix Store Top Box
pattern = r'new Table\(\{\s*width: \{ size: 100, type: WidthType\.PERCENTAGE \},\s*rows: \['
replacement = '''new Table({
      width: { size: 9000, type: WidthType.DXA },
      columnWidths: [9000],
      layout: TableLayoutType.FIXED,
      rows: ['''
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Fix Client Boxes
pattern = r'new Table\(\{\s*width: \{ size: 3500, type: WidthType\.DXA \},\s*alignment: AlignmentType\.RIGHT,\s*rows: \['
replacement = '''new Table({
      width: { size: 3500, type: WidthType.DXA },
      columnWidths: [3500],
      layout: TableLayoutType.FIXED,
      alignment: AlignmentType.RIGHT,
      rows: ['''
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated table widths to use DXA and columnWidths!")