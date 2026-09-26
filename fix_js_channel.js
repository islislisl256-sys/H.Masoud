const fs = require('fs');

// 1. Update Dart side
const dartPath = '../hanoutak_mobile/lib/main.dart';
let dartContent = fs.readFileSync(dartPath, 'utf8');

const jsChannelCode = `
    controller.addJavaScriptChannel(
      'NativeLink',
      onMessageReceived: (JavaScriptMessage message) async {
        try {
          await launchUrl(Uri.parse(message.message), mode: LaunchMode.externalApplication);
        } catch (e) {
          debugPrint('Error launching url: $e');
        }
      },
    );
`;

if (!dartContent.includes('NativeLink')) {
    dartContent = dartContent.replace(
        /controller\.setNavigationDelegate/g,
        jsChannelCode.trim() + '\n\n    controller.setNavigationDelegate'
    );
    fs.writeFileSync(dartPath, dartContent, 'utf8');
    console.log('Added NativeLink channel to main.dart');
}

// 2. Update Web side
let webContent = fs.readFileSync('src/app/contact/page.tsx', 'utf8');

const webHandlerCode = `
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

// Add handleLinkClick back to the component
if (!webContent.includes('handleLinkClick')) {
    webContent = webContent.replace(
        /export default function ContactPage\(\) \{/g,
        'export default function ContactPage() {\n' + webHandlerCode
    );
    
    // Add onClick handlers to the links again
    webContent = webContent.replace(
        /<a href="(https:\/\/chat\.whatsapp\.com[^"]+)"/g,
        '<a href="$1" onClick={(e) => handleLinkClick(e, "$1")}'
    );
    webContent = webContent.replace(
        /<a href="(https:\/\/www\.facebook\.com[^"]+)"/g,
        '<a href="$1" onClick={(e) => handleLinkClick(e, "$1")}'
    );
    webContent = webContent.replace(
        /<a href="(https:\/\/www\.instagram\.com[^"]+)"/g,
        '<a href="$1" onClick={(e) => handleLinkClick(e, "$1")}'
    );
    webContent = webContent.replace(
        /<a href="(mailto:[^"]+)"/g,
        '<a href="$1" onClick={(e) => handleLinkClick(e, "$1")}'
    );
    
    fs.writeFileSync('src/app/contact/page.tsx', webContent, 'utf8');
    console.log('Added NativeLink handler to contact page');
}