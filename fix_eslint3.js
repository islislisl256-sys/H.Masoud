const fs = require('fs');
let c = fs.readFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/chat/page.tsx', 'utf8');

c = c.replace('fetchMessages();', '// eslint-disable-next-line\\n    fetchMessages();');
c = c.replace('(payload) => {', '() => {');

fs.writeFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/chat/page.tsx', c, 'utf8');
