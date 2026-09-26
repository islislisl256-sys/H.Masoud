const fs = require('fs');
let content = fs.readFileSync('src/app/chat/page.tsx', 'utf8');

// 1. Add overflow-x-hidden to the main container
content = content.replace(
  /<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">/g,
  '<div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4">'
);

// 2. Replace the old footer and absolute buttons with the new inline design
const oldBlockRegex = /<div className=\{`flex items-center gap-2 mt-1 text-\[10px\][^>]+>[\s\S]*?<\/div>[\s\S]*?(?:<div className=\{`absolute -bottom-2[^>]+>[\s\S]*?<\/div>\s*\}\)\}\s*)?<div className=\{`absolute top-2 \$\{isMine \? '-left-16' : '-right-16'\} opacity-0 group-hover:opacity-100 flex flex-col items-center gap-1 transition-opacity`\}>[\s\S]*?<\/div>/;

const newBlock = `
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <div className={\`flex items-center gap-2 text-[10px] \${isMine ? 'text-blue-100' : 'text-gray-400'}\`}>
                        <span>{new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.is_edited && <span>(Ù…Ù Ø¹Ø¯Ù„Ø©)</span>}
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {isMine && !editingId && (
                          <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }} className={\`p-1.5 rounded-full shadow-sm \${isMine ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary'}\`} title="ØªØ¹Ø¯ÙŠÙ„">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {currentUser.role === 'LEADER' && (
                          <button onClick={() => handleDeleteMessage(msg.id)} className={\`p-1.5 rounded-full shadow-sm \${isMine ? 'bg-white/20 text-white hover:bg-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-500'}\`} title="ØØ°Ù  (ØµÙ„Ø§ØÙŠØ© Ø§Ù„Ù‚Ø§Ø¦Ø¯)">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {msg.liked_by && msg.liked_by.length > 0 && (
                      <div className={\`absolute -bottom-2 \${isMine ? '-left-2' : '-right-2'} bg-white dark:bg-gray-800 rounded-full shadow-md px-1.5 py-0.5 text-xs border border-gray-100 dark:border-gray-700 flex items-center gap-1 z-10\`}>
                        ðŸ‘  <span className="text-gray-600 dark:text-gray-300 font-medium">{msg.liked_by.length}</span>
                      </div>
                    )}
`;

content = content.replace(oldBlockRegex, newBlock.trim());

fs.writeFileSync('src/app/chat/page.tsx', content, 'utf8');
console.log('Fixed chat page layout');