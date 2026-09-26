const fs = require('fs');

let content = fs.readFileSync('src/app/contact/page.tsx', 'utf8');

const oldHandlerRegex = /const handleLinkClick = [\s\S]*?};\s*(?=\r?\n\s*return \()/m;

const originalHandler = `
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    // Try window.open first
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      window.location.href = url;
    }
  };
`;

content = content.replace(oldHandlerRegex, originalHandler.trim() + '\n\n');

fs.writeFileSync('src/app/contact/page.tsx', content, 'utf8');
console.log('Reverted web contact links');