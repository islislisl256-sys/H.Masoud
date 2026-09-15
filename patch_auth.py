import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/contexts/AuthContext.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'const updatedUser = \{ \n\s*\.\.\.currentUser, \n\s*full_name: fullName, \n\s*phone_number: phone, \n\s*setup_completed: true,\n\s*\.\.\.\(currentUser\.role === \'LEADER\' && \{ business_type: businessType, store_name: storeName \}\)\n\s*\};\n\s*setCurrentUser\(updatedUser\);\n\s*sessionStorage\.setItem\("currentUser", JSON\.stringify\(updatedUser\)\);\n\s*return true;'
replacement = '''const updatedUser = { 
          ...currentUser, 
          full_name: fullName, 
          phone_number: phone, 
          setup_completed: true,
          ...(currentUser.role === 'LEADER' && { business_type: businessType, store_name: storeName })
        };
        
        setCurrentUser(updatedUser);
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
        localStorage.setItem("setup_completed_" + currentUser.id, "true");
        return true;'''

content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AuthContext!")