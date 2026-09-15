import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # First, let's just remove "fake-password " from ALL classNames
    content = content.replace('fake-password ', '')
    content = content.replace('className="fake-password"', '') # if any isolated

    # Then, only add it to inputs that are specifically for passwords
    # The password inputs are currently type="text"
    # In login/page.tsx:
    # 1. acceptanceNumber (Wait, acceptance number is also a password? Yes, it was type="password" before)
    # 2. password (login)
    
    # Let's find: `type="text"` followed by some properties where we know it's a password
    # Or, a much safer approach: Find where it says "كلمة المرور" or "رقم القبول" and add it there.
    # Actually, let's just do a manual regex based on `value={password}` or `value={acceptanceNumber}`
    
    # pattern 1: value={password}
    content = re.sub(r'(<input[^>]*?value=\{password\}[^>]*?className=")([^"]*)', r'\1fake-password \2', content)
    
    # pattern 2: value={acceptanceNumber} (if it was treated as password)
    content = re.sub(r'(<input[^>]*?value=\{acceptanceNumber\}[^>]*?className=")([^"]*)', r'\1fake-password \2', content)

    # In settings/page.tsx: value={newPassword} or value={currentPassword} or value={confirmPassword}
    content = re.sub(r'(<input[^>]*?value=\{newPassword\}[^>]*?className=")([^"]*)', r'\1fake-password \2', content)
    content = re.sub(r'(<input[^>]*?value=\{currentPassword\}[^>]*?className=")([^"]*)', r'\1fake-password \2', content)
    content = re.sub(r'(<input[^>]*?value=\{confirmPassword\}[^>]*?className=")([^"]*)', r'\1fake-password \2', content)
    
    # Oh wait, for settings/page.tsx, earlier I did:
    # type="text" className="fake-password w-full ...
    # So the above replace('fake-password ', '') works.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'
fix_file(base + 'app/login/page.tsx')
fix_file(base + 'app/settings/page.tsx')
fix_file(base + 'app/setup/page.tsx')

print("Fixed inputs")