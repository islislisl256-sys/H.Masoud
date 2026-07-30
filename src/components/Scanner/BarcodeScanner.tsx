"use client";

import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // We use Html5QrcodeScanner because it provides a camera selection UI.
    // This is crucial because phones have multiple back cameras (wide, macro, etc)
    // and laptops have fixed focus. Allowing the user to pick the camera manually 
    // solves 99% of "it doesn't read" issues.
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10,
        qrbox: { width: 300, height: 150 },
        aspectRatio: 1.0,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ]
      },
      false
    );

    const handleScanSuccess = (decodedText: string) => {
      onScanSuccess(decodedText);
      if (scannerRef.current) {
         scannerRef.current.clear();
      }
    };

    scannerRef.current.render(handleScanSuccess, (err) => {
      if (onScanError) onScanError(err);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full mx-auto overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm [&>div]:border-none [&_button]:bg-primary [&_button]:text-white [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-md [&_button]:mt-2">
       <div id="qr-reader" className="w-full"></div>
    </div>
  );
};

export default BarcodeScanner;
