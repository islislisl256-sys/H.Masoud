path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Modals/CloudinarySetupModal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
old = re.search(r'if \(!confirm\(".*?"\)\) return;', content).group(0)
content = content.replace(old, 'confirmDialog("تأكيد", "هل أنت متأكد من مسح الإعدادات؟", async () => {')
content = content.replace('onSuccess();\n      } catch (e) {', 'onSuccess();\n      } catch (e) {')
# wait I need to close the `});` at the end of the catch block.
# Let's find the closing brace of the catch block.
c2 = re.search(r'catch \(e\) \{\n\s*showSystemToast\(".*?", ".*?", ".*?"\);\n\s*\}', content).group(0)
content = content.replace(c2, c2 + '\n    });')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")