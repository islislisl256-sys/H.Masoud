"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { RefreshCcw } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  defaultMode?: "environment" | "user";
  continuous?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onScanError, defaultMode = "environment", continuous = false }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanned = useRef<{text: string, time: number}>({ text: "", time: 0 });
  
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        if (defaultMode === "user") {
           const frontIndex = devices.findIndex(d => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('user') || d.label.toLowerCase().includes('أمامية'));
           setCurrentCameraIndex(frontIndex !== -1 ? frontIndex : 0);
        } else {
           const backIndex = devices.findIndex(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('خلفية'));
           setCurrentCameraIndex(backIndex !== -1 ? backIndex : (devices.length > 1 ? 1 : 0));
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
        qrbox: { width: 140, height: 220 }, // مستطيل عمودي للباركود
        aspectRatio: 0.5,
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
            if (continuous) {
              const now = Date.now();
              // Prevent ANY new scan within 2000ms of the last scan to avoid false positives 
              // when the camera is moving away or blurring.
              if (now - lastScanned.current.time < 2000) {
                return;
              }
              lastScanned.current = { text: decodedText, time: now };
              onScanSuccessRef.current(decodedText);
            } else {
              onScanSuccessRef.current(decodedText);
              scannerRef.current?.stop().catch(() => {});
            }
          },
          (errorMessage) => {
            if (onScanErrorRef.current) onScanErrorRef.current(errorMessage);
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
  }, [currentCameraIndex, cameras, isInitializing, continuous]);

  return (
    <div className="w-full mx-auto overflow-hidden rounded-xl bg-gray-900 shadow-inner relative flex flex-col items-center justify-center">
       <div id="qr-reader" className="w-full h-full [&_video]:object-cover"></div>
       <div className="absolute inset-0 border-4 border-primary/50 pointer-events-none rounded-xl"></div>
    </div>
  );
};

export default BarcodeScanner;
