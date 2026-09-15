with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('value={password} onChange={(e) => setPassword(e.target.value)}\n                className="appearance-none', 'value={password} onChange={(e) => setPassword(e.target.value)}\n                className="fake-password appearance-none')
content = content.replace('value={acceptanceNumber} onChange={(e) => setAcceptanceNumber(e.target.value)}\n                className="appearance-none', 'value={acceptanceNumber} onChange={(e) => setAcceptanceNumber(e.target.value)}\n                className="fake-password appearance-none')

with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/login/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('className="w-full', 'className="fake-password w-full')
with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("done direct replace")