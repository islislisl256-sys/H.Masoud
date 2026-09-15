import re
with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('style={{ WebkitTextSecurity: "disc" }}', 'className="fake-password"')

with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)