const fs = require('fs');

let content = fs.readFileSync('src/components/Layout/PwaGuard.tsx', 'utf8');

// Remove any existing usePathname imports and use client directives
content = content.replace(/import \{ usePathname \} from "next\/navigation";\s*/g, '');
content = content.replace(/"use client";\s*/g, '');

// Prepend them correctly
content = '"use client";\nimport { usePathname } from "next/navigation";\n' + content.trim();

fs.writeFileSync('src/components/Layout/PwaGuard.tsx', content, 'utf8');
console.log('Fixed use client directive');