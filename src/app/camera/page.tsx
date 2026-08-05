import React from 'react';
import PhoneCameraPicker from '@/components/PhoneCameraPicker';

/**
 * صفحة مستقلة لفتح كاميرا الهاتف واختيار صورة.
 * يمكن الوصول إليها عبر المسار `/camera`.
 */
export default function CameraPage() {
  const handleCapture = (dataUrl: string) => {
    console.log('صورة ملتقطة (Base64):', dataUrl);
    // يمكن إرسال dataUrl إلى خادم أو معالج الباركود حسب الحاجة
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <h1 className="mb-6 text-2xl font-bold text-white">التقط صورة باستخدام هاتفك</h1>
      <PhoneCameraPicker onCapture={handleCapture} label="التقاط صورة" />
    </div>
  );
}
