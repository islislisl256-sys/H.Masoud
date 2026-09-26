const fs = require('fs');
let content = fs.readFileSync('src/app/contact/page.tsx', 'utf8');

// Add min-w-0 to the a tags
content = content.replace(/<a href="([^"]+)" onClick=\{\(e\) => handleLinkClick\(e, "([^"]+)"\)\}\s*className="flex/g, '<a href="$1" onClick={(e) => handleLinkClick(e, "$2")} className="flex min-w-0 w-full');

fs.writeFileSync('src/app/contact/page.tsx', content, 'utf8');
console.log('Fixed a tags');