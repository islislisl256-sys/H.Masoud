import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/CustomToasts.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add icons to imports
content = content.replace('MessageSquare, Heart } from \'lucide-react\';', 'MessageSquare, Heart, Trash2, AlertTriangle, XCircle } from \'lucide-react\';')

# Update showSystemToast signature
old_sig = "type: 'add' | 'sale' | 'edit_user' | 'invoice' | 'db' | 'chat' | 'heart'"
new_sig = "type: 'add' | 'sale' | 'edit_user' | 'invoice' | 'db' | 'chat' | 'heart' | 'delete' | 'warning' | 'error'"
content = content.replace(old_sig, new_sig)

# Update getIcon
icon_repl = '''      case 'heart': return <Heart className="h-6 w-6 text-red-600 dark:text-red-400 fill-current" />;
      case 'delete': return <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'error': return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;'''
content = content.replace('case \'heart\': return <Heart className="h-6 w-6 text-red-600 dark:text-red-400 fill-current" />;', icon_repl)

# Update getBg
bg_repl = '''      case 'heart': return 'bg-red-100 dark:bg-red-900/30';
      case 'delete': return 'bg-red-100 dark:bg-red-900/30';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'error': return 'bg-red-100 dark:bg-red-900/30';'''
content = content.replace('case \'heart\': return \'bg-red-100 dark:bg-red-900/30\';', bg_repl)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CustomToasts with delete/warning/error types")