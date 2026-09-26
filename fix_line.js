const fs = require('fs');
let content = fs.readFileSync('src/app/chat/page.tsx', 'utf8');

// replace the thumbs up line
const lines = content.split('\n');
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('msg.liked_by.length')) {
    if (lines[i].includes('span className="text-gray-600')) {
       lines[i] = '                        👍 <span className="text-gray-600 dark:text-gray-300 font-medium">{msg.liked_by.length}</span>';
    }
  }
}
content = lines.join('\n');
fs.writeFileSync('src/app/chat/page.tsx', content, 'utf8');
console.log('Fixed line');