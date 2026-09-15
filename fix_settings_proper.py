import re

with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('fake-password ', '')
c = c.replace('fake-password', '')

# now add it ONLY to the actual password inputs
c = re.sub(r'(<input[^>]*?value=\{currentPassword\}[^>]*?className=")(w-full)', r'\1fake-password \2', c)
c = re.sub(r'(<input[^>]*?value=\{newPassword\}[^>]*?className=")(w-full)', r'\1fake-password \2', c)
c = re.sub(r'(<input[^>]*?value=\{confirmPassword\}[^>]*?className=")(w-full)', r'\1fake-password \2', c)

with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed settings completely")