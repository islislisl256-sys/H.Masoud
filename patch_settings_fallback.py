import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the fallback logic so empty string is respected
content = content.replace(
    'setStoreName(currentUser.store_name || "مكتبة إقرأ و ارتق");',
    'setStoreName(currentUser.store_name ?? "مكتبة إقرأ و ارتق");'
)
content = content.replace(
    'setStoreLogo(currentUser.store_logo || "");',
    'setStoreLogo(currentUser.store_logo ?? "");'
)
content = content.replace(
    'setUsername(currentUser.name || "HERMA");',
    'setUsername(currentUser.name ?? "HERMA");'
)
content = content.replace(
    'setFullName(currentUser.full_name || "");',
    'setFullName(currentUser.full_name ?? "");'
)
content = content.replace(
    'setPhoneNumber(currentUser.phone_number || "");',
    'setPhoneNumber(currentUser.phone_number ?? "");'
)
content = content.replace(
    'setBusinessType(currentUser.business_type || "");',
    'setBusinessType(currentUser.business_type ?? "");'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Settings page!")