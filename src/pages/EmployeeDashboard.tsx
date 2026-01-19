import {
  Bell,
  Fingerprint,
  CalendarClock,
  Briefcase,
  Hourglass,
  MapPin,
  RefreshCw,
  Calendar,
  FileClock,
  Receipt,
  Users,
  Pause,
  Play,
  Square,
  Coffee,
  Camera,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useState, useRef } from "react";
import {
  checkPermissions,
  requestPermissions,
  watchPosition,
  clearWatch,
  Position,
} from "@tauri-apps/plugin-geolocation";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { cn } from "@/lib/utils";

// Fix Leaflet's default icon path issues with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

export function EmployeeDashboard() {
  const [location, setLocation] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const [workStatus, setWorkStatus] = useState<"idle" | "working" | "paused">(
    "idle",
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<string>("check-in");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle work timer
  useEffect(() => {
    if (workStatus === "working") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [workStatus]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(
        "Could not access camera. Please ensure permissions are granted.",
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isCheckInModalOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCheckInModalOpen]);

  const handleStartWork = () => {
    setModalMode("check-in");
    setIsCheckInModalOpen(true);
  };

  const handleEndWork = () => {
    setModalMode("check-out");
    setIsCheckInModalOpen(true);
  };

  const handleCameraConfirm = () => {
    setIsVerifying(true);

    // Simulate verification delay
    setTimeout(() => {
      // Capture photo
      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Flip horizontally to match the mirrored video feed
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0);
          const photoDataUrl = canvas.toDataURL("image/jpeg");
          console.log(
            `${modalMode} photo captured:`,
            photoDataUrl.substring(0, 50) + "...",
          );
          // Here you would typically upload photoDataUrl to your server
        }
      }

      stopCamera();
      setIsCheckInModalOpen(false);
      setIsVerifying(false);

      if (modalMode === "check-in") {
        setWorkStatus("working");
        if (!startTime) {
          setStartTime(new Date());
        }
      } else if (modalMode === "pause") {
        setWorkStatus("paused");
      } else if (modalMode === "resume") {
        setWorkStatus("working");
      } else {
        setWorkStatus("idle");
        setStartTime(null);
        setElapsedSeconds(0);
      }
    }, 2000);
  };

  const handlePauseWork = () => {
    setModalMode(workStatus === "working" ? "pause" : "resume");
    setIsCheckInModalOpen(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDurationParts = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      h: h.toString().padStart(2, "0"),
      m: m.toString().padStart(2, "0"),
      s: s.toString().padStart(2, "0"),
    };
  };

  const startTracking = async () => {
    setLoading(true);
    try {
      let permissions = await checkPermissions();
      if (
        permissions.location === "prompt" ||
        permissions.location === "prompt-with-rationale"
      ) {
        permissions = await requestPermissions(["location"]);
      }

      if (permissions.location === "granted") {
        if (watchIdRef.current !== null) {
          await clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }

        const id = await watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
          (pos) => {
            if (pos) {
              setLocation(pos);
            }
            setLoading(false);
          },
        );
        watchIdRef.current = id;
      } else {
        console.error("Permission denied");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      console.error("Failed to start tracking");
      setLoading(false);
    }
  };

  useEffect(() => {
    startTracking();

    return () => {
      if (watchIdRef.current !== null) {
        clearWatch(watchIdRef.current).catch(console.error);
      }
    };
  }, []);

  const getModalConfig = () => {
    switch (modalMode) {
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#1a1d23] font-sans">
      {/* Header Section */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1a1d23]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#353A45] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white dark:border-[#1a1d23] ring-2 ring-gray-100 dark:ring-[#353A45]">
              <AvatarImage
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAx4va01cTU2WHiCjIE09WZBoZoD4YwYPBmPAu0lL8MEf3YqwUDmzHwK--ugZqAK4ipsuZY-IxiAN8unO7T57f1PziQ09VAnXZAq0zpwMsDymtynZ65S5i50pCzw_t4rWpf9Rqh4XQqmp3OLyAnayeL2oG1wVGkBzgZloXj9_R8b11dpXwZc5ST5aVsGYzMDAy4u16JwwCSxjIruWHNjs45HJVrxlN4r1AOx357hp1VlvqbG_00UQwNkckvS2Q4G75HfMlAJJEK-C4y"
                alt="Alex"
              />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-[#1a1d23] rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold leading-tight text-slate-900 dark:text-slate-100">
              Good Morning, Alex
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Wed, Oct 24
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-gray-100 dark:hover:bg-[#262A31] text-gray-600 dark:text-gray-300"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-white dark:ring-[#1a1d23]"></span>
        </Button>
      </header>

      <div className="flex flex-col gap-6 p-4 pb-24">
        {/* Location Context */}
        <Card className="rounded-2xl bg-white dark:bg-[#262A31] border border-gray-200 dark:border-[#353A45] p-1 overflow-hidden shadow-sm">
          <div className="relative h-48 w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {location ? (
              <MapContainer
                center={[location.coords.latitude, location.coords.longitude]}
                zoom={16}
                className="h-full w-full z-0"
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                touchZoom={true}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                keyboard={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[
                    location.coords.latitude,
                    location.coords.longitude,
                  ]}
                />
                <MapUpdater
                  center={[location.coords.latitude, location.coords.longitude]}
                />
              </MapContainer>
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center grayscale opacity-80"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAMZCYG8J6rzs1S-Ydeiw2qVit60IAKoZ0sFe0pmMI6S8dA9aJNf-mZEq4qeD5dYaaOz0fHNe_BFqwD2LLS3i0dIJKupefoAb55fA4NfmvrZCqRK80JN-luVIlK-tq9m0vJEn_Kz7E8mfoAXgvjCJLfEY0UwRRdC8eF7-HOfckxdW3atxyQ_SY9MBgbNRHH-pMad-vo6fs75r6rdxaG3_2rxApmuGsimnLvMUP1RmibIMityVa3mKMmnp3gOxwk0B9VnbhGIV6FwuSW")',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary text-white p-2 rounded-full shadow-lg z-10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            {/* Badge with Reload */}
            <button
              onClick={startTracking}
              disabled={loading}
              className="absolute top-2 right-2 z-10 bg-[#1a1d23]/80 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 flex items-center gap-2 hover:bg-[#1a1d23] transition-colors"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  location ? "bg-green-500" : "bg-red-500"
                } animate-pulse`}
              ></span>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                {loading
                  ? "Locating..."
                  : location
                    ? "GPS Active"
                    : "No Signal"}
              </span>
              <RefreshCw
                className={`h-3 w-3 text-white/70 ml-1 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Hero: Check In Status */}
        <section className="flex flex-col items-center justify-center py-6 relative">
          {/* Decorative background pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#136986 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* Timer Display */}
          <div className="mb-8 text-center z-10">
            <h1 className="text-4xl font-extrabold tracking-tight tabular-nums text-slate-800 dark:text-white">
              {(() => {
                if (workStatus === "idle" || !startTime) {
                  const timeString = formatTime(currentTime);
                  const [time, period] = timeString.split(" ");
                  return (
                    <>
                      {time}
                      <span className="text-lg text-gray-400 font-medium ml-1">
                        {period}
                      </span>
                    </>
                  );
                } else {
                  const { h, m, s } = formatDurationParts(elapsedSeconds);
                  return (
                    <div className="flex items-baseline justify-center gap-1">
                      <span>
                        {h}:{m}
                      </span>
                      <span className="text-2xl text-gray-400 font-medium opacity-80">
                        :{s}
                      </span>
                    </div>
                  );
                }
              })()}
            </h1>
            <p className="text-sm text-primary font-bold uppercase tracking-widest mt-1">
              {workStatus === "idle" ? "Ready to Start" : "Total Working Hours"}
            </p>
          </div>

          {/* Interactive Check-In Button */}
          <div className="relative z-10 group w-full flex justify-center h-48 items-center">
            {workStatus === "idle" ? (
              <div className="flex gap-6 items-center animate-in zoom-in duration-300">
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={handleStartWork}
                    className="flex items-center justify-center h-32 w-32 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 border-4 border-white/10 active:scale-95 transition-all duration-300"
                  >
                    <Fingerprint className="h-10 w-10 text-white fill-current" />
                  </button>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Check In
                  </span>
                </div>

                <div className="flex flex-col items-center gap-3 opacity-50 pointer-events-none grayscale">
                  <button className="flex items-center justify-center h-32 w-32 rounded-full bg-rose-500 shadow-lg shadow-rose-500/30 border-4 border-white/10">
                    <Square className="h-10 w-10 text-white fill-current" />
                  </button>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    Check Out
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-6 items-center animate-in zoom-in duration-300">
                {/* Pause/Resume Button */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={handlePauseWork}
                    className={cn(
                      "flex items-center justify-center h-32 w-32 rounded-full shadow-lg border-4 border-white/10 active:scale-95 transition-all duration-300",
                      workStatus === "working"
                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                        : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30",
                    )}
                  >
                    {workStatus === "working" ? (
                      <Pause className="h-10 w-10 text-white fill-current" />
                    ) : (
                      <Play className="h-10 w-10 text-white fill-current ml-1" />
                    )}
                  </button>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {workStatus === "working" ? "Pause" : "Resume"}
                  </span>
                </div>

                {/* End Button */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={handleEndWork}
                    className="flex items-center justify-center h-32 w-32 rounded-full bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 border-4 border-white/10 active:scale-95 transition-all duration-300"
                  >
                    <Square className="h-10 w-10 text-white fill-current" />
                  </button>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    Check Out
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Status Summary */}
          <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#262A31] border border-gray-200 dark:border-[#353A45] shadow-sm transition-all duration-300">
            {workStatus === "idle" && (
              <>
                <span className="flex h-2 w-2 rounded-full bg-gray-400"></span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  You are currently offline
                </span>
              </>
            )}
            {workStatus === "working" && (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Working • On Track
                </span>
              </>
            )}
            {workStatus === "paused" && (
              <>
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <div className="flex items-center gap-1.5">
                  <Coffee className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    On Break
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <Card className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-[#262A31] border border-gray-200 dark:border-[#353A45] shadow-sm">
            <CalendarClock className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Scheduled
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              9h 00m
            </span>
          </Card>
          <Card className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-[#262A31] border border-gray-200 dark:border-[#353A45] shadow-sm">
            <Briefcase className="h-6 w-6 text-green-500 mb-2" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Worked
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {(() => {
                if (workStatus === "idle") return "--:--";
                const { h, m } = formatDurationParts(elapsedSeconds);
                return `${h}h ${m}m`;
              })()}
            </span>
          </Card>
          <Card className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-[#262A31] border border-gray-200 dark:border-[#353A45] shadow-sm">
            <Hourglass className="h-6 w-6 text-orange-400 mb-2" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Remaining
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              9h 00m
            </span>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Quick Actions
            </h3>
            <a
              href="#"
              className="text-xs font-semibold text-primary hover:text-primary/80"
            >
              View All
            </a>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
            {/* Action 1 */}
            <button className="flex-none w-28 p-3 rounded-xl border border-gray-200 dark:border-[#353A45] bg-white dark:bg-[#262A31] flex flex-col items-start gap-2 hover:border-primary/50 transition-colors group">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                Request Leave
              </span>
            </button>
            {/* Action 2 */}
            <button className="flex-none w-28 p-3 rounded-xl border border-gray-200 dark:border-[#353A45] bg-white dark:bg-[#262A31] flex flex-col items-start gap-2 hover:border-primary/50 transition-colors group">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30">
                <FileClock className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                Log History
              </span>
            </button>
            {/* Action 3 */}
            <button className="flex-none w-28 p-3 rounded-xl border border-gray-200 dark:border-[#353A45] bg-white dark:bg-[#262A31] flex flex-col items-start gap-2 hover:border-primary/50 transition-colors group">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30">
                <Receipt className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                Payslip
              </span>
            </button>
            {/* Action 4 */}
            <button className="flex-none w-28 p-3 rounded-xl border border-gray-200 dark:border-[#353A45] bg-white dark:bg-[#262A31] flex flex-col items-start gap-2 hover:border-primary/50 transition-colors group">
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                Team
              </span>
            </button>
          </div>
        </section>

        <Drawer open={isCheckInModalOpen} onOpenChange={setIsCheckInModalOpen}>
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
                <div
                  className={`relative h-64 w-64 rounded-full overflow-hidden border-4 ${modalConfig.borderColor} shadow-xl bg-black ${modalConfig.glowColor} ${isVerifying ? "animate-border-glow" : ""}`}
                >
                  {cameraError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="h-8 w-8 text-red-500" />
                        <p className="text-xs text-red-400">{cameraError}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover transform scale-x-[-1]"
                      />
                      {/* Overlay scanning effect */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-b from-transparent ${modalConfig.scanColor} to-transparent animate-scan pointer-events-none`}
                      ></div>
                    </>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current Time
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatTime(currentTime)}
                  </p>
                </div>
              </div>
              <DrawerFooter>
                <Button
                  onClick={handleCameraConfirm}
                  disabled={isVerifying}
                  className={`w-full ${modalConfig.buttonColor} text-white h-12 text-lg`}
                >
                  {isVerifying ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Camera className="mr-2 h-5 w-5" />
                  )}
                  {isVerifying ? "Verifying..." : modalConfig.confirmText}
                </Button>
                <DrawerClose asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isVerifying}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
