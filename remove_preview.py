import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the PREVIEW NOTIFICATIONS useEffect
pattern = r'  useEffect\(\(\) => \{\n    // -{70}\n    // PREVIEW NOTIFICATIONS.*?\n  \}, \[\]\);\n'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed preview from page.tsx")