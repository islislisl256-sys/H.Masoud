const fs = require('fs');

let webContent = fs.readFileSync('src/app/contact/page.tsx', 'utf8');

const oldHandlerRegex = /const handleLinkClick = [\s\S]*?};\s*(?=\r?\n\s*return \()/m;

const newHandlerCode = `
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    const isApp = typeof window !== 'undefined' && localStorage.getItem('is_electron_app_forever') === 'true';
    
    // 1. If the app was built with NativeLink, use the flawless direct bridge
    if (typeof window !== 'undefined' && (window as any).NativeLink) {
      (window as any).NativeLink.postMessage(url);
      return;
    } 
    
    // 2. If it's the app but NativeLink is missing (old APK), prevent crash by copying
    if (isApp) {
      navigator.clipboard.writeText(url).then(() => {
        import("@/components/CustomToasts").then(({ showSystemToast }) => {
          showSystemToast("ØªÙ… Ø§Ù„Ù†Ø³Ø®", "Ù„Ù… ÙŠØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø¨Ø¹Ø¯. ØªÙ… Ù†Ø³Ø® Ø§Ù„Ø±Ø§Ø¨Ø· Ù„Ù ØªØ­Ù‡ Ù ÙŠ Ù…ØªØµÙ Ø­Ùƒ.", "info");
        });
      });
      return;
    }

    // 3. Normal browser behavior
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      window.location.href = url;
    }
  };
`;

webContent = webContent.replace(oldHandlerRegex, newHandlerCode.trim() + '\n\n');
fs.writeFileSync('src/app/contact/page.tsx', webContent, 'utf8');
console.log('Fixed web handler to prevent crash safely');