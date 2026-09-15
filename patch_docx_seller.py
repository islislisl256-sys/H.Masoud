import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/lib/generateDocx.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add seller_name to destructured payload
content = content.replace('amount_in_words_arabic = "",', 'amount_in_words_arabic = "",\n    seller_name = "",')

# Add seller_name to Receipt
receipt_pattern = r'new Paragraph\(\{ children: \[new TextRun\(\{ text: receipt_date, bold: true, size: 28, rightToLeft: true, font: "Arial" \}\)\], alignment: AlignmentType\.RIGHT \}\),\n      new Paragraph\(\{ text: "", spacing: \{ after: 200 \} \}\),'
receipt_repl = r'new Paragraph({ children: [new TextRun({ text: receipt_date, bold: true, size: 28, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),\n      ...(seller_name ? [new Paragraph({ children: [new TextRun({ text: `البائع: ${seller_name}`, bold: false, size: 20, rightToLeft: true, font: "Arial", color: "4B5563" })], alignment: AlignmentType.RIGHT })] : []),\n      new Paragraph({ text: "", spacing: { after: 200 } }),'
content = re.sub(receipt_pattern, receipt_repl, content)

# Add seller_name to Invoice
invoice_pattern = r'new Paragraph\(\{ children: \[new TextRun\(\{ text: `المبلغ الإجمالي بالحروف: \$\{amount_in_words_arabic\}`, bold: true, size: 24, rightToLeft: true, font: "Arial" \}\)\], alignment: AlignmentType\.RIGHT \}\),\n    new Paragraph\(\{ text: "", spacing: \{ after: 200 \} \}\),'
invoice_repl = r'new Paragraph({ children: [new TextRun({ text: `المبلغ الإجمالي بالحروف: ${amount_in_words_arabic}`, bold: true, size: 24, rightToLeft: true, font: "Arial" })], alignment: AlignmentType.RIGHT }),\n    ...(seller_name ? [new Paragraph({ children: [new TextRun({ text: `البائع: ${seller_name}`, bold: false, size: 20, rightToLeft: true, font: "Arial", color: "4B5563" })], alignment: AlignmentType.RIGHT })] : []),\n    new Paragraph({ text: "", spacing: { after: 200 } }),'
content = re.sub(invoice_pattern, invoice_repl, content)

# Update docx filename
content = content.replace('saveAs(blob, `Invoice_${client_name}_${invoice_number}.docx`);', 'saveAs(blob, `Invoice_${client_name}_${invoice_number}_${seller_name}.docx`);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated generateDocx with seller_name")