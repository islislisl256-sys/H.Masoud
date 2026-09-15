import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/ChatNotificationsManager.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'db'", "'chat'")
content = content.replace("showSystemToast(`تفاعل جديد`, `قام ${likerName} بالإعجاب برسالتك`, 'chat');", "showSystemToast(`تفاعل جديد`, `قام ${likerName} بالإعجاب برسالتك`, 'heart');")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ChatNotificationsManager to use correct icons")