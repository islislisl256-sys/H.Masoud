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
  const scanBuffer = useRef<string[]>([]);
  
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
            if (continuous) {
              const now = Date.now();
              // Cooldown of 300ms between scans of the same item
              if (lastScanned.current.text === decodedText && now - lastScanned.current.time < 300) {
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
  }, [defaultMode, continuous]);

  return (
    <div className="w-full mx-auto overflow-hidden rounded-xl bg-gray-900 shadow-inner relative flex flex-col items-center justify-center">
       <div id="qr-reader" className="w-full h-full [&_video]:object-cover"></div>
       <div className="absolute inset-0 border-4 border-primary/50 pointer-events-none rounded-xl"></div>
    </div>
  );
};

export default BarcodeScanner;
