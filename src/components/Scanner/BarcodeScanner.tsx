"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { RefreshCcw } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  defaultMode?: "environment" | "user";
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onScanError, defaultMode = "environment" }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        if (defaultMode === "user") {
          setCurrentCameraIndex(0); // usually front
        } else {
          setCurrentCameraIndex(devices.length > 1 ? 1 : 0);
        }
      }
    }).catch(err => {
      console.error("Error getting cameras", err);
    }).finally(() => {
      setIsInitializing(false);
    });
  }, []);

  useEffect(() => {
    if (isInitializing || cameras.length === 0) return;

    const startScanner = async () => {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      const config = {
        fps: 10,
        qrbox: { width: 300, height: 150 }, // مستطيل مناسب للباركود
        aspectRatio: 1.0,
        disableFlip: true,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
        ]
      };

      try {
        const cameraId = cameras[currentCameraIndex].id;
        await scannerRef.current.start(
          cameraId,
          config,
          (decodedText) => {
            onScanSuccess(decodedText);
            scannerRef.current?.stop().catch(() => {});
          },
          (errorMessage) => {
            if (onScanError) onScanError(errorMessage);
          }
        );
      } catch (err) {
        console.error("Failed to start camera", err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          }).catch(() => {});
        } else {
          scannerRef.current.clear();
        }
      }
    };
  }, [currentCameraIndex, cameras, isInitializing, onScanSuccess, onScanError]);

  const toggleCamera = () => {
    if (cameras.length > 1) {
      // Cycle through all available cameras
      setCurrentCameraIndex((prevIndex) => (prevIndex + 1) % cameras.length);
    }
  };

  return (
    <div className="w-full mx-auto overflow-hidden rounded-xl bg-gray-900 shadow-inner relative flex flex-col items-center justify-center min-h-[250px] max-w-[300px]">
       <div id="qr-reader" className="w-full h-full [&_video]:object-cover"></div>
       <div className="absolute inset-0 border-4 border-primary/50 pointer-events-none rounded-xl"></div>
       
       {cameras.length > 1 && (
         <button 
           onClick={toggleCamera}
           className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors z-10 flex items-center justify-center"
           title="تبديل الكاميرا"
         >
           <RefreshCcw className="h-5 w-5" />
           <span className="absolute -top-6 bg-black/80 text-xs px-2 py-1 rounded">
             {currentCameraIndex + 1}/{cameras.length}
           </span>
         </button>
       )}
    </div>
  );
};

export default BarcodeScanner;
