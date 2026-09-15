with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('type="text" className="fake-password"\n                    placeholder=', 'type="text"\n                    placeholder=')
content = content.replace('className="w-full px-3 py-2', 'className="fake-password w-full px-3 py-2')

with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)