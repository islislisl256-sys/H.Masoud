const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.dev = 'next dev --webpack';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf8');
console.log('Fixed package.json dev script');