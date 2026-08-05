"use client";
import React, { useRef } from 'react';
import { Camera, Image, QrCode } from 'lucide-react';

/**
 * مكوّن يُظهر أربعة خيارات للتقاط صورة أو اختيارها من المعرض:
 *  - كاميرا خلفية (environment)
 *  - كاميرا أمامية (user)
 *  - اختيار صورة من المعرض
 *  - مسح صورة/QR (بدون توجيه للكاميرا)
 *
 * يتم إرجاع الـ Data URL لل‑image إلى `onCapture` مع إشارة للمصدر.
 */
interface PhoneCameraPickerProps {
  /**
   * يُستدعى بعد اختيار أو التقاط صورة.
   * @param dataUrl الصورة كـ base64 Data URL
   * @param source   مصدر الصورة: 'rear' | 'front' | 'gallery' | 'scan' | 'upload'
   */
  onCapture?: (dataUrl: string, source: 'rear' | 'front' | 'gallery' | 'scan' | 'upload') => void;
  /**
   * Handler for explicit upload action (e.g., after adding a product).
   */
  onUpload?: () => void;
  /**
   * تسمية زرّ الوجهة (اختياري). الافتراضي "كاميرا".
   */
  label?: string;
}

const PhoneCameraPicker: React.FC<PhoneCameraPickerProps> = ({
  onCapture,
  label = 'كاميرا',
}) => {
  const rearRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, source: 'rear' | 'front' | 'gallery' | 'scan' | 'upload') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onCapture?.(dataUrl, source);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* كاميرا خلفية */}
      <button
        onClick={() => rearRef.current?.click()}
        className="p-3 bg-teal-600/80 rounded-full text-white hover:bg-teal-500 transition-colors shadow-lg"
        title="كاميرا خلفية"
      >
        <Camera className="h-6 w-6" />
      </button>
      {/* كاميرا أمامية */}
      <button
        onClick={() => frontRef.current?.click()}
        className="p-3 bg-indigo-600/80 rounded-full text-white hover:bg-indigo-500 transition-colors shadow-lg"
        title="كاميرا أمامية"
      >
        <Camera className="h-6 w-6" />
      </button>
      {/* اختيار من المعرض */}
      <button
        onClick={() => galleryRef.current?.click()}
        className="p-3 bg-amber-600/80 rounded-full text-white hover:bg-amber-500 transition-colors shadow-lg"
        title="اختيار صورة من المعرض"
      >
        <Image className="h-6 w-6" />
      </button>
      {/* مسح */}
      <button
        onClick={() => scanRef.current?.click()}
        className="p-3 bg-purple-600/80 rounded-full text-white hover:bg-purple-500 transition-colors shadow-lg"
        title="مسح صورة/QR"
      >
        <QrCode className="h-6 w-6" />
      </button>
      {/* رفع (upload) */}
      <button
        onClick={() => uploadRef.current?.click()}
        className="p-3 bg-green-600/80 rounded-full text-white hover:bg-green-500 transition-colors shadow-lg"
        title="رفع صورة"
      >
        <Image className="h-6 w-6" />
      </button>

      {/* الحقول المخفية */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={rearRef}
        style={{ display: 'none' }}
        onChange={e => handleFile(e, 'rear')}
      />
      <input
        type="file"
        accept="image/*"
        capture="user"
        ref={frontRef}
        style={{ display: 'none' }}
        onChange={e => handleFile(e, 'front')}
      />
      <input
        type="file"
        accept="image/*"
        ref={galleryRef}
        style={{ display: 'none' }}
        onChange={e => handleFile(e, 'gallery')}
      />
      <input
        type="file"
        accept="image/*"
        ref={scanRef}
        style={{ display: 'none' }}
        onChange={e => handleFile(e, 'scan')}
      />
      <input
        type="file"
        accept="image/*"
        ref={uploadRef}
        style={{ display: 'none' }}
        onChange={e => handleFile(e, 'upload')}
      />
      <span className="mt-2 text-sm text-gray-300">{label}</span>
    </div>
  );
};

export default PhoneCameraPicker;
