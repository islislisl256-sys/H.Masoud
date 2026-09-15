import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'const handleFailedAttempt = \(failType: string\) => \{'
replacement = '''const handleFailedAttempt = (failType: string, customMessage?: string) => {'''

content = re.sub(pattern, replacement, content)

pattern2 = r'setError\(`.*?`\);'
replacement2 = '''setError(customMessage || `بيانات غير صحيحة لديك ${3 - fails} محاولات متبقية قبل حظر مؤقت.`);'''

content = re.sub(pattern2, replacement2, content)

pattern3 = r'handleFailedAttempt\("login_fails"\);'
replacement3 = '''handleFailedAttempt("login_fails", result.message);'''

content = re.sub(pattern3, replacement3, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated handleFailedAttempt!")