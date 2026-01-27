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
import {
  requestCameraPermission,
  getLocation,
  getDeviceInfo,
} from "zmp-sdk/apis";
import { OfflineAttendanceService } from "../../services/offline-attendance";
import { WatermarkService } from "../../lib/watermark";

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
  onVerified: (
    photoDataUrl: string,
    metadata: { location?: any; deviceInfo?: any },
  ) => void;
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);

  // State: Camera Features
  const [beautyEnabled, setBeautyEnabled] = useState(true);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);

  // State: Media Stream
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Refs
  const displayCanvasRef = useRef<HTMLCanvasElement>(null); // Canvas for GPUPixel to render
  const captureCanvasRef = useRef<HTMLCanvasElement>(null); // Canvas for capture
  const videoSourceRef = useRef<HTMLVideoElement>(null); // Hidden video source
  const isMountedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const keepAliveIntervalRef = useRef<any>(null);
  const aggressivePlayIntervalRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);

  // --- GPUPixel Hook Integration ---
  const { isLoaded: isGPUPixelReady, error: gpuError } = useGPUPixel({
    canvasRef: displayCanvasRef,
    mediaStream,
    smoothing: 3,
    whitening: 4,
    enabled: beautyEnabled, // Toggle beauty processing
  });

  // --- VISIBILITY WORKAROUNDS ---

  const requestWakeLock = useCallback(async () => {
    if ("wakeLock" in navigator) {
      try {
        // @ts-ignore
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        console.log("[WakeLock] Screen wake lock acquired");
      } catch (err) {
        console.warn("[WakeLock] Failed:", err);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log("[WakeLock] Released");
      } catch (err) {
        console.warn("[WakeLock] Release failed:", err);
      }
    }
  }, []);

  // --- CAMERA LOGIC ---

  const stopCamera = useCallback(() => {
    console.log("[Camera] Stopping camera...");

    // Clear all intervals
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }

    if (aggressivePlayIntervalRef.current) {
      clearInterval(aggressivePlayIntervalRef.current);
      aggressivePlayIntervalRef.current = null;
    }

    // Release wake lock
    releaseWakeLock();

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log(`[Camera] Stopping track: ${track.label}`);
        track.stop();
      });
      streamRef.current = null;
    }

    // Clear video element
    if (videoSourceRef.current) {
      videoSourceRef.current.pause();
      videoSourceRef.current.srcObject = null;
      videoSourceRef.current.load();
    }

    setMediaStream(null);
    setIsFlashOn(false);
    setIsCameraLoading(false);
  }, [releaseWakeLock]);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      if (!isMountedRef.current) return;

      console.log("[Camera] Starting camera...", { deviceId, facing });
      setIsCameraLoading(true);
      setCameraError(null);

      try {
        // 1. Request Zalo permission
        // await requestCameraPermission({});

        // 2. Request wake lock
        // await requestWakeLock();

        // 3. Enumerate devices
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);
        console.log("[Camera] Found devices:", videoDevices.length);

        // 4. Build constraints - Lower resolution for stability
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            facingMode: deviceId
              ? undefined
              : facing === "front"
                ? "user"
                : "environment",
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 30, max: 30 },
          },
        };

        console.log("[Camera] Requesting with constraints:", constraints);

        // 5. Get stream
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!isMountedRef.current) {
          console.log("[Camera] Component unmounted, stopping stream");
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        console.log("[Camera] Stream obtained:", stream.id);
        streamRef.current = stream;

        // 6. Setup hidden video element as source for GPUPixel
        if (videoSourceRef.current) {
          const video = videoSourceRef.current;

          // Set all attributes
          video.muted = true;
          video.playsInline = true;
          video.autoplay = true;
          video.setAttribute("playsinline", "true");
          video.setAttribute("webkit-playsinline", "true");
          video.setAttribute("x-webkit-airplay", "deny");

          // Set srcObject
          video.srcObject = stream;

          // Force play
          const forcePlay = async () => {
            try {
              console.log("[Camera] Force playing video...");
              await video.play();
              console.log("[Camera] ✅ Video playing");
            } catch (err) {
              console.error("[Camera] ❌ Play failed:", err);

              setTimeout(async () => {
                try {
                  await video.play();
                  console.log("[Camera] ✅ Retry play succeeded");
                } catch (retryErr) {
                  console.error("[Camera] ❌ Retry failed:", retryErr);
                  setCameraError(
                    "Không thể phát video. Hãy chạm vào màn hình.",
                  );
                }
              }, 300);
            }
          };

          if (video.readyState >= 2) {
            await forcePlay();
          } else {
            video.onloadedmetadata = forcePlay;
          }

          // AGGRESSIVE PLAY INTERVAL - 500ms
          aggressivePlayIntervalRef.current = setInterval(async () => {
            if (video.paused && streamRef.current?.active) {
              console.warn("[Camera] 🔄 Video paused, force playing...");
              try {
                await video.play();
                console.log("[Camera] ✅ Resumed");
              } catch (err) {
                console.error("[Camera] ❌ Resume failed:", err);
              }
            }
          }, 500);

          // Touch handler
          const touchPlayHandler = async () => {
            if (video.paused) {
              try {
                await video.play();
                console.log("[Camera] ✅ Play by touch");
              } catch (err) {
                console.error("[Camera] ❌ Touch play failed:", err);
              }
            }
          };

          video.addEventListener("touchstart", touchPlayHandler);
          video.addEventListener("click", touchPlayHandler);
        }

        // Set stream to state (this will trigger GPUPixel hook)
        setMediaStream(stream);

        // 7. Track capabilities
        const track = stream.getVideoTracks()[0];

        track.addEventListener("ended", () => {
          console.error("[Camera] ❌ Track ended!");
          setCameraError("Camera bị ngắt kết nối.");
        });

        track.addEventListener("mute", () => {
          console.warn("[Camera] ⚠️ Track muted");
        });

        const capabilities = track.getCapabilities
          ? track.getCapabilities()
          : {};
        const settings = track.getSettings();

        console.log("[Camera] Track settings:", settings);

        // @ts-ignore
        setHasFlash(!!capabilities.torch);

        if (settings.deviceId) {
          setCurrentDeviceId(settings.deviceId);
        }

        // 8. Keep-alive
        keepAliveIntervalRef.current = setInterval(() => {
          if (streamRef.current && videoSourceRef.current) {
            const _ = videoSourceRef.current.currentTime;

            const tracks = streamRef.current.getVideoTracks();
            tracks.forEach((t) => {
              if (!t.enabled) {
                console.warn("[Camera] ⚠️ Re-enabling track");
                t.enabled = true;
              }
            });
          }
        }, 1000);

        console.log("[Camera] ✅ Setup complete");
      } catch (err: any) {
        console.error("[Camera] ❌ Error:", err);
        let message = "Không thể truy cập camera.";

        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          message = "Vui lòng cấp quyền camera trong cài đặt Zalo.";
        } else if (err.name === "NotFoundError") {
          message = "Không tìm thấy camera.";
        } else if (err.name === "NotReadableError") {
          message = "Camera đang được sử dụng bởi ứng dụng khác.";
        } else if (err.name === "OverconstrainedError") {
          message = "Thiết bị không hỗ trợ cấu hình này.";
        }

        setCameraError(message);
      } finally {
        if (isMountedRef.current) {
          setIsCameraLoading(false);
        }
      }
    },
    [facing, requestWakeLock, releaseWakeLock],
  );

  // --- HANDLERS ---

  const handleToggleCamera = useCallback(async () => {
    console.log("[Camera] Toggling camera");
    stopCamera();
    setFacing((prev) => (prev === "front" ? "back" : "front"));
    setTimeout(() => {
      if (isMountedRef.current) {
        startCamera();
      }
    }, 300);
  }, [stopCamera, startCamera]);

  const handleToggleFlash = useCallback(async () => {
    if (!mediaStream || !hasFlash) return;

    const track = mediaStream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        // @ts-ignore
        advanced: [{ torch: !isFlashOn }],
      });
      setIsFlashOn(!isFlashOn);
      console.log("[Camera] Flash toggled:", !isFlashOn);
    } catch (err) {
      console.error("[Camera] Flash toggle error:", err);
    }
  }, [mediaStream, hasFlash, isFlashOn]);

  const handleCapture = async () => {
    console.log("[Camera] Capturing photo");

    // UI Flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 300);

    // 1. Capture immediately from the appropriate canvas
    let sourceCanvas: HTMLCanvasElement | null = null;

    if (beautyEnabled && isGPUPixelReady && displayCanvasRef.current) {
      sourceCanvas = displayCanvasRef.current;
      console.log("[Capture] Using GPUPixel canvas");
    } else if (videoSourceRef.current && captureCanvasRef.current) {
      const video = videoSourceRef.current;
      const canvas = captureCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      sourceCanvas = canvas;
      console.log("[Capture] Using video canvas (fallback)");
    }

    if (!sourceCanvas) {
      setCameraError("Không thể chụp ảnh. Vui lòng thử lại.");
      return;
    }

    const dataUrl = sourceCanvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    setVerificationStatus("verifying");

    try {
      // 1. Fetch metadata in parallel with verification simulation
      const [location, deviceInfo] = await Promise.all([
        getLocation({}).catch(() => null),
        getDeviceInfo({}).catch(() => null),
        new Promise((resolve) => setTimeout(resolve, 500)), // Minimum simulation time
      ]);

      const lat = location ? Number(location.latitude) : 0;
      const lon = location ? Number(location.longitude) : 0;

      // 2. Get address from OSM (Reverse Geocoding)
      let addressStr = "";
      if (lat && lon) {
        addressStr =
          (await WatermarkService.getAddressFromCoordinates(lat, lon)) || "";
      }

      // 3. APPLY WATERMARK
      // We use the raw dataUrl captured from canvas
      const watermarkedDataUrl = await WatermarkService.addWatermark(dataUrl, {
        employeeCode: "NV-001", // This should be replaced with actual employee info if available
        latitude: lat,
        longitude: lon,
        address: addressStr,
        timestamp: new Date(),
      });

      setVerificationStatus("success");

      // 4. SAVE TO POSTPONE STORAGE IMMEDIATELY
      const metadata = {
        location: location
          ? {
              latitude: lat,
              longitude: lon,
            }
          : undefined,
        deviceInfo,
      };

      await OfflineAttendanceService.saveRecord(
        {
          type: (mode as any) || "check-in",
          timestamp: Date.now(),
          location: metadata.location,
          deviceInfo: metadata.deviceInfo,
        },
        watermarkedDataUrl, // LƯU ẢNH ĐÃ CÓ WATERMARK
      );

      console.log("[Camera] Saved watermarked record to offline storage");

      // Set captured image to the watermarked version for UI feedback
      setCapturedImage(watermarkedDataUrl);

      setTimeout(() => {
        onVerified(watermarkedDataUrl, metadata);
      }, 1000);
    } catch (err) {
      console.error("[Capture] Error during watermark/capture:", err);
      // Fallback: Still proceed but maybe without watermark
      setVerificationStatus("success");
      setTimeout(() => {
        onVerified(dataUrl, {});
      }, 1000);
    }
  };

  // --- LIFECYCLE ---

  useEffect(() => {
    isMountedRef.current = true;
    console.log("[Lifecycle] Modal opened:", isOpen);

    if (isOpen) {
      setVerificationStatus("idle");
      setCapturedImage(null);

      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          startCamera();
        }
      }, 300);

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

  // Monitor page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("[Visibility] Page hidden");
      } else {
        console.log("[Visibility] Page visible");
        if (videoSourceRef.current && streamRef.current?.active) {
          videoSourceRef.current.play().catch(console.error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // --- RENDER ---

  const modalConfig = MODAL_CONFIGS[mode as ModalConfigKey] ?? DEFAULT_CONFIG;
  const isBackCamera = facing === "back";
  const showError = !!cameraError; // Chỉ hiển thị lỗi nếu không truy cập được camera
  const showLoading =
    !showError &&
    (isCameraLoading ||
      (beautyEnabled && !isGPUPixelReady && !gpuError) || // Chỉ hiện loading beauty nếu chưa lỗi
      (isOpen && !mediaStream));

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
            {/* Hidden Video Source (for getUserMedia stream) */}
            <video
              ref={videoSourceRef}
              className="hidden"
              playsInline
              muted
              autoPlay
            />

            {/* Display Canvas (GPUPixel renders here) */}
            <canvas
              ref={displayCanvasRef}
              className={`absolute inset-0 h-full w-full object-cover ${
                !isBackCamera ? "transform scale-x-[-1]" : ""
              }`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 1,
              }}
            />

            {/* Capture Canvas (hidden, for fallback capture) */}
            <canvas ref={captureCanvasRef} className="hidden" />

            {/* Captured Image Overlay (Freeze frame during verification) */}
            {capturedImage && verificationStatus !== "idle" && (
              <img
                src={capturedImage}
                alt="Captured"
                className={`absolute inset-0 h-full w-full object-cover ${
                  !isBackCamera ? "transform scale-x-[-1]" : ""
                }`}
                style={{ zIndex: 5 }}
              />
            )}

            {/* Shutter Effect */}
            <div
              className={`absolute inset-0 rounded-full bg-white pointer-events-none transition-opacity duration-300 ${
                flashActive ? "opacity-100" : "opacity-0"
              }`}
              style={{ zIndex: 30 }}
            />

            {/* Success Overlay */}
            <div
              className={`absolute inset-0 rounded-full bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${
                verificationStatus === "success"
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              style={{ zIndex: 30 }}
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
              <div
                className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center"
                style={{ zIndex: 20 }}
              >
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-xs text-gray-400">
                  {isCameraLoading
                    ? "Khởi động camera..."
                    : beautyEnabled && !isGPUPixelReady
                      ? "Tải bộ lọc làm đẹp..."
                      : "Đang tải..."}
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {showError && (
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center bg-gray-900 text-white p-4 text-center"
                style={{ zIndex: 20 }}
              >
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

            {/* Scanning Overlay */}
            {!showLoading && !showError && verificationStatus !== "success" && (
              <div
                className={`absolute inset-0 bg-gradient-to-b from-transparent ${modalConfig.scanColor} to-transparent animate-scan pointer-events-none`}
                style={{ zIndex: 10 }}
              />
            )}
          </div>

          {/* CONTROLS */}
          {!showError &&
            (verificationStatus === "idle" ||
              verificationStatus === "verifying") && (
              <CameraControls
                devices={devices}
                toggleCamera={handleToggleCamera}
                isGPUPixelReady={isGPUPixelReady && !gpuError} // Disable toggle if errored
                beautyEnabled={beautyEnabled && !gpuError}
                toggleBeauty={() => {
                  if (!gpuError) setBeautyEnabled(!beautyEnabled);
                }}
                hasFlash={hasFlash}
                isFlashOn={isFlashOn}
                toggleFlash={handleToggleFlash}
                isLoading={showLoading || verificationStatus === "verifying"}
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
