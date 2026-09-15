import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/lib/generateDocx.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'const receiptTable = new Table\(\{.*?const generateReceiptContent = \(\) => \['
replacement = '''const receiptTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createCell("المجموع", true, AlignmentType.CENTER, 1, 20),
          createCell("سعر الوحدة", true, AlignmentType.CENTER, 1, 20),
          createCell("الكمية", true, AlignmentType.CENTER, 1, 10),
          createCell("التعيين", true, AlignmentType.CENTER, 1, 45),
          createCell("الرقم", true, AlignmentType.CENTER, 1, 5),
        ],
      }),
      ...items.map((item: any) => new TableRow({
        children: [
          createCell(Number(item.item_total_price).toFixed(2).replace('.', ','), false, AlignmentType.CENTER, 1, 20),
          createCell(Number(item.item_unit_price).toFixed(2).replace('.', ','), false, AlignmentType.CENTER, 1, 20),
          createCell(String(item.item_quantity).padStart(2, '0'), false, AlignmentType.CENTER, 1, 10),
          createCell(item.item_designation, false, AlignmentType.RIGHT, 1, 45),
          createCell(String(item.item_index).padStart(2, '0'), false, AlignmentType.CENTER, 1, 5),
        ]
      })),
      new TableRow({
        children: [
          createCell(Number(total_amount_receipt).toFixed(2).replace('.', ','), true, AlignmentType.CENTER, 1, 20),
          createCell("المجموع", true, AlignmentType.CENTER, 1, 20),
          createEmptyCell(3, false),
        ]
      })
    ]
  });

  const invoiceTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createCell("المبلغ المالي", true, AlignmentType.CENTER, 1, 15),
          createCell("س الوحدة", true, AlignmentType.CENTER, 1, 15),
          createCell("الكمية", true, AlignmentType.CENTER, 1, 10),
          createCell("الوحدة", true, AlignmentType.CENTER, 1, 10),
          createCell("التعيين", true, AlignmentType.CENTER, 1, 45),
          createCell("الرقم", true, AlignmentType.CENTER, 1, 5),
        ],
      }),
      ...items.map((item: any) => new TableRow({
        children: [
          createCell(Number(item.item_total_price).toFixed(2).replace('.', ','), false, AlignmentType.CENTER, 1, 15),
          createCell(Number(item.item_unit_price).toFixed(2).replace('.', ','), false, AlignmentType.CENTER, 1, 15),
          createCell(String(item.item_quantity).padStart(2, '0'), false, AlignmentType.CENTER, 1, 10),
          createCell("U", false, AlignmentType.CENTER, 1, 10),
          createCell(item.item_designation, false, AlignmentType.RIGHT, 1, 45),
          createCell(String(item.item_index).padStart(2, '0'), false, AlignmentType.CENTER, 1, 5),
        ]
      })),
      new TableRow({
        children: [
          createCell(Number(total_amount_invoice).toFixed(2).replace('.', ','), true, AlignmentType.CENTER, 1, 15),
          createCell("المبلغ الإجمالي", true, AlignmentType.CENTER, 1, 15),
          createEmptyCell(4, false),
        ]
      }),
      new TableRow({
        children: [
          createCell(Number(tva_amount).toFixed(2).replace('.', ','), true, AlignmentType.CENTER, 1, 15),
          createCell("TVA (19%)", true, AlignmentType.CENTER, 1, 15),
          createEmptyCell(4, false),
        ]
      }),
      new TableRow({
        children: [
          createCell(Number(stamp_duty).toFixed(2).replace('.', ','), true, AlignmentType.CENTER, 1, 15),
          createCell("حق الطابع", true, AlignmentType.CENTER, 1, 15),
          createEmptyCell(4, false),
        ]
      }),
      new TableRow({
        children: [
          createCell(Number(grand_total_invoice).toFixed(2).replace('.', ','), true, AlignmentType.CENTER, 1, 15),
          createCell("المبلغ المستحق", true, AlignmentType.CENTER, 1, 15),
          createEmptyCell(4, false),
        ]
      })
    ]
  });

  const generateReceiptContent = () => ['''
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated tables!")