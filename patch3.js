const fs = require('fs');
let content = fs.readFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx', 'utf8');

// Remove the button
const buttonPattern = /<button type="button" onClick=\{handleBackToStep1\}.*?<\/button>\s*/gs;
content = content.replace(buttonPattern, "");

// Convert the div wrapper back to a simple button if needed, or just leave the div wrapper. 
// I'll leave the flex wrapper, just in case, but let's make sure there are no syntax errors.

// Remove the function
const funcPattern = /\s*const handleBackToStep1 = \(\) => \{\s*localStorage\.removeItem\("acceptance_verified"\);\s*localStorage\.removeItem\("verified_workspace_acceptance"\);\s*setStep\(1\);\s*setError\(""\);\s*\};\s*/gs;
content = content.replace(funcPattern, "\n");

fs.writeFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx', content, 'utf8');
