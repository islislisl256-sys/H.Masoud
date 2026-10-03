const fs = require('fs');
let code = fs.readFileSync('src/app/products/page.tsx', 'utf8');

// Replace null with an empty string to satisfy TypeScript
code = code.replace(/finalImageUrl = null;/g, 'finalImageUrl = "";');

fs.writeFileSync('src/app/products/page.tsx', code, 'utf8');
console.log('Fixed TypeScript error');