const fs = require('fs');

const oldContent = fs.readFileSync('public/hanutak_ios.mobileconfig', 'utf8');
const iconMatch = oldContent.match(/<key>Icon<\/key>\s*<data>\s*([^<]+)\s*<\/data>/);
const iconBase64 = iconMatch ? iconMatch[1].trim() : '';

const newConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>
${iconBase64}
            </data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>حانوتك</string>
            <key>PayloadDescription</key>
            <string>تطبيق حانوتك لإدارة المحلات</string>
            <key>PayloadDisplayName</key>
            <string>Web Clip</string>
            <key>PayloadIdentifier</key>
            <string>com.masoud.hanoutak.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>12345678-1234-1234-1234-1234567890AB</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://h-masoud.vercel.app/?app=mobile</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>تطبيق حانوتك لإدارة المحلات</string>
    <key>PayloadDisplayName</key>
    <string>حانوتك</string>
    <key>PayloadIdentifier</key>
    <string>com.masoud.hanoutak</string>
    <key>PayloadOrganization</key>
    <string>Hanutak</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>87654321-4321-4321-4321-BA0987654321</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

fs.writeFileSync('public/hanutak_ios.mobileconfig', newConfig, 'utf8');
console.log('Generated flawless mobileconfig');