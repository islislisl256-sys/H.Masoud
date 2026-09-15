import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/contexts/AuthContext.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'if \(authError \|\| !authData\.user\) \{\s*return \{ success: false, message: ".*?" \};\s*\}'
replacement = '''if (authError || !authData.user) {
          return { success: false, message: "تأكد من صحة البيانات: " + (authError?.message || "") };
        }'''

content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AuthContext to show real auth error!")