import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/lib/generateDocx.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the two content generation functions with perfectly matching code
pattern = r'const generateReceiptContent = \(\) => \[\n.*?\];\n\n  const generateInvoiceContent = \(\) => \[\n.*?\];'
replacement = '''const generateReceiptContent = () => {
    const rcMfLine = `${store_rc ? `RC : ${store_rc}` : ''}${store_rc && store_mf ? ' - ' : ''}${store_mf ? `MF: ${store_mf}` : ''}`;
    const artNifLine = `${store_art ? `ART: ${store_art}` : ''}${store_art && store_nif ? ' - ' : ''}${store_nif ? `NIF: ${store_nif}` : ''}`;

    return [
      new Paragraph({ children: [new TextRun({ text: store_name, bold: true, size: 36, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
      new Paragraph({ children: [new TextRun({ text: store_activity, size: 24, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
      ...(store_address ? [new Paragraph({ children: [new TextRun({ text: store_address, size: 24, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } })] : []),
      ...((store_ccp_1 || store_ccp_2) ? [new Paragraph({ children: [new TextRun({ text: `Compte CCP : ${store_ccp_1} ${store_ccp_2 ? `clé ${store_ccp_2}` : ''}`, size: 24, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } })] : []),
      ...(rcMfLine ? [new Paragraph({ children: [new TextRun({ text: rcMfLine, size: 24, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 50 } })] : []),
      ...(artNifLine ? [new Paragraph({ children: [new TextRun({ text: artNifLine, size: 24, font: "Arial" })], alignment: AlignmentType.CENTER })] : []),
      new Paragraph({ text: "", spacing: { after: 400 } }),
      
      // Client Box aligned right
      new Table({
        width: { size: 3500, type: WidthType.DXA },
        alignment: AlignmentType.RIGHT,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: `الزبون: ${client_name}`, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),
                  ...(store_rc ? [new Paragraph({ children: [new TextRun({ text: `س.ت: ${store_rc}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
                  ...(store_nif ? [new Paragraph({ children: [new TextRun({ text: `الرقم الجبائي: ${store_nif}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
                  ...(store_art ? [new Paragraph({ children: [new TextRun({ text: `رقم المادة: ${store_art}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
                ],
                margins: { top: 150, bottom: 150, left: 150, right: 150 },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                }
              })
            ]
          })
        ]
      }),
      
      new Paragraph({ text: "", spacing: { after: 200 } }),
      new Paragraph({ children: [new TextRun({ text: receipt_date, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
      new Paragraph({ children: [new TextRun({ text: `وصل استلام رقم ${invoice_number}`, bold: true, size: 36, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "", spacing: { after: 400 } }),
      
      receiptTable,
      
      new Paragraph({ text: "", spacing: { after: 400 } }),
      new Paragraph({ children: [new TextRun({ text: receipt_date, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "المستلم", bold: true, size: 32, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.LEFT })],
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "الممون", bold: true, size: 32, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })],
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
              })
            ]
          })
        ]
      })
    ];
  };

  const generateInvoiceContent = () => [
    // Top Box (Store info)
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: store_name, bold: true, size: 40, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: store_activity, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: store_address, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER }),
              ],
              margins: { top: 150, bottom: 150, left: 150, right: 150 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              }
            })
          ]
        })
      ]
    }),
    
    new Paragraph({ text: "", spacing: { after: 200 } }),
    // Right Details (now aligned Left but RTL text conceptually, so we just align right to look natural)
    ...(store_rc ? [new Paragraph({ children: [new TextRun({ text: `RC : ${store_rc}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...(store_art ? [new Paragraph({ children: [new TextRun({ text: `ART : ${store_art}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...(store_mf ? [new Paragraph({ children: [new TextRun({ text: `MF : ${store_mf}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...((store_ccp_1 || store_ccp_2) ? [new Paragraph({ children: [new TextRun({ text: `CCP : ${store_ccp_1} ${store_ccp_2 ? ` Clé: ${store_ccp_2}` : ''}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...(store_nif ? [new Paragraph({ children: [new TextRun({ text: `NIF : ${store_nif}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    new Paragraph({ text: "", spacing: { after: 400 } }),

    // Client Box
    new Table({
      width: { size: 3500, type: WidthType.DXA },
      alignment: AlignmentType.RIGHT,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: `في ذمة: ${client_name}`, bold: true, size: 32, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),
                ...(store_rc ? [new Paragraph({ children: [new TextRun({ text: `س.ت: ${store_rc}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
                ...(store_nif ? [new Paragraph({ children: [new TextRun({ text: `الرقم الجبائي: ${store_nif}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
                ...(store_art ? [new Paragraph({ children: [new TextRun({ text: `رقم المادة: ${store_art}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
              ],
              margins: { top: 150, bottom: 150, left: 150, right: 150 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              }
            })
          ]
        })
      ]
    }),
    
    new Paragraph({ text: "", spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: receipt_date, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: `فاتورة رقم ${invoice_number}`, bold: true, size: 36, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "", spacing: { after: 400 } }),

    invoiceTable,

    new Paragraph({ text: "", spacing: { after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: receipt_date, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),
    new Paragraph({ text: "", spacing: { after: 200 } }),

    new Paragraph({ children: [new TextRun({ text: `المبلغ الإجمالي بالحروف: ${amount_in_words_arabic}`, bold: true, size: 24, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),
    new Paragraph({ text: "", spacing: { after: 200 } }),
    
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "الزبون", bold: true, size: 32, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.LEFT })],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "الممون", bold: true, size: 32, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            })
          ]
        })
      ]
    })
  ];'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated generateDocx content!")