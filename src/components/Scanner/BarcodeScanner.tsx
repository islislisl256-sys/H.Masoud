"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { RefreshCcw } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  continuous?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onScanError, continuous = false }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanned = useRef<{text: string, time: number}>({ text: "", time: 0 });
  const scanBuffer = useRef<string[]>([]);
  
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        // Filter out front/user cameras to only cycle through back cameras
        const backCameras = devices.filter(d => 
          !d.label.toLowerCase().includes('front') && 
          !d.label.toLowerCase().includes('user') && 
          !d.label.toLowerCase().includes('أمامية')
        );
        const finalCameras = backCameras.length > 0 ? backCameras : devices;
        setCameras(finalCameras);
      }
    }).catch(err => console.error("Error getting cameras", err));
  }, []);

  const handleDoubleClick = () => {
    if (cameras.length > 1) {
       const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
       const nextIndex = (currentIndex + 1) % cameras.length;
       setCurrentCameraId(cameras[nextIndex].id);
    }
  };

  useEffect(() => {
    const startScanner = async () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          try {
            await scannerRef.current.stop();
          } catch (e) {}
        }
        scannerRef.current.clear();
      }

      scannerRef.current = new Html5Qrcode("qr-reader");

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
        const cameraConfig = currentCameraId ? currentCameraId : { facingMode: "environment" };
        await scannerRef.current.start(
          cameraConfig,
          config,
          (decodedText) => {
            // Buffer to require 2 identical consecutive reads for accuracy
            scanBuffer.current.push(decodedText);
            if (scanBuffer.current.length > 2) {
              scanBuffer.current.shift();
            }
            if (scanBuffer.current.length < 2 || scanBuffer.current[0] !== scanBuffer.current[1]) {
               return; // Wait for next frame to confirm
            }

            if (continuous) {
              const now = Date.now();
              // Cooldown of 400ms between scans of the same item
              if (lastScanned.current.text === decodedText && now - lastScanned.current.time < 400) {
                return;
              }
              lastScanned.current = { text: decodedText, time: now };
              onScanSuccessRef.current(decodedText);
              scanBuffer.current = []; // Clear buffer after success
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
  }, [continuous, currentCameraId]);

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className="w-full mx-auto overflow-hidden rounded-xl bg-gray-900 shadow-inner relative flex flex-col items-center justify-center cursor-pointer"
      title="اضغط مرتين للتنقل بين الكاميرات الخلفية"
    >
       <div id="qr-reader" className="w-full h-full [&_video]:object-cover"></div>
       <div className="absolute inset-0 border-4 border-primary/50 pointer-events-none rounded-xl"></div>
    </div>
  );
};

export default BarcodeScanner;
