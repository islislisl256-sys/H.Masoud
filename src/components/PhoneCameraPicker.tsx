import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

/**
 * Simple component that opens the native camera/gallery on mobile devices.
 * It uses an invisible <input type="file" capture="environment"> to trigger
 * the device camera. When a photo is selected, the component calls
 * `onCapture` with the Data URL of the image.
 */
interface PhoneCameraPickerProps {
  /**
   * Called with the captured image as a base64 Data URL.
   */
  onCapture?: (dataUrl: string) => void;
  /**
   * Optional button label (Arabic). Defaults to "كاميرا".
   */
  label?: string;
}

const PhoneCameraPicker: React.FC<PhoneCameraPickerProps> = ({
  onCapture,
  label = 'كاميرا',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (onCapture) onCapture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-3 bg-teal-600/80 rounded-full text-white hover:bg-teal-5 transition-colors shadow-lg"
        title={label}
      >
        <Camera className="h-6 w-6" />
      </button>
      <span className="mt-2 text-sm text-gray-300">{label}</span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
};

export default PhoneCameraPicker;
