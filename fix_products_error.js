const fs = require('fs');
let code = fs.readFileSync('src/app/products/page.tsx', 'utf8');

// Update saveSingle
code = code.replace(
/try\s*\{\s*if\s*\(rawP.image_file\)\s*\{\s*finalImageUrl\s*=\s*await\s*uploadToCloudinary\(rawP.image_file\);\s*\}/,
`try {
        if (rawP.image_file) {
          try {
            finalImageUrl = await uploadToCloudinary(rawP.image_file);
          } catch (imgErr) {
            console.error("Image upload failed:", imgErr);
            toast("تم تخطي رفع الصورة (مشكلة في متصفحك أو اتصالك)، وسيتم حفظ المنتج بدونها.", { icon: '⚠️' });
            finalImageUrl = null;
          }
        }`
);

// Update saveAll
code = code.replace(
/try\s*\{\s*let\s*finalImageUrl\s*=\s*rawP.image_url;\s*if\s*\(rawP.image_file\)\s*\{\s*finalImageUrl\s*=\s*await\s*uploadToCloudinary\(rawP.image_file\);\s*\}/,
`try {
          let finalImageUrl = rawP.image_url;
          if (rawP.image_file) {
            try {
              finalImageUrl = await uploadToCloudinary(rawP.image_file);
            } catch (imgErr) {
              console.error("Image upload failed:", imgErr);
              toast("تم تخطي صورة أحد المنتجات بسبب الحاسوب القديم.", { icon: '⚠️' });
              finalImageUrl = null;
            }
          }`
);

// Also update the catch blocks to ignore fetch/time errors or display nice message.
code = code.replace(
/toast\(" ŝ "\?: " \+ error.message\);/g,
`if (error.message && (error.message.includes('fetch') || error.message.includes('JWT'))) {
              toast("تم رفض العملية من السيرفر. يرجى تحديث المتصفح وتعديل وقت الحاسوب.");
            } else {
              toast("خطأ: " + error.message);
            }`
);

fs.writeFileSync('src/app/products/page.tsx', code, 'utf8');
console.log("Updated products page to tolerate errors on old computers.");