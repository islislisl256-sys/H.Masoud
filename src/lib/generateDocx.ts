import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, TableLayoutType, PageBreak, Header, ImageRun } from 'docx';
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
    seller_name = "",
    store_logo = "" // base64 or url
  } = payload;

  const createCell = (text: string, bold: boolean = false, align: any = AlignmentType.CENTER, colSpan: number = 1, widthPercent?: number) => {
    const cellProps: any = {
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
    if (widthPercent) cellProps.width = { size: Math.round((widthPercent / 100) * 9000), type: WidthType.DXA };
    return new TableCell(cellProps);
  };

  const createEmptyCell = (colSpan: number = 1, rightBorder: boolean = true) => {
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
  };

  const receiptTable = new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [1800, 1800, 900, 4050, 450],
    layout: TableLayoutType.FIXED,
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
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [1350, 1350, 900, 900, 4050, 450],
    layout: TableLayoutType.FIXED,
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

  const generateReceiptContent = () => {
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
      columnWidths: [3500],
      layout: TableLayoutType.FIXED,
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
      
      new Paragraph({ children: [new TextRun({ text: `وصل استلام رقم ${invoice_number}`, bold: true, size: 36, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "", spacing: { after: 400 } }),
      
      receiptTable,
      
      new Paragraph({ text: "", spacing: { after: 400 } }),
      
      ...(seller_name ? [new Paragraph({ children: [new TextRun({ text: `البائع: ${seller_name}`, bold: false, size: 20, rightToLeft: true, font: "Arial", color: "4B5563" })], alignment: AlignmentType.RIGHT })] : []),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [4500, 4500],
        layout: TableLayoutType.FIXED,
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
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      columnWidths: [9000],
      layout: TableLayoutType.FIXED,
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
    ...(store_rc ? [new Paragraph({ children: [new TextRun({ text: `RC : ${store_rc}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...(store_art ? [new Paragraph({ children: [new TextRun({ text: `ART : ${store_art}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...(store_mf ? [new Paragraph({ children: [new TextRun({ text: `MF : ${store_mf}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...((store_ccp_1 || store_ccp_2) ? [new Paragraph({ children: [new TextRun({ text: `CCP : ${store_ccp_1} ${store_ccp_2 ? ` Clé: ${store_ccp_2}` : ''}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    ...(store_nif ? [new Paragraph({ children: [new TextRun({ text: `NIF : ${store_nif}`, bold: true, size: 20, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT })] : []),
    new Paragraph({ text: "", spacing: { after: 400 } }),

    new Table({
      width: { size: 3500, type: WidthType.DXA },
      columnWidths: [3500],
      layout: TableLayoutType.FIXED,
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
    
    new Paragraph({ children: [new TextRun({ text: `فاتورة رقم ${invoice_number}`, bold: true, size: 36, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "", spacing: { after: 400 } }),

    invoiceTable,

    new Paragraph({ text: "", spacing: { after: 400 } }),
    
    new Paragraph({ text: "", spacing: { after: 200 } }),

    new Paragraph({ children: [new TextRun({ text: `المبلغ الإجمالي بالحروف: ${amount_in_words_arabic}`, bold: true, size: 24, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),
    ...(seller_name ? [new Paragraph({ children: [new TextRun({ text: `البائع: ${seller_name}`, bold: false, size: 20, rightToLeft: true, font: "Arial", color: "4B5563" })], alignment: AlignmentType.RIGHT })] : []),
    new Paragraph({ text: "", spacing: { after: 200 } }),
    
    new Table({
        width: { size: 9000, type: WidthType.DXA },
        columnWidths: [4500, 4500],
        layout: TableLayoutType.FIXED,
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
  ];

  const sections: any[] = [];
  
  let headerContent: any = undefined;
  if (store_logo) {
    try {
      const base64Data = store_logo.split(',')[1];
      if (base64Data) {
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
                    horizontalPosition: { offset: 2000000 },
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
