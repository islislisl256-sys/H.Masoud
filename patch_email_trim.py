import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const result = await login(email, password);', 'const result = await login(email.trim(), password);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated login page to trim email!")