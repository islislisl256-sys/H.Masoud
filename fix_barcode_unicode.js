const fs = require('fs');
let code = fs.readFileSync('src/contexts/BarcodeContext.tsx', 'utf8');

const correctFunction = `function sanitizeBarcode(input: string) {
  const azertyMap: Record<string, string> = {
    '&': '1', '\\u00e9': '2', '"': '3', "'": '4', '(': '5',
    '-': '6', '\\u00e8': '7', '_': '8', '\\u00e7': '9', '\\u00e0': '0'
  };
  const arabicMap: Record<string, string> = {
    '\\u0660': '0', '\\u0661': '1', '\\u0662': '2', '\\u0663': '3', '\\u0664': '4',
    '\\u0665': '5', '\\u0666': '6', '\\u0667': '7', '\\u0668': '8', '\\u0669': '9'
  };
  
  let mapped = '';
  for (const char of input) {
    mapped += azertyMap[char] || arabicMap[char] || char;
  }
  
  // Strip all non-numeric characters
  return mapped.replace(/\\D/g, '');
}`;

// Find and replace the whole existing sanitizeBarcode function
code = code.replace(/function sanitizeBarcode\([\s\S]*?\}\s*export/m, correctFunction + '\n\nexport');

fs.writeFileSync('src/contexts/BarcodeContext.tsx', code, 'utf8');
console.log('Fixed barcode scanner unicode characters');