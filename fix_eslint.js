const fs = require('fs');
let c = fs.readFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/chat/page.tsx', 'utf8');

c = c.replace('const fetchMessages = async () => {', 'async function fetchMessages() {');
c = c.replace('const scrollToBottom = () => {', 'function scrollToBottom() {');

// We also need to fix the eslint any warning, maybe? setMessages(data as any);
c = c.replace('setMessages(data as any);', 'setMessages(data as unknown as Message[]);');

fs.writeFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/chat/page.tsx', c, 'utf8');
