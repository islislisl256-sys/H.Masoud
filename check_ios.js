const fs = require('fs');
let content = fs.readFileSync('public/hanutak_ios.mobileconfig', 'utf8');
console.log(content.substring(0, 500));
const urlMatch = content.match(/<key>URL<\/key>\s*<string>(.*?)<\/string>/);
if (urlMatch) {
    console.log('Found URL:', urlMatch[1]);
} else {
    console.log('URL not found');
}