import re

# Fix loading.tsx
path_loading = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/loading.tsx'
with open(path_loading, 'w', encoding='utf-8') as f:
    f.write("""import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">جاري التحميل...</p>
    </div>
  );
}
""")

# Fix password fields
def fix_pass(file):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # replace password type
    content = re.sub(r'type="password"(\s+autoComplete="new-password")?', 'type="text" style={{ WebkitTextSecurity: "disc" }}', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'
fix_pass(base + 'app/login/page.tsx')
fix_pass(base + 'app/settings/page.tsx')
fix_pass(base + 'app/setup/page.tsx')

print("Fixed loading and password fields")