const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const DocxMerger = require('docx-merger');

function run() {
    try {
        const content1 = fs.readFileSync('receipt_box_left.docx', 'binary');
        const content2 = fs.readFileSync('invoice_exact_match_v2.docx', 'binary');
        
        // Mock data
        const data = { name: 'Test Client', store_name: 'Test Store' };

        const zip1 = new PizZip(content1);
        const doc1 = new Docxtemplater(zip1, { paragraphLoop: true, linebreaks: true });
        doc1.render(data);
        const buf1 = doc1.getZip().generate({ type: 'nodebuffer' });

        const zip2 = new PizZip(content2);
        const doc2 = new Docxtemplater(zip2, { paragraphLoop: true, linebreaks: true });
        doc2.render(data);
        const buf2 = doc2.getZip().generate({ type: 'nodebuffer' });

        // Merge
        const merger = new DocxMerger({}, [buf1, buf2]);
        merger.save('nodebuffer', function (data) {
            fs.writeFileSync('merged_test.docx', data);
            console.log('Success!');
        });
    } catch(e) {
        console.error('Error:', e);
    }
}
run();
