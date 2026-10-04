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
        if (line.includes('<button') && line.includes('bg-white') && line.includes('text-white') && !line.includes('bg-white/')) {
          console.log(`[${fullPath}] Line ${i+1}: ${line.trim()}`);
        }
      }
    }
  }
}
searchDir('src/app');
searchDir('src/components');