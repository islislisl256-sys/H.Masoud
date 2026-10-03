const fs = require('fs');
const content = fs.readFileSync('src/app/invoices/page.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes('<input') || line.includes('<textarea')) {
    console.log(`[INVOICES] Line ${i+1}: ${line.trim()}`);
  }
}