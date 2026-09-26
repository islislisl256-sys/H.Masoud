const fs = require('fs');

let content = fs.readFileSync('src/app/contact/page.tsx', 'utf8');

// Replace handleLinkClick
const newHandler = `
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    const isApp = typeof window !== 'undefined' && localStorage.getItem('is_electron_app_forever') === 'true';
    
    if (isApp) {
      // In the mobile app, external intents cause ERR_UNKNOWN_URL_SCHEME
      // We copy the link to clipboard instead to prevent crashing
      navigator.clipboard.writeText(url).then(() => {
        import("@/components/CustomToasts").then(({ showSystemToast }) => {
          showSystemToast("تم النسخ", "لأنك داخل التطبيق، تم نسخ الرابط! يرجى لصقه في المتصفح أو التطبيق.", "info");
        });
      });
      return;
    }

    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      window.location.href = url;
    }
  };
`;

content = content.replace(/const handleLinkClick = [\s\S]*?};\s*(?=\r?\n\s*return \()/m, newHandler.trim() + '\n\n');

fs.writeFileSync('src/app/contact/page.tsx', content, 'utf8');
console.log('Fixed web contact links');