import re
with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'(<input[^>]*?value=\{password\}[^>]*?className=")(appearance-none)', r'\1fake-password \2', content)
content = re.sub(r'(<input[^>]*?value=\{acceptanceNumber\}[^>]*?className=")(appearance-none)', r'\1fake-password \2', content)

with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = re.sub(r'(<input[^>]*?value=\{currentPassword\}[^>]*?className=")(w-full)', r'\1fake-password \2', c)
c = re.sub(r'(<input[^>]*?value=\{newPassword\}[^>]*?className=")(w-full)', r'\1fake-password \2', c)
c = re.sub(r'(<input[^>]*?value=\{confirmPassword\}[^>]*?className=")(w-full)', r'\1fake-password \2', c)

with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed fake-password")