import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/CustomToasts.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add icons to imports
content = content.replace('UserCog, FileText, Database, Bell } from \'lucide-react\';', 'UserCog, FileText, Database, Bell, MessageSquare, Heart } from \'lucide-react\';')

# Update showSystemToast signature
content = content.replace('type: \'add\' | \'sale\' | \'edit_user\' | \'invoice\' | \'db\'', 'type: \'add\' | \'sale\' | \'edit_user\' | \'invoice\' | \'db\' | \'chat\' | \'heart\'')

# Update getIcon
icon_repl = '''      case 'db': return <Database className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />;
      case 'chat': return <MessageSquare className="h-6 w-6 text-pink-600 dark:text-pink-400" />;
      case 'heart': return <Heart className="h-6 w-6 text-red-600 dark:text-red-400 fill-current" />;'''
content = content.replace('case \'db\': return <Database className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />;', icon_repl)

# Update getBg
bg_repl = '''      case 'db': return 'bg-cyan-100 dark:bg-cyan-900/30';
      case 'chat': return 'bg-pink-100 dark:bg-pink-900/30';
      case 'heart': return 'bg-red-100 dark:bg-red-900/30';'''
content = content.replace('case \'db\': return \'bg-cyan-100 dark:bg-cyan-900/30\';', bg_repl)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CustomToasts with chat and heart icons")