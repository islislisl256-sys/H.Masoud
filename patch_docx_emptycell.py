import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/lib/generateDocx.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix createEmptyCell
pattern = r'const createEmptyCell = \(colSpan: number = 1, rightBorder: boolean = true\) => \{.*?\n    \};'
replacement = '''const createEmptyCell = (colSpan: number = 1, rightBorder: boolean = true) => {
    return new TableCell({
      children: [new Paragraph({ text: "" })],
      columnSpan: colSpan > 1 ? colSpan : undefined,
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: rightBorder ? BorderStyle.SINGLE : BorderStyle.NONE, size: 1 },
      }
    });
  };'''
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed createEmptyCell!")