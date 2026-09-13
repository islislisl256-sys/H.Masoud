import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, PageBreak, Header, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

export const generateInvoiceDocx = async (payload: any, pagesToPrint: 'receipt' | 'invoice' | 'both') => {
  const {
    store_name = "",
    store_activity = "",
    store_address = "",
    store_ccp_1 = "",
    store_ccp_2 = "",
    store_rc = "",
    store_mf = "",
    store_art = "",
    store_nif = "",
    client_name = "",
    client_rc = "",
    client_mf = "",
    client_art = "",
    receipt_date = "",
    invoice_number = "",
    items = [],
    total_amount_receipt = 0,
    total_amount_invoice = 0,
    tva_amount = 0,
    stamp_duty = 0,
    grand_total_invoice = 0,
    amount_in_words_arabic = "",
    store_logo = "" // base64 or url
  } = payload;

  const createCell = (text: string, bold: boolean = false, align: any = AlignmentType.CENTER) => {
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold, rightToLeft: true, font: "Arial" })], alignment: align })],
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      }
    });
  };

  const createEmptyCell = (colSpan: number = 1, rightBorder: boolean = true) => {
    return new TableCell({
      children: [],
      columnSpan: colSpan,
      borders: {
        top: { style: BorderStyle.NIL, size: 0 },
        bottom: { style: BorderStyle.NIL, size: 0 },
        left: { style: BorderStyle.NIL, size: 0 },
        right: { style: rightBorder ? BorderStyle.SINGLE : BorderStyle.NIL, size: rightBorder ? 1 : 0 },
      }
    });
  };

  const receiptTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createCell("المبلغ", true),
          createCell("السعر الفردي", true),
          createCell("الكمية", true),
          createCell("التعيين", true),
          createCell("الرقم", true),
        ],
      }),
      ...items.map((item: any) => new TableRow({
        children: [
          createCell(Number(item.item_total_price).toFixed(2).replace('.', ',')),
          createCell(Number(item.item_unit_price).toFixed(2).replace('.', ',')),
          createCell(String(item.item_quantity).padStart(2, '0')),
          createCell(item.item_designation),
          createCell(String(item.item_index).padStart(2, '0')),
        ]
      })),
      new TableRow({
        children: [
          createCell(Number(total_amount_receipt).toFixed(2).replace('.', ','), true),
          createCell("المجموع", true),
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
          createCell("السعر الكلي", true),
          createCell("سعر الوحدة", true),
          createCell("الكمية", true),
          createCell("الوحدة", true),
          createCell("التعيين", true),
          createCell("الرقم", true),
        ],
      }),
      ...items.map((item: any) => new TableRow({
        children: [
          createCell(Number(item.item_total_price).toFixed(2).replace('.', ',')),
          createCell(Number(item.item_unit_price).toFixed(2).replace('.', ',')),
          createCell(String(item.item_quantity).padStart(2, '0')),
          createCell(item.item_unit),
          createCell(item.item_designation),
          createCell(String(item.item_index).padStart(2, '0')),
        ]
      })),
      new TableRow({
        children: [
          createCell(Number(total_amount_invoice).toFixed(2).replace('.', ','), true),
          createCell("المجموع", true),
          createEmptyCell(4, false),
        ]
      }),
      new TableRow({
        children: [
          createCell(Number(tva_amount).toFixed(2).replace('.', ','), true),
          createCell("الرسم ع القيمة المضافة 19%", true),
          createEmptyCell(4, false),
        ]
      }),
      new TableRow({
        children: [
          createCell(Number(stamp_duty).toFixed(2).replace('.', ','), true),
          createCell("الرسم على الطابع", true),
          createEmptyCell(4, false),
        ]
      }),
      new TableRow({
        children: [
          createCell(Number(grand_total_invoice).toFixed(2).replace('.', ','), true),
          createCell("المجموع الكلي", true),
          createEmptyCell(4, false),
        ]
      })
    ]
  });

  const generateReceiptContent = () => [
    new Paragraph({ children: [new TextRun({ text: store_name, bold: true, size: 36, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: store_activity, size: 24, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
    ...(store_address ? [new Paragraph({ children: [new TextRun({ text: store_address, size: 24, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } })] : []),
    ...((store_ccp_1 || store_ccp_2) ? [new Paragraph({ children: [new TextRun({ text: `Compte CCP : ${store_ccp_1} ${store_ccp_2 ? `clé ${store_ccp_2}` : ''}`, size: 24, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } })] : []),
    new Paragraph({ children: [new TextRun({ text: `${store_rc ? `RC : ${store_rc} - ` : ''}${store_mf ? `MF: ${store_mf} - ` : ''}${store_art ? `ART: ${store_art} - ` : ''}${store_nif ? `NIF: ${store_nif}` : ''}`, size: 24, font: "Arial" })], alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "", spacing: { after: 400 } }),
    
    // Client Box aligned right
    new Table({
      width: { size: 40, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.RIGHT,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: `الزبون: ${client_name}`, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),
                ...(client_rc ? [new Paragraph({ children: [new TextRun({ text: `س.ت: ${client_rc}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
                ...(client_mf ? [new Paragraph({ children: [new TextRun({ text: `الرقم الجبائي: ${client_mf}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
                ...(client_art ? [new Paragraph({ children: [new TextRun({ text: `رقم المادة: ${client_art}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
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
    new Paragraph({ children: [new TextRun({ text: `التاريخ: ${receipt_date}`, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: `وصل الاستلام رقم ${invoice_number}`, bold: true, size: 36, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "", spacing: { after: 400 } }),
    
    receiptTable,
    
    new Paragraph({ text: "", spacing: { after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: `التاريخ: ${receipt_date}`, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),
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
              children: [new Paragraph({ children: [new TextRun({ text: "الممون", bold: true, size: 32, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.LEFT })],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "المستلم", bold: true, size: 32, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            })
          ]
        })
      ]
    })
  ];

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
    // Right Details
    ...(store_rc ? [new Paragraph({ children: [new TextRun({ text: `س.ت.رقم : ${store_rc}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...(store_art ? [new Paragraph({ children: [new TextRun({ text: `رقم المادة : ${store_art}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...(store_mf ? [new Paragraph({ children: [new TextRun({ text: `الرقم الجبائي : ${store_mf}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...((store_ccp_1 || store_ccp_2) ? [new Paragraph({ children: [new TextRun({ text: `CCP : ${store_ccp_1} ${store_ccp_2 ? ` Clé: ${store_ccp_2}` : ''}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...(store_nif ? [new Paragraph({ children: [new TextRun({ text: `NIF : ${store_nif}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    new Paragraph({ text: "", spacing: { after: 400 } }),

    // Client Box
    new Table({
      width: { size: 40, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.RIGHT,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: `في ذمة ${client_name}`, bold: true, size: 32, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),
                ...(client_art ? [new Paragraph({ children: [new TextRun({ text: `رقم المادة: ${client_art}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
                ...(client_mf ? [new Paragraph({ children: [new TextRun({ text: `الرقم الجبائي: ${client_mf}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
                ...(client_rc ? [new Paragraph({ children: [new TextRun({ text: `س.ت.رقم : ${client_rc}`, bold: true, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
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
    
    new Paragraph({ text: "", spacing: { after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: `التاريخ: ${receipt_date}`, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: `فاتورة رقم ${invoice_number}`, bold: true, size: 36, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "", spacing: { after: 400 } }),
    
    invoiceTable,
    
    new Paragraph({ text: "", spacing: { after: 600 } }),
    new Paragraph({ children: [new TextRun({ text: `وقفت هذه الفاتورة عند مبلغ: ${amount_in_words_arabic}`, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
    new Paragraph({ children: [new TextRun({ text: "الممون", bold: true, size: 32, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.LEFT, indent: { left: 700 } })
  ];

  const sections: any[] = [];
  
  let headerContent: any = undefined;
  if (store_logo) {
    try {
      const base64Data = store_logo.split(',')[1];
      if (base64Data) {
        // base64 to Uint8Array safely
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        headerContent = new Header({
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: byteArray,
                  transformation: {
                    width: 300,
                    height: 300,
                  },
                  floating: {
                    horizontalPosition: { offset: 2000000 }, // roughly center
                    verticalPosition: { offset: 3500000 },
                    behindDocument: true,
                  },
                  type: 'png'
                } as any)
              ]
            })
          ]
        });
      }
    } catch (err) {
      console.warn("Failed to generate docx watermark", err);
    }
  }
  
  if (pagesToPrint === 'receipt' || pagesToPrint === 'both') {
    sections.push({
      properties: {},
      headers: headerContent ? { default: headerContent } : undefined,
      children: generateReceiptContent()
    });
  }
  
  if (pagesToPrint === 'invoice' || pagesToPrint === 'both') {
    sections.push({
      properties: {},
      headers: headerContent ? { default: headerContent } : undefined,
      children: generateInvoiceContent()
    });
  }

  const doc = new Document({
    creator: "Library System",
    title: `Invoice ${invoice_number}`,
    sections: sections,
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Invoice_${client_name}_${invoice_number}.docx`);
};
