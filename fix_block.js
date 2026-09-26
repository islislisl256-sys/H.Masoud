const fs = require('fs');
let content = fs.readFileSync('src/app/chat/page.tsx', 'utf8');

// The block has garbled text. We can replace it using regex for the general structure.
const blockRegex = /<div className="flex items-center justify-between gap-4 mt-2">[\s\S]*?<\/div>\s*\}\)\s*<\/div>/;

const correctBlock = `
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <div className={\`flex items-center gap-2 text-[10px] \${isMine ? 'text-blue-100' : 'text-gray-400'}\`}>
                        <span>{new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.is_edited && <span>(مُعدّلة)</span>}
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {isMine && !editingId && (
                          <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }} className={\`p-1.5 rounded-full shadow-sm \${isMine ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary'}\`} title="تعديل">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {currentUser.role === 'LEADER' && (
                          <button onClick={() => handleDeleteMessage(msg.id)} className={\`p-1.5 rounded-full shadow-sm \${isMine ? 'bg-white/20 text-white hover:bg-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-500'}\`} title="حذف (صلاحية القائد)">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {msg.liked_by && msg.liked_by.length > 0 && (
                      <div className={\`absolute -bottom-2 \${isMine ? '-left-2' : '-right-2'} bg-white dark:bg-gray-800 rounded-full shadow-md px-1.5 py-0.5 text-xs border border-gray-100 dark:border-gray-700 flex items-center gap-1 z-10\`}>
                        👍 <span className="text-gray-600 dark:text-gray-300 font-medium">{msg.liked_by.length}</span>
                      </div>
                    )}
                  </div>
`;

content = content.replace(blockRegex, correctBlock.trim());
fs.writeFileSync('src/app/chat/page.tsx', content, 'utf8');
console.log('Fixed block');