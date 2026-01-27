import {
  Camera,
  Loader2,
  SwitchCamera,
  Zap,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, Box, Text } from "zmp-ui";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useGPUPixel } from "../../hooks/useGPUPixel";

// --- CONFIGURATIONS ---
const MODAL_CONFIGS = {
  "check-in": {
    title: "Xác thực khuôn mặt - Giờ vào",
    confirmText: "Xác nhận vào ca",
    color: "emerald",
    borderColor: "border-emerald-500",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    scanColor: "via-emerald-500/10",
    glowColor: "text-emerald-500",
  },
  "check-out": {
    title: "Xác thực khuôn mặt - Giờ ra",
    confirmText: "Xác nhận ra ca",
    color: "rose",
    borderColor: "border-rose-500",
    buttonColor: "bg-rose-600 hover:bg-rose-700",
    scanColor: "via-rose-500/10",
    glowColor: "text-rose-500",
  },
  pause: {
    title: "Xác thực tạm nghỉ",
    confirmText: "Xác nhận tạm nghỉ",
    color: "amber",
    borderColor: "border-amber-500",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
    scanColor: "via-amber-500/10",
    glowColor: "text-amber-500",
  },
  resume: {
    title: "Xác thực làm lại",
    confirmText: "Xác nhận làm lại",
    color: "emerald",
    borderColor: "border-emerald-500",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    scanColor: "via-emerald-500/10",
    glowColor: "text-emerald-500",
  },
  "group-attendance": {
    title: "Chấm công nhóm",
    confirmText: "Xác nhận chấm công nhóm",
    color: "blue",
    borderColor: "border-blue-500",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    scanColor: "via-blue-500/10",
    glowColor: "text-blue-500",
  },
} as const;

const DEFAULT_CONFIG = {
  title: "Xác thực khuôn mặt",
  confirmText: "Xác nhận",
  color: "emerald",
  borderColor: "border-emerald-500",
  buttonColor: "bg-emerald-600 hover:bg-emerald-700",
  scanColor: "via-emerald-500/10",
  glowColor: "text-emerald-500",
} as const;

type ModalConfigKey = keyof typeof MODAL_CONFIGS;

// --- SUB-COMPONENTS ---

interface CameraControlsProps {
  devices: MediaDeviceInfo[];
  toggleCamera: () => void;
  isGPUPixelReady: boolean;
  beautyEnabled: boolean;
  toggleBeauty: () => void;
  hasFlash: boolean;
  isFlashOn: boolean;
  toggleFlash: () => void;
  isLoading?: boolean;
}

const CameraControls = memo(function CameraControls({
  devices,
  toggleCamera,
  isGPUPixelReady,
  beautyEnabled,
  toggleBeauty,
  hasFlash,
  isFlashOn,
  toggleFlash,
  isLoading,
}: CameraControlsProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-6">
      {/* Switch Camera */}
      <button
        onClick={toggleCamera}
        disabled={isLoading || devices.length < 2}
        className={`flex flex-col items-center gap-1.5 group ${
          isLoading || devices.length < 2 ? "opacity-40 cursor-not-allowed" : ""
        }`}
      >
        <div className="h-11 w-11 rounded-full flex items-center justify-center border transition-all bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-active:scale-95">
          <SwitchCamera className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
          {devices.length > 1 ? "Đổi" : "1 Camera"}
        </span>
      </button>

      {/* Beauty Toggle */}
      <button
        onClick={toggleBeauty}
        disabled={isLoading || !isGPUPixelReady}
        className={`flex flex-col items-center gap-1.5 group ${
          isLoading || !isGPUPixelReady ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all ${
            beautyEnabled && isGPUPixelReady && !isLoading
              ? "bg-pink-500 border-pink-400 text-white group-active:scale-95"
              : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-active:scale-95"
          }`}
        >
          <Sparkles
            className={`h-5 w-5 ${
              beautyEnabled && isGPUPixelReady && !isLoading
                ? "fill-current text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-medium ${
            beautyEnabled && isGPUPixelReady && !isLoading
              ? "text-pink-600 dark:text-pink-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Làm đẹp
        </span>
      </button>

      {/* Flash Toggle */}
      <button
        onClick={toggleFlash}
        disabled={isLoading || !hasFlash}
        className={`flex flex-col items-center gap-1.5 group ${
          isLoading || !hasFlash ? "opacity-40 cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all ${
            isLoading || !hasFlash
              ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              : isFlashOn
                ? "bg-yellow-500 border-yellow-400 text-white group-active:scale-95"
                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-active:scale-95"
          }`}
        >
          <Zap
            className={`h-5 w-5 ${
              isFlashOn && hasFlash && !isLoading
                ? "fill-current text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-medium ${
            isFlashOn && hasFlash && !isLoading
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {isFlashOn && hasFlash && !isLoading ? "Bật" : "Tắt"}
        </span>
      </button>
    </div>
  );
});

// --- MAIN COMPONENT ---

interface FaceVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: string;
  currentTime: Date;
  onVerified: (photoDataUrl: string) => void;
}

export function FaceVerificationModal({
  isOpen,
  onOpenChange,
  mode,
  currentTime,
  onVerified,
}: FaceVerificationModalProps) {
  // State: UI & Status
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success"
  >("idle");
  const [flashActive, setFlashActive] = useState(false); // UI Flash effect

  // State: Camera Features
  const [beautyEnabled, setBeautyEnabled] = useState(true);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);

  // State: Media Stream
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMountedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const isStartingRef = useRef(false);
  const devicesRef = useRef<MediaDeviceInfo[]>([]);

  // --- GPUPixel Hook Integration ---
  // Hook now just receives the stream and paints the canvas.
  // It doesn't care about camera devices or permissions.
  const { isLoaded: isGPUPixelReady, error: gpuError } = useGPUPixel({
    canvasRef,
    mediaStream,
    smoothing: 3,
    whitening: 4,
    enabled: beautyEnabled, // Toggle beauty processing
  });

  // --- CAMERA LOGIC ---

  const stopCamera = useCallback(() => {
    console.log("[FaceVerificationModal] stopCamera called");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("[FaceVerificationModal] Stopped track:", track.label);
      });
      streamRef.current = null;
    }
    setMediaStream(null);
    setIsFlashOn(false);
    setIsCameraLoading(false);
    isStartingRef.current = false;
  }, []);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      console.log("[FaceVerificationModal] startCamera called", { 
        deviceId, 
        isStarting: isStartingRef.current,
        isMounted: isMountedRef.current 
      });
      
      if (isStartingRef.current || !isMountedRef.current) return;

      isStartingRef.current = true;
      setIsCameraLoading(true);
      setCameraError(null);

      try {
        // 1. Get Devices (if first time)
        if (devicesRef.current.length === 0) {
          console.log("[FaceVerificationModal] Enumerating devices...");
          const deviceInfos = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = deviceInfos.filter((d) => d.kind === "videoinput");
          setDevices(videoDevices);
          devicesRef.current = videoDevices;
          console.log("[FaceVerificationModal] Found devices:", videoDevices.length);
        }

        // 2. Constraints
        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : {
                facingMode: "user",
                width: { ideal: 1280 }, 
                height: { ideal: 720 },
              },
          audio: false,
        };

        // 3. Get Stream
        console.log("[FaceVerificationModal] Requesting getUserMedia...", constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Final mount check
        if (!isMountedRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        console.log("[FaceVerificationModal] getUserMedia success");
        
        streamRef.current = stream;
        setMediaStream(stream);

        // 4. Check Capabilities
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        if (settings.deviceId) setCurrentDeviceId(settings.deviceId);

        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        // @ts-ignore
        setHasFlash(!!capabilities.torch);
      } catch (err: any) {
        console.error("[FaceVerificationModal] Camera Error:", err);
        let message = "Không thể truy cập camera.";
        if (err.name === "NotAllowedError") message = "Vui lòng cấp quyền truy cập camera.";
        else if (err.name === "NotFoundError") message = "Không tìm thấy camera.";
        else if (err.name === "NotReadableError") message = "Camera đang được sử dụng bởi ứng dụng khác.";
        setCameraError(message);
      } finally {
        setIsCameraLoading(false);
        isStartingRef.current = false;
      }
    },
    [], // Completely stable
  );

  // --- HANDLERS ---

  const handleToggleCamera = useCallback(async () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(
      (d) => d.deviceId === currentDeviceId,
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    await startCamera(devices[nextIndex].deviceId);
  }, [devices, currentDeviceId, startCamera]);

  const handleToggleFlash = useCallback(async () => {
    if (!mediaStream || !hasFlash) return;
    const track = mediaStream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !isFlashOn } as any],
      });
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error("Flash Toggle Error:", err);
    }
  }, [mediaStream, hasFlash, isFlashOn]);

  const handleCapture = () => {
    if (!canvasRef.current) return;

    setVerificationStatus("verifying");

    // UI Effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 300);

    setTimeout(() => {
      // Capture directly from the canvas that the hook is painting to
      const dataUrl = canvasRef.current!.toDataURL("image/jpeg", 0.9);

      setVerificationStatus("success");
      setTimeout(() => {
        onVerified(dataUrl);
      }, 1500);
    }, 1500);
  };

  // --- LIFECYCLE ---

  useEffect(() => {
    isMountedRef.current = true;
    console.log("[FaceVerificationModal] useEffect triggered", { isOpen });
    
    if (isOpen) {
      setVerificationStatus("idle");
      // Delayed start to ensure UI sheet is fully expanded
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          startCamera();
        }
      }, 500); 

      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }

    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // --- RENDER HELPERS ---
  const modalConfig = MODAL_CONFIGS[mode as ModalConfigKey] ?? DEFAULT_CONFIG;
  const isBackCamera = devices
    .find((d) => d.deviceId === currentDeviceId)
    ?.label.toLowerCase()
    .includes("back");
  // showLoading: True if camera is starting, or beauty filter is not ready,
  // or if the modal is open but we don't have a media stream yet.
  const showError = !!cameraError || !!gpuError;
  const showLoading = !showError && (isCameraLoading || !isGPUPixelReady || (isOpen && !mediaStream));

  return (
    <Sheet
      visible={isOpen}
      onClose={() => onOpenChange(false)}
      autoHeight
      mask
      swipeToClose
      title={modalConfig.title}
    >
      <Box className="flex flex-col h-full overflow-hidden p-4">
        <Box className="flex-none mb-4">
          <Text className="text-gray-500 text-sm">
            Vui lòng đưa khuôn mặt vào khung hình để xác thực danh tính.
          </Text>
        </Box>

        <Box className="flex-1 flex flex-col items-center">
          {/* CAMERA CONTAINER */}
          <div
            className={`relative shrink-0 h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 rounded-full overflow-hidden border-4 ${
              verificationStatus === "success"
                ? "border-green-500 shadow-green-500/50"
                : modalConfig.borderColor
            } shadow-2xl bg-black ${modalConfig.glowColor} ${
              verificationStatus === "verifying" ? "animate-border-glow" : ""
            } group transition-all duration-500`}
          >
            {/* The single canvas used by useGPUPixel */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 ${
                !isBackCamera ? "transform scale-x-[-1]" : ""
              } ${showLoading || showError ? "opacity-0" : "opacity-100"}`}
            />

            {/* Shutter Effect */}
            <div
              className={`absolute inset-0 rounded-full bg-white pointer-events-none z-30 transition-opacity duration-300 ${
                flashActive ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Success Overlay */}
            <div
              className={`absolute inset-0 rounded-full bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${
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
              <p className="text-white font-semibold text-base tracking-wide">
                Xác thực thành công
              </p>
            </div>

            {/* Loading Overlay */}
            {showLoading && (
              <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center z-20">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-xs text-gray-400">
                  {isCameraLoading
                    ? "Khởi động camera..."
                    : "Tải bộ lọc làm đẹp..."}
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {showError && (
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-gray-900 text-white p-4 text-center z-20">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <p className="text-xs text-red-400">
                    {cameraError || gpuError}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startCamera(currentDeviceId)}
                    className="mt-2 h-7 text-xs border-red-500/30 hover:bg-red-900/20 text-red-300"
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            )}

            {/* Scanning Overlay Effect */}
            {!showLoading && !showError && verificationStatus !== "success" && (
              <div
                className={`absolute inset-0 bg-gradient-to-b from-transparent ${modalConfig.scanColor} to-transparent animate-scan pointer-events-none z-10`}
              ></div>
            )}
          </div>

          {/* CONTROLS */}
          {!showError && verificationStatus === "idle" && (
            <CameraControls
              devices={devices}
              toggleCamera={handleToggleCamera}
              isGPUPixelReady={isGPUPixelReady}
              beautyEnabled={beautyEnabled}
              toggleBeauty={() => setBeautyEnabled(!beautyEnabled)}
              hasFlash={hasFlash}
              isFlashOn={isFlashOn}
              toggleFlash={handleToggleFlash}
              isLoading={showLoading}
            />
          )}

          <Box className="mt-4 text-center space-y-1">
            <Text className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              Thời gian hiện tại
            </Text>
            <Text className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
              {currentTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </Box>
        </Box>

        <Box className="flex-none pt-6 pb-4 gap-2 flex flex-col">
          <Button
            onClick={handleCapture}
            disabled={verificationStatus !== "idle" || showError || showLoading}
            className={`w-full ${
              verificationStatus === "success"
                ? "bg-green-600 hover:bg-green-700"
                : modalConfig.buttonColor
            } text-white h-12 text-lg shadow-lg active:scale-[0.98] transition-all`}
          >
            {verificationStatus === "verifying" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xác thực...
              </>
            ) : verificationStatus === "success" ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Đã xác thực
              </>
            ) : (
              <>
                <Camera className="mr-2 h-5 w-5" />
                {modalConfig.confirmText}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            disabled={verificationStatus !== "idle"}
            onClick={() => onOpenChange(false)}
          >
            {verificationStatus === "success" ? "Đóng" : "Hủy bỏ"}
          </Button>
        </Box>
      </Box>
    </Sheet>
  );
}
