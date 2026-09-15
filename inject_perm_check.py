import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Layout/ProtectedLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for showPermissionToast
if 'showPermissionToast' not in content:
    content = content.replace('import ChatNotificationsManager from "../ChatNotificationsManager";', 'import ChatNotificationsManager from "../ChatNotificationsManager";\nimport { showPermissionToast } from "../CustomToasts";')

# Inject permission check useEffect
perm_effect = """  useEffect(() => {
    if (mounted && isAuthenticated && currentUser) {
      // Check if permissions are granted. Only show if 'default' (not yet asked)
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default' && !sessionStorage.getItem('perm_toast_shown')) {
          showPermissionToast();
          sessionStorage.setItem('perm_toast_shown', 'true');
        }
      }
    }
  }, [mounted, isAuthenticated, currentUser]);
"""

if 'perm_toast_shown' not in content:
    content = content.replace('if (!mounted) return null;', perm_effect + '\n  if (!mounted) return null;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected smart permission check in ProtectedLayout")