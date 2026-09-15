import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the setup check to respect local storage fallback
pattern = r'if \(!result\.user\.setup_completed\) \{'
replacement = '''if (!result.user.setup_completed && localStorage.getItem("setup_completed_" + result.user.id) !== "true") {'''

content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated login check!")