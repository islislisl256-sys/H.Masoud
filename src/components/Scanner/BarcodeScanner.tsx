"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { RefreshCcw, Flashlight, FlashlightOff } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  defaultMode?: "environment" | "user";
  continuous?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onScanError, defaultMode = "environment", continuous = false }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanned = useRef<{text: string, time: number}>({ text: "", time: 0 });
  const scanBuffer = useRef<string[]>([]);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
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
        const cameraConfig = { facingMode: defaultMode === "user" ? "user" : "environment" };
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

        // Check if torch is supported and turn it on automatically
        setTimeout(async () => {
          if (scannerRef.current?.isScanning) {
            const track = (scannerRef.current as any).getRunningTrack?.();
            if (track) {
              const capabilities = track.getCapabilities?.();
              if (capabilities && capabilities.torch) {
                setHasTorch(true);
                try {
                  await (scannerRef.current as any).applyVideoConstraints({
                    advanced: [{ torch: true }]
                  });
                  setIsTorchOn(true);
                } catch (e) {
                  console.error("Auto torch failed", e);
                }
              }
            }
          }
        }, 1000);

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
  }, [defaultMode, continuous]);

  const toggleTorch = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await (scannerRef.current as any).applyVideoConstraints({
          advanced: [{ torch: !isTorchOn }]
        });
        setIsTorchOn(!isTorchOn);
      } catch (err) {
        console.error("Failed to toggle torch", err);
      }
    }
  };

  return (
    <div className="w-full mx-auto overflow-hidden rounded-xl bg-gray-900 shadow-inner relative flex flex-col items-center justify-center">
       <div id="qr-reader" className="w-full h-full [&_video]:object-cover"></div>
       <div className="absolute inset-0 border-4 border-primary/50 pointer-events-none rounded-xl"></div>
       
       {hasTorch && (
         <button
           onClick={toggleTorch}
           className="absolute bottom-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors z-10 shadow-lg border border-white/20"
           title="تشغيل/إطفاء الفلاش"
         >
           {isTorchOn ? <Flashlight className="h-6 w-6 text-yellow-400" /> : <FlashlightOff className="h-6 w-6" />}
         </button>
       )}
    </div>
  );
};

export default BarcodeScanner;
