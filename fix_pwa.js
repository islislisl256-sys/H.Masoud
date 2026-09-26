const fs = require('fs');

let content = fs.readFileSync('src/components/Layout/PwaGuard.tsx', 'utf8');

// 1. Add usePathname import if not present
if (!content.includes('usePathname')) {
    content = content.replace(
        /import React, { useState, useEffect } from "react";/g,
        'import React, { useState, useEffect } from "react";\nimport { usePathname } from "next/navigation";'
    );
}

// 2. Add pathname hook
content = content.replace(
    /export default function PwaGuard\(\{ children \}: \{ children: React.ReactNode \}\) \{/g,
    'export default function PwaGuard({ children }: { children: React.ReactNode }) {\n  const pathname = usePathname();'
);

// 3. Fix the localStorage check to include app=mobile
content = content.replace(
    /if \(typeof window !== 'undefined' && window\.location\.search\.includes\('electron=true'\)\) \{\s*localStorage\.setItem\('is_electron_app_forever', 'true'\);\s*\}/g,
    `if (typeof window !== 'undefined' && (window.location.search.includes('electron=true') || window.location.search.includes('app=mobile'))) {\n        localStorage.setItem('is_electron_app_forever', 'true');\n      }`
);

// 4. Fix the bypass condition to allow /contact
content = content.replace(
    /if \(isStandalone\) \{\s*return <>{children}<\/>;\s*\}/g,
    `if (isStandalone || pathname === '/contact') {\n    return <>{children}</>;\n  }`
);

fs.writeFileSync('src/components/Layout/PwaGuard.tsx', content, 'utf8');
console.log('Fixed PwaGuard');