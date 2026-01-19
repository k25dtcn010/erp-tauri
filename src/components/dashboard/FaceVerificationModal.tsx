import {
  Camera,
  Loader2,
  SwitchCamera,
  Zap,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useGPUPixel } from "@/hooks/useGPUPixel";

// Hoisted outside component to avoid recreation on every render (rendering-hoist-jsx)
const MODAL_CONFIGS = {
  "check-in": {
    title: "Face Verification Check In",
    confirmText: "Confirm Check In",
    color: "emerald",
    borderColor: "border-emerald-500",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    scanColor: "via-emerald-500/10",
    glowColor: "text-emerald-500",
  },
  "check-out": {
    title: "Face Verification Check Out",
    confirmText: "Confirm Check Out",
    color: "rose",
    borderColor: "border-rose-500",
    buttonColor: "bg-rose-600 hover:bg-rose-700",
    scanColor: "via-rose-500/10",
    glowColor: "text-rose-500",
  },
  pause: {
    title: "Verify to Pause Work",
    confirmText: "Confirm Pause",
    color: "amber",
    borderColor: "border-amber-500",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
    scanColor: "via-amber-500/10",
    glowColor: "text-amber-500",
  },
  resume: {
    title: "Verify to Resume Work",
    confirmText: "Confirm Resume",
    color: "emerald",
    borderColor: "border-emerald-500",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    scanColor: "via-emerald-500/10",
    glowColor: "text-emerald-500",
  },
} as const;

const DEFAULT_CONFIG = {
  title: "Face Verification",
  confirmText: "Confirm",
  color: "emerald",
  borderColor: "border-emerald-500",
  buttonColor: "bg-emerald-600 hover:bg-emerald-700",
  scanColor: "via-emerald-500/10",
  glowColor: "text-emerald-500",
} as const;

type ModalConfigKey = keyof typeof MODAL_CONFIGS;

// Memoized CameraControls component (rerender-memo)
interface CameraControlsProps {
  devices: MediaDeviceInfo[];
  toggleCamera: () => void;
  isGPUPixelAvailable: boolean;
  beautyEnabled: boolean;
  toggleBeauty: () => void;
  hasFlash: boolean;
  isFlashOn: boolean;
  isUsingGPUPixel: boolean;
  toggleFlash: () => void;
}

const CameraControls = memo(function CameraControls({
  devices,
  toggleCamera,
  isGPUPixelAvailable,
  beautyEnabled,
  toggleBeauty,
  hasFlash,
  isFlashOn,
  isUsingGPUPixel,
  toggleFlash,
}: CameraControlsProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-6">
      {/* Switch Camera - always show, disable if only 1 camera */}
      <button
        onClick={toggleCamera}
        disabled={devices.length < 2}
        className={`flex flex-col items-center gap-1.5 group ${
          devices.length < 2 ? "opacity-40 cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all ${
            devices.length < 2
              ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-active:scale-95"
          }`}
        >
          <SwitchCamera className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
          {devices.length > 1 ? "Flip" : "1 Camera"}
        </span>
      </button>

      {/* Beauty Toggle - show when GPUPixel available */}
      {isGPUPixelAvailable && (
        <button
          onClick={toggleBeauty}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div
            className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all ${
              beautyEnabled
                ? "bg-pink-500 border-pink-400 text-white group-active:scale-95"
                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-active:scale-95"
            }`}
          >
            <Sparkles
              className={`h-5 w-5 ${
                beautyEnabled
                  ? "fill-current text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            />
          </div>
          <span
            className={`text-[10px] font-medium ${
              beautyEnabled
                ? "text-pink-600 dark:text-pink-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {beautyEnabled ? "Beauty On" : "Beauty"}
          </span>
        </button>
      )}

      {/* Flash Toggle - always show, disable if no flash */}
      <button
        onClick={toggleFlash}
        disabled={!hasFlash || isUsingGPUPixel}
        className={`flex flex-col items-center gap-1.5 group ${
          !hasFlash || isUsingGPUPixel ? "opacity-40 cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all ${
            !hasFlash || isUsingGPUPixel
              ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              : isFlashOn
                ? "bg-yellow-500 border-yellow-400 text-white group-active:scale-95"
                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-active:scale-95"
          }`}
        >
          <Zap
            className={`h-5 w-5 ${
              isFlashOn && hasFlash && !isUsingGPUPixel
                ? "fill-current text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-medium ${
            isFlashOn && hasFlash && !isUsingGPUPixel
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {!hasFlash
            ? "No Flash"
            : isUsingGPUPixel
              ? "N/A"
              : isFlashOn
                ? "On"
                : "Flash"}
        </span>
      </button>
    </div>
  );
});

interface FaceVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: string;
  currentTime: Date;
  onVerified: (photoDataUrl: string) => void;
}

const CANVAS_ID = "face-verification-canvas";

export function FaceVerificationModal({
  isOpen,
  onOpenChange,
  mode,
  currentTime,
  onVerified,
}: FaceVerificationModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success"
  >("idle");
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [beautyEnabled, setBeautyEnabled] = useState(true);

  // Camera capabilities for non-GPUPixel mode
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  // GPUPixel hook
  const {
    isLoading: isGPUPixelLoading,
    isActive: isGPUPixelActive,
    error: gpuPixelError,
    isGPUPixelAvailable,
    startCamera: startGPUPixelCamera,
    stopCamera: stopGPUPixelCamera,
    pauseCamera: pauseGPUPixelCamera,
    capture: captureGPUPixel,
    setBeauty,
  } = useGPUPixel({
    canvasId: CANVAS_ID,
    smoothing: 3,
    whitening: 4,
  });

  // Stop all camera resources
  const stopAllCameras = useCallback(() => {
    // Stop GPUPixel
    stopGPUPixelCamera();

    // Stop native stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsFlashOn(false);
    hasStartedRef.current = false;
  }, [stopGPUPixelCamera]);

  // Start native camera (fallback or device switching)
  const startNativeCamera = useCallback(async (deviceId?: string) => {
    setCameraError(null);
    setIsLoadingCamera(true);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    try {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceInfos.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: "user" },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as Record<string, unknown>;
      setHasFlash(!!capabilities?.torch);

      const settings = track.getSettings();
      if (settings.deviceId) {
        setCurrentDeviceId(settings.deviceId);
      }

      // Draw video to canvas for display
      if (canvasRef.current && videoRef.current) {
        const drawLoop = () => {
          if (videoRef.current && canvasRef.current && streamRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (
              ctx &&
              videoRef.current.videoWidth &&
              videoRef.current.videoHeight
            ) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              ctx.drawImage(
                videoRef.current,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height,
              );
            }
            animationFrameRef.current = requestAnimationFrame(drawLoop);
          }
        };
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          drawLoop();
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(
        "Could not access camera. Please ensure permissions are granted.",
      );
    } finally {
      setIsLoadingCamera(false);
    }
  }, []);

  // Main camera start function
  const startCamera = useCallback(async () => {
    // Prevent double start
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    setCameraError(null);

    // Get device list first
    try {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceInfos.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
    } catch {
      // Ignore enumeration errors
    }

    // Try GPUPixel first if available
    if (isGPUPixelAvailable && beautyEnabled) {
      console.log(
        "[FaceVerification] Starting camera with GPUPixel beauty filter",
      );
      startGPUPixelCamera();
      return;
    }

    // Fallback to native camera
    await startNativeCamera();
  }, [
    isGPUPixelAvailable,
    beautyEnabled,
    startGPUPixelCamera,
    startNativeCamera,
  ]);

  const toggleCamera = async () => {
    if (devices.length < 2) return;

    // Need to stop GPUPixel and use native for device switching
    if (isGPUPixelActive) {
      stopGPUPixelCamera();
    }

    const currentIndex = devices.findIndex(
      (d) => d.deviceId === currentDeviceId,
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];

    await startNativeCamera(nextDevice.deviceId);
  };

  const toggleFlash = async () => {
    if (!streamRef.current || !hasFlash) return;

    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !isFlashOn } as MediaTrackConstraintSet],
      });
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error("Error toggling flash:", err);
    }
  };

  // Use functional setState for stable callback (rerender-functional-setstate)
  const toggleBeauty = useCallback(() => {
    setBeautyEnabled((prev) => {
      const newValue = !prev;
      if (newValue) {
        setBeauty(3, 4); // Default beauty params
      } else {
        setBeauty(0, 0); // Disable beauty
      }
      return newValue;
    });
  }, [setBeauty]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      // Reset state
      setVerificationStatus("idle");
      hasStartedRef.current = false;

      // Small delay to ensure canvas is mounted
      const timer = setTimeout(() => {
        startCamera();
      }, 100);

      return () => clearTimeout(timer);
    } else {
      stopAllCameras();
    }
  }, [isOpen]); // Only depend on isOpen

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllCameras();
    };
  }, [stopAllCameras]);

  const handleCameraConfirm = () => {
    setVerificationStatus("verifying");

    // Pause camera during verification
    if (isGPUPixelActive) {
      pauseGPUPixelCamera();
    }

    // Simulate verification delay
    setTimeout(() => {
      // 1. Capture Logic
      let photoDataUrl = "";

      // Try GPUPixel capture first
      if (isGPUPixelActive) {
        const captured = captureGPUPixel();
        if (captured) {
          photoDataUrl = captured;
        }
      }

      // Fallback to canvas or video capture
      if (!photoDataUrl) {
        if (canvasRef.current) {
          photoDataUrl = canvasRef.current.toDataURL("image/jpeg");
        } else if (videoRef.current) {
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const track = streamRef.current?.getVideoTracks()[0];
            const facingMode = track?.getSettings().facingMode;

            if (facingMode === "user" || !facingMode) {
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
            }

            ctx.drawImage(videoRef.current, 0, 0);
            photoDataUrl = canvas.toDataURL("image/jpeg");
          }
        }
      }

      // 2. Trigger Flash Effect
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 300);

      // 3. Show Success State
      setVerificationStatus("success");

      // 4. Complete Process
      setTimeout(() => {
        onVerified(photoDataUrl);
      }, 1500);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Use hoisted config map for better performance (js-cache-function-results)
  const modalConfig = MODAL_CONFIGS[mode as ModalConfigKey] ?? DEFAULT_CONFIG;

  // Determine loading/error states
  const isUsingGPUPixel = isGPUPixelActive || isGPUPixelLoading;
  const isLoading = isLoadingCamera || isGPUPixelLoading;
  const hasError = cameraError || gpuPixelError;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{modalConfig.title}</DrawerTitle>
            <DrawerDescription>
              Please position your face within the frame to verify your
              identity.
              {beautyEnabled && isGPUPixelAvailable && (
                <span className="ml-1 text-pink-500">✨ Beauty mode on</span>
              )}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex flex-col items-center justify-center">
            {/* Camera Frame Container */}
            <div
              className={`relative h-72 w-72 rounded-full overflow-hidden border-4 ${
                verificationStatus === "success"
                  ? "border-green-500 shadow-green-500/50"
                  : modalConfig.borderColor
              } shadow-2xl bg-black ${modalConfig.glowColor} ${
                verificationStatus === "verifying" ? "animate-border-glow" : ""
              } group transition-all duration-500`}
            >
              {/* Hidden Video Element for native fallback */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
              />

              {/* Display Canvas - Used by GPUPixel or native fallback */}
              <canvas
                ref={canvasRef}
                id={CANVAS_ID}
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 ${
                  devices
                    .find((d) => d.deviceId === currentDeviceId)
                    ?.label.toLowerCase()
                    .includes("back")
                    ? ""
                    : "transform scale-x-[-1]"
                } ${isLoading || hasError ? "invisible" : "visible"}`}
              />

              {/* Shutter/Flash Effect */}
              <div
                className={`absolute inset-0 bg-white pointer-events-none z-30 transition-opacity duration-300 ${
                  flashActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Success Overlay */}
              <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${
                  verificationStatus === "success"
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <div
                  className={`rounded-full p-3 mb-3 bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/40 transition-all duration-500 ease-out ${
                    verificationStatus === "success"
                      ? "scale-100 opacity-100"
                      : "scale-50 opacity-0"
                  }`}
                >
                  <CheckCircle2 className="h-8 w-8 text-white drop-shadow-md" />
                </div>
                <p
                  className={`text-white font-semibold text-base tracking-wide transition-all duration-500 delay-150 ease-out ${
                    verificationStatus === "success"
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  Verified Successfully
                </p>
              </div>

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center z-20">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                  <p className="text-xs text-gray-400">
                    {isGPUPixelLoading
                      ? "Loading Beauty Filter..."
                      : "Starting Camera..."}
                  </p>
                </div>
              )}

              {/* Error Overlay */}
              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-4 text-center z-20">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <p className="text-xs text-red-400">
                      {cameraError || gpuPixelError}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        hasStartedRef.current = false;
                        startCamera();
                      }}
                      className="mt-2 h-7 text-xs border-red-500/30 hover:bg-red-900/20 text-red-300"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Overlays (only visible when active and inactive error/success) */}
              {!isLoading && !hasError && verificationStatus !== "success" && (
                <>
                  {/* Overlay scanning effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b from-transparent ${modalConfig.scanColor} to-transparent animate-scan pointer-events-none z-10`}
                  ></div>
                </>
              )}
            </div>

            {/* Camera Controls Bar - Always Visible when camera active */}
            {/* Use memoized CameraControls component (rerender-memo) */}
            {!isLoading && !hasError && verificationStatus === "idle" && (
              <CameraControls
                devices={devices}
                toggleCamera={toggleCamera}
                isGPUPixelAvailable={isGPUPixelAvailable}
                beautyEnabled={beautyEnabled}
                toggleBeauty={toggleBeauty}
                hasFlash={hasFlash}
                isFlashOn={isFlashOn}
                isUsingGPUPixel={isUsingGPUPixel}
                toggleFlash={toggleFlash}
              />
            )}

            <div className="mt-6 text-center space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current Time
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                {formatTime(currentTime)}
              </p>
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <Button
              onClick={handleCameraConfirm}
              disabled={
                verificationStatus !== "idle" || !!hasError || isLoading
              }
              className={`w-full ${
                verificationStatus === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : modalConfig.buttonColor
              } text-white h-12 text-lg shadow-lg shadow-${modalConfig.color}-500/20 active:scale-[0.98] transition-all`}
            >
              {verificationStatus === "verifying" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : verificationStatus === "success" ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Verified Success
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-5 w-5" />
                  {modalConfig.confirmText}
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="w-full mt-2"
                disabled={verificationStatus !== "idle"}
              >
                {verificationStatus === "success" ? "Close" : "Cancel"}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
