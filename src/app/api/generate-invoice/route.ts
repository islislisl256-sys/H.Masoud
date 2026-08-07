import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import DocxMerger from 'docx-merger';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Paths to templates
    const receiptPath = path.join(process.cwd(), 'src', 'templates', 'receipt_box_left.docx');
    const invoicePath = path.join(process.cwd(), 'src', 'templates', 'invoice_exact_match_v2.docx');
    
    // Ensure files exist
    if (!fs.existsSync(receiptPath) || !fs.existsSync(invoicePath)) {
      return NextResponse.json({ error: 'Template files not found.' }, { status: 500 });
    }

    const content1 = fs.readFileSync(receiptPath, 'binary');
    const content2 = fs.readFileSync(invoicePath, 'binary');

    // Render receipt template
    const zip1 = new PizZip(content1);
    const doc1 = new Docxtemplater(zip1, { paragraphLoop: true, linebreaks: true });
    doc1.render(data);
    const buf1 = doc1.getZip().generate({ type: 'nodebuffer' });

    // Render invoice template
    const zip2 = new PizZip(content2);
    const doc2 = new Docxtemplater(zip2, { paragraphLoop: true, linebreaks: true });
    doc2.render(data);
    const buf2 = doc2.getZip().generate({ type: 'nodebuffer' });

    // Merge the two filled templates
    const merger = new DocxMerger({}, [buf1, buf2]);
    
    // docx-merger's save function expects a callback in some versions, but can also be used as:
    return new Promise<NextResponse>((resolve, reject) => {
      merger.save('nodebuffer', function (mergedBuf: Buffer) {
        resolve(
          new NextResponse(mergedBuf, {
            status: 200,
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'Content-Disposition': 'attachment; filename="Invoice.docx"',
            },
          })
        );
      });
    });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: error.message || 'Error generating invoice' }, { status: 500 });
  }
}
