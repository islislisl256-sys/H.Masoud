const fs = require('fs');
let code = fs.readFileSync('src/contexts/BarcodeContext.tsx', 'utf8');

const sanitizeFunction = `
function sanitizeBarcode(input: string) {
  const azertyMap: Record<string, string> = {
    '&': '1', 'é': '2', '"': '3', "'": '4', '(': '5',
    '-': '6', 'è': '7', '_': '8', 'ç': '9', 'à': '0'
  };
  const arabicMap: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  let mapped = '';
  for (const char of input) {
    mapped += azertyMap[char] || arabicMap[char] || char;
  }
  
  // Strip all non-numeric characters
  return mapped.replace(/\\D/g, '');
}
`;

// Insert sanitize function before BarcodeProvider
code = code.replace('export function BarcodeProvider', sanitizeFunction + '\nexport function BarcodeProvider');

// Replace setScannedBarcode(barcodeBuffer);
code = code.replace(
  'setScannedBarcode(barcodeBuffer);',
  `const cleanBarcode = sanitizeBarcode(barcodeBuffer);
          if (cleanBarcode.length >= 3) {
            setScannedBarcode(cleanBarcode);
          }`
);

fs.writeFileSync('src/contexts/BarcodeContext.tsx', code, 'utf8');
console.log('Fixed barcode scanner AZERTY/Arabic number mapping');