const fs = require('fs');
let code = fs.readFileSync('src/app/products/page.tsx', 'utf8');

// Fix the garbled arabic text by string replacement
code = code.replace(/toast\(". S \? "\^ \(." \?S .\? \^ "\)O \^S. \r\n\? ".ŝ \^Ν.", \{ icon: 's\?' \}\);/g, `toast("تم تخطي رفع الصورة (مشكلة في متصفحك أو اتصالك)، وسيتم حفظ المنتج بدونها.", { icon: '⚠️' });`);

code = code.replace(/toast\(". S \^  ".ŝ  "\^ "'\S..", \{ icon: 's\r\n\?' \}\);/g, `toast("تم تخطي صورة أحد المنتجات بسبب الحاسوب القديم.", { icon: '⚠️' });`);

// Or just do a raw replace of the whole try/catch block for image upload
const regex1 = /try \{\s*finalImageUrl = await uploadToCloudinary\(rawP.image_file\);\s*\} catch \(imgErr\) \{\s*console.error\("Image upload failed:", imgErr\);\s*toast\([^;]+\);\s*finalImageUrl = null;\s*\}/g;

code = code.replace(regex1, `try {
            finalImageUrl = await uploadToCloudinary(rawP.image_file);
          } catch (imgErr) {
            console.error("Image upload failed:", imgErr);
            toast("تم تخطي رفع الصورة (بسبب المتصفح القديم)، وسيتم حفظ المنتج بدونها.", { icon: '⚠️' });
            finalImageUrl = null;
          }`);

fs.writeFileSync('src/app/products/page.tsx', code, 'utf8');
console.log('Fixed encoding');