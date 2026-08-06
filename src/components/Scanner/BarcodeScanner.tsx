"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const camerasRef = useRef<CameraDevice[]>([]);
  const currentCameraIndexRef = useRef<number>(0);
  const isSwitchingRef = useRef(false);
  const lastTapRef = useRef<number>(0);
  
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  const [cameraCount, setCameraCount] = useState(0);

  const scanConfig = {
    fps: 10,
    qrbox: { width: 140, height: 220 },
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

  const handleDecode = useCallback((decodedText: string) => {
    // Buffer to require 2 identical consecutive reads for accuracy
    scanBuffer.current.push(decodedText);
    if (scanBuffer.current.length > 2) {
      scanBuffer.current.shift();
    }
    if (scanBuffer.current.length < 2 || scanBuffer.current[0] !== scanBuffer.current[1]) {
      return;
    }

    if (continuous) {
      const now = Date.now();
      if (lastScanned.current.text === decodedText && now - lastScanned.current.time < 400) {
        return;
      }
      lastScanned.current = { text: decodedText, time: now };
      onScanSuccessRef.current(decodedText);
      scanBuffer.current = [];
    } else {
      onScanSuccessRef.current(decodedText);
      scannerRef.current?.stop().catch(() => {});
    }
  }, [continuous]);

  const handleDecodeError = useCallback((errorMessage: string) => {
    if (onScanErrorRef.current) onScanErrorRef.current(errorMessage);
  }, []);

  // Start scanner with a specific camera
  const startWithCamera = useCallback(async (cameraIdOrConfig: string | { facingMode: string }) => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }
    try {
      await scannerRef.current.start(
        cameraIdOrConfig,
        scanConfig,
        handleDecode,
        handleDecodeError
      );
    } catch (err) {
      console.error("Failed to start camera", err);
    }
  }, [handleDecode, handleDecodeError]);

  // Switch to next back camera imperatively (no React state change)
  const switchCamera = useCallback(async () => {
    if (isSwitchingRef.current) return;
    if (camerasRef.current.length <= 1) return;

    isSwitchingRef.current = true;
    try {
      // Stop current scanner
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current?.clear();
      scannerRef.current = new Html5Qrcode("qr-reader");

      // Cycle to next camera
      currentCameraIndexRef.current = (currentCameraIndexRef.current + 1) % camerasRef.current.length;
      const nextCameraId = camerasRef.current[currentCameraIndexRef.current].id;

      // Clear scan buffer
      scanBuffer.current = [];

      // Start with new camera
      await startWithCamera(nextCameraId);
    } catch (err) {
      console.error("Failed to switch camera", err);
    } finally {
      isSwitchingRef.current = false;
    }
  }, [startWithCamera]);

  // Handle double-tap via touch events (works on all mobile devices)
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 350 && timeSinceLastTap > 50) {
      // Double tap detected!
      e.preventDefault();
      e.stopPropagation();
      switchCamera();
      lastTapRef.current = 0; // Reset to prevent triple-tap
    } else {
      lastTapRef.current = now;
    }
  }, [switchCamera]);

  // Initial mount: get cameras and start scanner
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (cancelled || !devices || devices.length === 0) return;

        // Filter to back cameras only
        const backCameras = devices.filter(d => {
          const label = d.label.toLowerCase();
          return !label.includes('front') && !label.includes('user') && !label.includes('أمامية');
        });
        const finalCameras = backCameras.length > 0 ? backCameras : devices;
        
        camerasRef.current = finalCameras;
        setCameraCount(finalCameras.length);

        // Start with facingMode environment (let browser pick best back camera)
        await startWithCamera({ facingMode: "environment" });
      } catch (err) {
        console.error("Error initializing scanner", err);
      }
    };

    init();

    return () => {
      cancelled = true;
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
  }, []); // Only run once on mount

  return (
    <div 
      onTouchEnd={handleTouchEnd}
      onDoubleClick={() => switchCamera()} 
      className="w-full mx-auto overflow-hidden rounded-xl bg-gray-900 shadow-inner relative flex flex-col items-center justify-center"
      style={{ touchAction: 'manipulation' }}
    >
       <div id="qr-reader" className="w-full h-full [&_video]:object-cover"></div>
       <div className="absolute inset-0 border-4 border-primary/50 pointer-events-none rounded-xl"></div>
       {cameraCount > 1 && (
         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full pointer-events-none backdrop-blur-sm">
           اضغط مرتين للتبديل بين العدسات ({cameraCount})
         </div>
       )}
    </div>
  );
};

export default BarcodeScanner;
