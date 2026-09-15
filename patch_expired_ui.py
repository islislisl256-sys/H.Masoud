import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add EXPIRED to step state
content = content.replace('const [step, setStep] = useState<1 | 2 | 3 | "BLOCKED" | "TEMP_LOCKED">(1);', 'const [step, setStep] = useState<1 | 2 | 3 | "BLOCKED" | "TEMP_LOCKED" | "EXPIRED">(1);')

# Modify redirect logic
pattern = r'if \(result\.message && result\.message\.includes\("انتهى اشتراك"\)\) \{\s*// Redirect to contact page\s*router\.push\("/contact"\);\s*\}'
replacement = '''if (result.message && (result.message.includes("انتهى اشتراك") || result.message.includes("اشتراك"))) {
          setStep("EXPIRED");
        }'''
content = re.sub(pattern, replacement, content)

# Add EXPIRED step UI
expired_ui = '''
        {step === "EXPIRED" && (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <AlertOctagon className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">انتهى اشتراك الحساب</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                لقد انتهت فترة الاشتراك الخاصة بمكتبتك. يرجى التواصل مع الإدارة لتجديد الاشتراك ومواصلة استخدام النظام.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
               <a href="https://wa.me/213555555555" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
                 <Phone className="w-5 h-5" />
                 تواصل عبر الواتساب
               </a>
               <a href="mailto:support@masoud.com" className="flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
                 تواصل عبر الإيميل
               </a>
            </div>

            <button onClick={() => setStep(1)} className="mt-4 text-sm font-medium text-primary hover:underline">
              العودة للصفحة الرئيسية
            </button>
          </div>
        )}
'''
# Insert before the closing div of the card
content = content.replace('</div>\n    </div>\n  );\n}', expired_ui + '\n      </div>\n    </div>\n  );\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated login page with EXPIRED step!")