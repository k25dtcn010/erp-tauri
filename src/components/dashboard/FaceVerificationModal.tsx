import {
  Camera,
  Loader2,
  SwitchCamera,
  Zap,
  ZapOff,
  AlertCircle,
  CheckCircle2,
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
import { useEffect, useState, useRef, useCallback } from "react";

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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success"
  >("idle");
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  // Camera capabilities
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraError(null);
    setIsLoadingCamera(true);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
      const capabilities = track.getCapabilities() as any;
      setHasFlash(!!capabilities?.torch);

      const settings = track.getSettings();
      if (settings.deviceId) {
        setCurrentDeviceId(settings.deviceId);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (deviceId) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        } catch (retryErr) {
          setCameraError(
            "Could not access camera. Please ensure permissions are granted.",
          );
        }
      } else {
        setCameraError(
          "Could not access camera. Please ensure permissions are granted.",
        );
      }
    } finally {
      setIsLoadingCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setIsFlashOn(false);
  }, []);

  const toggleCamera = async () => {
    if (devices.length < 2) return;

    const currentIndex = devices.findIndex(
      (d) => d.deviceId === currentDeviceId,
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];

    await startCamera(nextDevice.deviceId);
  };

  const toggleFlash = async () => {
    if (!streamRef.current || !hasFlash) return;

    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !isFlashOn } as any],
      });
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error("Error toggling flash:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setVerificationStatus("idle");
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleCameraConfirm = () => {
    setVerificationStatus("verifying");

    // Simulate verification delay
    setTimeout(() => {
      // 1. Capture Logic
      let photoDataUrl = "";
      if (videoRef.current) {
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

  const getModalConfig = () => {
    switch (mode) {
      case "check-in":
        return {
          title: "Face Verification Check In",
          confirmText: "Confirm Check In",
          color: "emerald",
          borderColor: "border-emerald-500",
          buttonColor: "bg-emerald-600 hover:bg-emerald-700",
          scanColor: "via-emerald-500/10",
          glowColor: "text-emerald-500",
        };
      case "check-out":
        return {
          title: "Face Verification Check Out",
          confirmText: "Confirm Check Out",
          color: "rose",
          borderColor: "border-rose-500",
          buttonColor: "bg-rose-600 hover:bg-rose-700",
          scanColor: "via-rose-500/10",
          glowColor: "text-rose-500",
        };
      case "pause":
        return {
          title: "Verify to Pause Work",
          confirmText: "Confirm Pause",
          color: "amber",
          borderColor: "border-amber-500",
          buttonColor: "bg-amber-600 hover:bg-amber-700",
          scanColor: "via-amber-500/10",
          glowColor: "text-amber-500",
        };
      case "resume":
        return {
          title: "Verify to Resume Work",
          confirmText: "Confirm Resume",
          color: "emerald",
          borderColor: "border-emerald-500",
          buttonColor: "bg-emerald-600 hover:bg-emerald-700",
          scanColor: "via-emerald-500/10",
          glowColor: "text-emerald-500",
        };
      default:
        return {
          title: "Face Verification",
          confirmText: "Confirm",
          color: "emerald",
          borderColor: "border-emerald-500",
          buttonColor: "bg-emerald-600 hover:bg-emerald-700",
          scanColor: "via-emerald-500/10",
          glowColor: "text-emerald-500",
        };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{modalConfig.title}</DrawerTitle>
            <DrawerDescription>
              Please position your face within the frame to verify your
              identity.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex flex-col items-center justify-center">
            {/* Camera FrameContainer */}
            <div
              className={`relative h-72 w-72 rounded-full overflow-hidden border-4 ${
                verificationStatus === "success"
                  ? "border-green-500 shadow-green-500/50"
                  : modalConfig.borderColor
              } shadow-2xl bg-black ${modalConfig.glowColor} ${
                verificationStatus === "verifying" ? "animate-border-glow" : ""
              } group transition-all duration-500`}
            >
              {/* Video Element - Always Mounted */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => videoRef.current?.play()}
                className={`h-full w-full object-cover transition-transform duration-300 ${
                  devices
                    .find((d) => d.deviceId === currentDeviceId)
                    ?.label.toLowerCase()
                    .includes("back")
                    ? ""
                    : "transform scale-x-[-1]"
                }`}
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
              {isLoadingCamera && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center z-20">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                  <p className="text-xs text-gray-400">Starting Camera...</p>
                </div>
              )}

              {/* Error Overlay */}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-4 text-center z-20">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <p className="text-xs text-red-400">{cameraError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startCamera()}
                      className="mt-2 h-7 text-xs border-red-500/30 hover:bg-red-900/20 text-red-300"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Overlays (only visible when active and inactive error/success) */}
              {!isLoadingCamera &&
                !cameraError &&
                verificationStatus !== "success" && (
                  <>
                    {/* Overlay scanning effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-b from-transparent ${modalConfig.scanColor} to-transparent animate-scan pointer-events-none z-10`}
                    ></div>

                    {/* Camera Controls Overlay */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {devices.length > 1 && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-black/70 text-white"
                          onClick={toggleCamera}
                          disabled={verificationStatus === "verifying"}
                        >
                          <SwitchCamera className="h-4 w-4" />
                        </Button>
                      )}

                      {hasFlash && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className={`h-9 w-9 rounded-full backdrop-blur-sm border border-white/10 ${
                            isFlashOn
                              ? "bg-yellow-500/80 text-white hover:bg-yellow-500"
                              : "bg-black/50 text-white hover:bg-black/70"
                          }`}
                          onClick={toggleFlash}
                          disabled={verificationStatus === "verifying"}
                        >
                          {isFlashOn ? (
                            <ZapOff className="h-4 w-4" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                )}
            </div>

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
                verificationStatus !== "idle" ||
                !!cameraError ||
                isLoadingCamera
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
