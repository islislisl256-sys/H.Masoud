import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/ChatNotificationsManager.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('if (!currentUser || !authData?.user?.id) return;', 'if (!currentUser || !currentUser.id) return;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed remaining authData issue")