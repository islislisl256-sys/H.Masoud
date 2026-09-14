const fs = require('fs');
let content = fs.readFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'utf8');

const targetButton = \</button>
            </div>
          </div>

          {currentUser?.role === 'LEADER' && (\;

const replacementButton = \</button>
            </div>
            
            {/* Communication Button */}
            <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => window.location.href = '/chat'} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-4 rounded-xl hover:opacity-90 transition-opacity font-bold shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>التواصل مع فريق العمل</span>
              </button>
            </div>
          </div>

          {currentUser?.role === 'LEADER' && (\;

if (content.includes(targetButton)) {
  content = content.replace(targetButton, replacementButton);
  fs.writeFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', content, 'utf8');
  console.log("Success: Button added.");
} else {
  console.log("Error: Target for button not found.");
}
