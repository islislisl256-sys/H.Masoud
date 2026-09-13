"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type BarcodeContextType = {
  scannedBarcode: string | null;
  clearBarcode: () => void;
  hardwareScannerActive: boolean;
  setHardwareScannerActive: (val: boolean) => void;
};

const BarcodeContext = createContext<BarcodeContextType | undefined>(undefined);

export function BarcodeProvider({ children }: { children: ReactNode }) {
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [hardwareScannerActive, setHardwareScannerActive] = useState<boolean>(true);

  useEffect(() => {
    if (!hardwareScannerActive) return;

    let barcodeBuffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // تجاهل الاختصارات مثل Ctrl+C
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const isInput = (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA';
      const currentTime = Date.now();
      
      // إذا كان الوقت بين الضغطات كبيراً، فهذه كتابة يدوية (نصفر المخزن)
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = "";
      }
      
      if (e.key === 'Enter') {
        // ماسح الباركود سريع جداً مقارنة بالكتابة اليدوية (أقل من 50 مللي ثانية بين الحروف)
        if (barcodeBuffer.length >= 3 && (!isInput || currentTime - lastKeyTime <= 50)) {
          e.preventDefault(); // منع الإرسال التلقائي للنماذج إذا كنا داخل Input
          setScannedBarcode(barcodeBuffer);
          barcodeBuffer = "";
        }
      } else if (e.key.length === 1) { 
        barcodeBuffer += e.key;
      }
      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hardwareScannerActive]);

  const clearBarcode = () => setScannedBarcode(null);

  return (
    <BarcodeContext.Provider value={{ scannedBarcode, clearBarcode, hardwareScannerActive, setHardwareScannerActive }}>
      {children}
    </BarcodeContext.Provider>
  );
}

export function useBarcode() {
  const context = useContext(BarcodeContext);
  if (context === undefined) {
    throw new Error("useBarcode must be used within a BarcodeProvider");
  }
  return context;
}
