import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Layout/ProtectedLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'ChatNotificationsManager' not in content:
    content = content.replace('import BottomNav from "./BottomNav";', 'import BottomNav from "./BottomNav";\nimport ChatNotificationsManager from "../ChatNotificationsManager";')

# Inject component inside the provider hierarchy
if '<ChatNotificationsManager />' not in content:
    content = content.replace('<main className="flex-1', '<ChatNotificationsManager />\n        <main className="flex-1')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected ChatNotificationsManager into ProtectedLayout")