import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'if \(!result\.success\) \{\s*handleFailedAttempt\("login_fails", result\.message\);\s*\}'
replacement = '''if (!result.success) {
        if (result.message && result.message.includes("انتهى اشتراك")) {
          // Redirect to contact page
          router.push("/contact");
        } else {
          handleFailedAttempt("login_fails", result.message);
        }
      }'''

content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated login redirect!")