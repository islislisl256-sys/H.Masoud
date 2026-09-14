const fs = require('fs');
let c = fs.readFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/contexts/AuthContext.tsx', 'utf8');

c = c.replace(
  /const \{ error: err \} = await mainSupabase\.from\("app_accounts"\)\.update\(\{[\s\S]*?\}\)\.eq\("acceptance_number", currentUser\.acceptance_number\);/g,
  \const { error: err } = await mainSupabase.rpc('update_workspace_info', {
            p_store_name: storeName,
            p_business_type: businessType
          });\
);

fs.writeFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/contexts/AuthContext.tsx', c, 'utf8');
