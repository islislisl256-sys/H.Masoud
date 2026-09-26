const fs = require('fs');
let content = fs.readFileSync('src/app/chat/page.tsx', 'utf8');

content = content.replace(/Ã™â€¦Ã™ Ã˜Â¹Ã˜Â¯Ã™â€žÃ˜Â©/g, 'مُعدّلة');
content = content.replace(/Ã˜ÂªÃ˜Â¹Ã˜Â¯Ã™ÅÃ™â€ž/g, 'تعديل');
content = content.replace(/Ã˜Ã˜Â°Ã™  \(Ã˜ÂµÃ™â€žÃ˜Â§Ã˜Ã™ÅÃ˜Â© Ã˜Â§Ã™â€žÃ™â€šÃ˜Â§Ã˜Â¦Ã˜Â¯\)/g, 'حذف (صلاحية القائد)');
content = content.replace(/Ã°Å¸â€˜ /g, '👍');

fs.writeFileSync('src/app/chat/page.tsx', content, 'utf8');
console.log('Fixed encoding');