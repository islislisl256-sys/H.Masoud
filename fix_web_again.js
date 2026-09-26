const fs = require('fs');

let webContent = fs.readFileSync('src/app/contact/page.tsx', 'utf8');

const oldHandlerRegex = /const handleLinkClick = [\s\S]*?};\s*/m;

const newHandlerCode = `
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && (window as any).NativeLink) {
      (window as any).NativeLink.postMessage(url);
    } else {
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (err) {
        window.location.href = url;
      }
    }
  };
`;

webContent = webContent.replace(oldHandlerRegex, newHandlerCode);

webContent = webContent.replace(
    /<a href="(https:\/\/chat\.whatsapp\.com[^"]+)"(?! onClick)/g,
    '<a href="$1" onClick={(e) => handleLinkClick(e, "$1")}'
);
webContent = webContent.replace(
    /<a href="(https:\/\/www\.facebook\.com[^"]+)"(?! onClick)/g,
    '<a href="$1" onClick={(e) => handleLinkClick(e, "$1")}'
);
webContent = webContent.replace(
    /<a href="(https:\/\/www\.instagram\.com[^"]+)"(?! onClick)/g,
    '<a href="$1" onClick={(e) => handleLinkClick(e, "$1")}'
);
webContent = webContent.replace(
    /<a href="(mailto:[^"]+)"(?! onClick)/g,
    '<a href="$1" onClick={(e) => handleLinkClick(e, "$1")}'
);

fs.writeFileSync('src/app/contact/page.tsx', webContent, 'utf8');
console.log('Fixed web handler correctly');