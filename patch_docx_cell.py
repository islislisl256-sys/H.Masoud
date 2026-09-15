import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/lib/generateDocx.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update createCell to accept width
pattern = r'const createCell = \(text: string, bold: boolean = false, align: any = AlignmentType\.CENTER\) => \{'
replacement = '''const createCell = (text: string, bold: boolean = false, align: any = AlignmentType.CENTER, colSpan: number = 1, widthPercent?: number) => {'''
content = re.sub(pattern, replacement, content)

pattern = r'return new TableCell\(\{'
replacement = '''const cellProps: any = {
      children: [new Paragraph({ children: [new TextRun({ text, bold, rightToLeft: true, font: "Arial" })], alignment: align })],
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      }
    };
    if (colSpan > 1) cellProps.columnSpan = colSpan;
    if (widthPercent) cellProps.width = { size: widthPercent, type: WidthType.PERCENTAGE };
    return new TableCell(cellProps);'''
# We need to correctly replace the TableCell block inside createCell
content = re.sub(r'return new TableCell\(\{.*?\}\);', replacement, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated createCell signature in generateDocx.ts!")