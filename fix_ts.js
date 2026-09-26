const fs = require('fs');
let content = fs.readFileSync('src/app/contact/page.tsx', 'utf8');
content = content.replace(/"info"\)/g, '"chat")');
fs.writeFileSync('src/app/contact/page.tsx', content, 'utf8');
console.log('Fixed typescript error');