const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (let file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes('<button') && line.includes('text-white') && !line.includes('dark:text-white')) {
          // If it has a colored background, it's fine. 
          if (!line.includes('bg-primary') && !line.includes('bg-blue') && !line.includes('bg-red') && !line.includes('bg-green') && !line.includes('bg-gray-800') && !line.includes('bg-gray-900') && !line.includes('bg-indigo') && !line.includes('bg-purple')) {
             console.log(`[${fullPath}] Line ${i+1}: ${line.trim()}`);
          }
        }
      }
    }
  }
}
searchDir('src/app');
searchDir('src/components');