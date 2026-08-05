// "use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { RefreshCcw, Flashlight, FlashlightOff, Camera, Info } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  /**
   * Optional callback when a photo is captured via the capture button.
   * Receives the image as a Data URL (base64) for custom handling.
   */
  onCaptureImage?: (dataUrl: string) => void;
  defaultMode?: "environment" | "user";
  continuous?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  defaultMode = "environment",
  continuous = false,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanned = useRef<{ text: string; time: number }>({ text: "", time: 0 });
  const scanBuffer = useRef<string[]>([]);

  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [showCameraList, setShowCameraList] = useState(false);
  const [showCameraInfo, setShowCameraInfo] = useState(false);
  const [showCameraCapabilities, setShowCameraCapabilities] = useState(false);
  const [cameraCapabilities, setCameraCapabilities] = useState<any>(null);
  const [frontCameraId, setFrontCameraId] = useState<string | null>(null);
  const [rearCameraId, setRearCameraId] = useState<string | null>(null);
  // Manual camera toggle state (true = using front camera)
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  // ---------------------------------------------------------------------
  // Camera discovery – store front & rear IDs for automatic switching
  // ---------------------------------------------------------------------
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setAvailableCameras(devices);
          // Detect macro/close‑up lens first
          const macro = devices.find((d) => /macro|close|zoom|near|2/.test(d.label.toLowerCase()));
          if (macro) {
            setActiveCameraId(macro.id);
            setRearCameraId(macro.id);
          } else {
            const back = devices.find((d) =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('environment') ||
                d.label.toLowerCase().includes('rear')
              );
            const front = devices.find((d) =>
                d.label.toLowerCase().includes('front') ||
                d.label.toLowerCase().includes('user')
              );
            if (back) {
                setRearCameraId(back.id);
            }
            if (front) setFrontCameraId(front.id);
            // Initialize active camera based on preference (rear first)
            if (back) {
                setActiveCameraId(back.id);
                setUseFrontCamera(false);
            } else if (front) {
                setActiveCameraId(front.id);
                setUseFrontCamera(true);
            } else if (devices[0]) {
                setActiveCameraId(devices[0].id);
                setUseFrontCamera(false);
            }
          }
        }
      })
      .catch(console.error);
  }, []);

  // ---------------------------------------------------------------------
  // Start / restart scanner whenever the chosen camera changes
  // ---------------------------------------------------------------------
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
        qrbox: { width: 140, height: 220 },
        aspectRatio: 0.5,
        disableFlip: true,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
        ],
      };

      try {
        const cameraConfig = activeCameraId
          ? { deviceId: { exact: activeCameraId } }
          : defaultMode === "user"
          ? { facingMode: "user" }
          : { facingMode: { exact: "environment" } };

        await scannerRef.current.start(
          cameraConfig,
          config,
          (decodedText) => {
            // Buffer to allow 2‑frame verification
            scanBuffer.current.push(decodedText);
            if (scanBuffer.current.length > 2) scanBuffer.current.shift();
            if (scanBuffer.current.length < 2 || scanBuffer.current[0] !== scanBuffer.current[1]) return;

            if (continuous) {
              const now = Date.now();
              if (lastScanned.current.text === decodedText && now - lastScanned.current.time < 400) return;
              lastScanned.current = { text: decodedText, time: now };
              onScanSuccessRef.current(decodedText);
              scanBuffer.current = [];
            } else {
              onScanSuccessRef.current(decodedText);
              scannerRef.current?.stop().catch(() => {});
            }
          },
          (errorMessage) => {
            if (onScanErrorRef.current) onScanErrorRef.current(errorMessage);
          }
        );

        // Auto‑torch detection (optional)
        setTimeout(async () => {
          if (scannerRef.current?.isScanning) {
            const track = (scannerRef.current as any).getRunningTrack?.();
            if (track) {
              const caps = track.getCapabilities?.();
              setCameraCapabilities(caps);
              if (caps && caps.torch) {
                setHasTorch(true);
                try {
                  await (scannerRef.current as any).applyVideoConstraints({ advanced: [{ torch: true }] });
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
          scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {});
        } else {
          scannerRef.current.clear();
        }
      }
    };
  }, [defaultMode, continuous, activeCameraId]);

  const toggleTorch = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await (scannerRef.current as any).applyVideoConstraints({
          advanced: [{ torch: !isTorchOn }],
        });
        setIsTorchOn(!isTorchOn);
      } catch (err) {
        console.error("Failed to toggle torch", err);
      }
    }
  };

  // -------------------------------------------------------------
  // Capture a photo from the device (native camera / gallery)
  // -------------------------------------------------------------
  const handleFileCapture = async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      // Read the image as a Data URL for custom handling.
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (onCaptureImage) {
          onCaptureImage(dataUrl);
        } else if (onScanSuccessRef.current) {
          // Fallback: try to scan the image.
          Html5Qrcode.scanFile(file, true)
            .then((result) => {
              if (result) onScanSuccessRef.current(result);
            })
            .catch((e) => {
              if (onScanErrorRef.current) onScanErrorRef.current((e as Error).message);
            });
        }
      };
      reader.readAsDataURL(file);
    };

  return (
    <div className="w-full mx-auto overflow-hidden rounded-xl bg-gray-900 shadow-inner relative flex flex-col items-center justify-center">
      <div id="qr-reader" className="w-full h-full [&_video]:object-cover"></div>
      <div className="absolute inset-0 border-4 border-primary/50 pointer-events-none rounded-xl"></div>

      {/* Torch button */}
      {hasTorch && (
        <button
          onClick={toggleTorch}
          className="absolute bottom-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors z-10 shadow-lg border border-white/20"
          title="تشغيل/إطفاء الفلاش"
        >
          {isTorchOn ? <Flashlight className="h-6 w-6 text-yellow-400" /> : <FlashlightOff className="h-6 w-6" />}
        </button>
      )}

      {/* Camera list button */}
      <button
        onClick={() => setShowCameraList(true)}
        className="absolute bottom-4 left-4 p-3 bg-primary/80 backdrop-blur-md rounded-full text-white hover:bg-primary transition-colors z-10 shadow-lg border border-white/20"
        title="اختر كاميرا"
      >
        <Camera className="h-6 w-6" />
      </button>

      {/* Camera info button */}
      <button
        onClick={() => setShowCameraInfo(true)}
        className="absolute bottom-4 left-12 p-3 bg-green-600/80 backdrop-blur-md rounded-full text-white hover:bg-green-500 transition-colors z-10 shadow-lg border border-white/20"
        title="معلومات الكاميرا"
      >
        <Info className="h-6 w-6" />
      </button>

      {/* Camera capabilities button */}
      <button
        onClick={() => setShowCameraCapabilities(true)}
        className="absolute bottom-4 left-20 p-3 bg-indigo-600/80 backdrop-blur-md rounded-full text-white hover:bg-indigo-500 transition-colors z-10 shadow-lg border border-white/20"
        title="إمكانيات الكاميرا"
      >
        <Info className="h-6 w-6" />
      </button>

      {/* Manual camera switch button */}
      <button
        onClick={() => {
          // Toggle between front and rear if both are available.
          if (frontCameraId && rearCameraId) {
            const useFront = !useFrontCamera;
            setUseFrontCamera(useFront);
            setActiveCameraId(useFront ? frontCameraId : rearCameraId);
          }
        }}
        className={`absolute bottom-4 left-28 p-3 ${useFrontCamera ? "bg-teal-500" : "bg-gray-700"} backdrop-blur-md rounded-full text-white hover:${useFrontCamera ? "bg-teal-600" : "bg-gray-600"} transition-colors z-10 shadow-lg border border-white/20`}
        title="تبديل الكاميرا"
      >
        {/* Use a rotate/refresh icon to indicate switching */}
        <RefreshCcw className="h-6 w-6" />
      </button>

      {/* Capture photo button (native) */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-4 left-36 p-3 bg-teal-600/80 backdrop-blur-md rounded-full text-white hover:bg-teal-500 transition-colors z-10 shadow-lg border border-white/20"
        title="التقاط صورة"
      >
        <Camera className="h-6 w-6" />
      </button>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => handleFileCapture(e.target.files)}
      />

      {/* Camera capabilities modal */}
      {showCameraCapabilities && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-4 max-w-md w-full max-h-[80vh] overflow-auto shadow-lg text-white">
            <h2 className="text-lg font-medium mb-3">إمكانيات الكاميرا</h2>
            <pre className="text-xs bg-black p-2 rounded overflow-auto">
{JSON.stringify(cameraCapabilities, null, 2)}
            </pre>
            <button onClick={() => setShowCameraCapabilities(false)} className="mt-4 w-full px-3 py-2 bg-indigo-600 rounded">
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Camera info modal */}
      {showCameraInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-4 max-w-md w-full max-h-[80vh] overflow-auto shadow-lg">
            <h2 className="text-lg font-medium mb-3 text-white">معلومات الكاميرات المتوفرة</h2>
            <ul className="space-y-2">
              {availableCameras.map((cam) => (
                <li key={cam.id} className="text-white">
                  <strong>{cam.label || cam.id}</strong>
                  <br />
                  <span className="text-gray-400">ID: {cam.id}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowCameraInfo(false)} className="mt-4 w-full px-3 py-2 bg-primary/80 hover:bg-primary rounded text-white">
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Camera list modal */}
      {showCameraList && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-4 max-w-md w-full max-h-[80vh] overflow-auto shadow-lg">
            <h2 className="text-lg font-medium mb-3 text-white">قائمة الكاميرات المتوفرة</h2>
            <ul className="space-y-2">
              {availableCameras.map((cam) => (
                <li key={cam.id}>
                  <button
                    onClick={() => {
                      setActiveCameraId(cam.id);
                      setShowCameraList(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    {cam.label || cam.id}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowCameraList(false)} className="mt-4 w-full px-3 py-2 bg-primary/80 hover:bg-primary rounded text-white">
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
