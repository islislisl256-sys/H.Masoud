const fs = require('fs');

let content = fs.readFileSync('src/app/contact/page.tsx', 'utf8');

// Completely remove the onClick handler from the anchors
content = content.replace(/onClick=\{\(e\) => handleLinkClick\(e, '[^']+'\)\}/g, '');

fs.writeFileSync('src/app/contact/page.tsx', content, 'utf8');
console.log('Removed onClick interceptor from web links');