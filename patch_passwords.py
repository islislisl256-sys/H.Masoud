import re
import os

def fix_passwords(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add autoComplete="new-password" and change name/id to avoid Chrome's aggressive detection if needed
    # Usually autoComplete="new-password" is enough.
    content = content.replace('type="password"', 'type="password" autoComplete="new-password"')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'
fix_passwords(base + 'app/login/page.tsx')
fix_passwords(base + 'app/settings/page.tsx')
fix_passwords(base + 'app/setup/page.tsx')
print("Patched password fields")