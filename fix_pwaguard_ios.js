const fs = require('fs');
let content = fs.readFileSync('src/components/Layout/PwaGuard.tsx', 'utf8');

// Remove the download attribute for mobileconfig
content = content.replace(/href="\/hanutak_ios\.mobileconfig"\s*download="hanutak\.mobileconfig"/g, 'href="/hanutak_ios.mobileconfig"');

fs.writeFileSync('src/components/Layout/PwaGuard.tsx', content, 'utf8');
console.log('Fixed PwaGuard.tsx iOS link');