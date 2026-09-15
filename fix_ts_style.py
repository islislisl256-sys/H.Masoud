import re

# Add class to globals.css
with open('C:/Users/User/Desktop/H.Masoud/library-system/src/app/globals.css', 'a', encoding='utf-8') as f:
    f.write('\n\n.fake-password {\n  -webkit-text-security: disc;\n  text-security: disc;\n}\n')

# Remove style and add class in login/page.tsx
def fix_file(file):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex to find: type="text" style={{ WebkitTextSecurity: "disc" }} required value={acceptanceNumber}
    # and replace with: type="text" required value=... and add fake-password to className
    content = content.replace('style={{ WebkitTextSecurity: "disc" }}', 'className="fake-password"')
    # Wait, the input ALREADY has a className attribute!
    # I can just remove the style attribute entirely, and inject fake-password into the existing className.
    # Let's revert the style inject and use python to carefully inject the class.
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# Wait, if I replace style={{...}} with className="fake-password", the input will have TWO className attributes, which React allows but the last one might override or it might throw an error. It's safer to merge it into the existing className!

def safe_fix(file):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = content.replace('style={{ WebkitTextSecurity: "disc" }} ', '')
    content = content.replace('className="appearance-none', 'className="fake-password appearance-none')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'
safe_fix(base + 'app/login/page.tsx')
safe_fix(base + 'app/settings/page.tsx')
safe_fix(base + 'app/setup/page.tsx')
print("Fixed TS errors")