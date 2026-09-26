const fs = require('fs');
const c = fs.readFileSync('src/app/products/page.tsx', 'utf8');
const lines = c.split('\n');
const idx = lines.findIndex(l => l.includes('Floating Add Button'));
if (idx > -1) {
    for(let j=idx; j<lines.length; j++) {
        console.log(j + ": " + lines[j]);
    }
}