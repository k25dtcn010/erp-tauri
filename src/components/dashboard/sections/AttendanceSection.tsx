import {
  Clock,
  Fingerprint,
  LogOut,
  MapPin,
  Users,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Position } from "@tauri-apps/plugin-geolocation";

interface AttendanceSectionProps {
  workStatus: "idle" | "working" | "paused";
  currentTime: Date;
  elapsedSeconds: number;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onGroupAttendance?: () => void;
  location: Position | null;
  locationLoading: boolean;
  onRefreshLocation: () => void;
}

export function AttendanceSection({
  workStatus,
  currentTime,
  elapsedSeconds,
  onCheckIn,
  onCheckOut,
  onGroupAttendance,
  location,
  locationLoading,
  onRefreshLocation,
}: AttendanceSectionProps) {
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const isWorking = workStatus === "working" || workStatus === "paused";

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
          <Clock className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
          Chấm công
        </h3>
      </div>

      {/* Main Stats Card */}
      <Card className="p-5 border-none bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-3xl">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-blue-100/90 capitalize">
              {format(currentTime, "EEEE, p", { locale: vi })}
            </span>
            <span className="text-2xl font-bold mt-1">
              {format(currentTime, "dd/MM/yyyy")}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                workStatus === "working"
                  ? "bg-green-400 animate-pulse"
                  : workStatus === "paused"
                    ? "bg-amber-400"
                    : "bg-orange-400",
              )}
            />
            <span className="text-xs font-bold uppercase tracking-wider">
              {workStatus === "working"
                ? "Đang làm việc"
                : workStatus === "paused"
                  ? "Đang tạm nghỉ"
                  : "Chưa vào"}
            </span>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium text-blue-50">
              Tổng thời gian:
            </span>
          </div>
          <span className="text-xl font-bold tabular-nums">
            {formatDuration(elapsedSeconds)}
          </span>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Check In Button Card */}
        <div
          className={cn(
            "p-4 rounded-2xl bg-white dark:bg-[#262A31] border transition-all duration-300 flex flex-col gap-3 shadow-sm",
            workStatus === "idle"
              ? "border-green-100 dark:border-green-900/30 ring-1 ring-green-500/10"
              : "border-gray-100 dark:border-gray-800 opacity-60",
          )}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Giờ vào
            </span>
            <Fingerprint
              className={cn(
                "h-4 w-4",
                workStatus !== "idle" ? "text-green-500" : "text-gray-400",
              )}
            />
          </div>
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              isWorking
                ? "text-green-600 dark:text-green-400"
                : "text-gray-300 dark:text-gray-600",
            )}
          >
            {workStatus !== "idle" ? format(currentTime, "HH:mm") : "--:--"}
          </span>
          <Button
            onClick={onCheckIn}
            disabled={workStatus !== "idle"}
            className={cn(
              "w-full h-11 rounded-xl font-bold transition-all duration-300",
              workStatus === "idle"
                ? "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20"
                : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-none",
            )}
          >
            {workStatus !== "idle" ? "Đã vào" : "Vào ca"}
          </Button>
        </div>

        {/* Check Out Button Card */}
        <div
          className={cn(
            "p-4 rounded-2xl bg-white dark:bg-[#262A31] border transition-all duration-300 flex flex-col gap-3 shadow-sm",
            workStatus !== "idle"
              ? "border-orange-100 dark:border-orange-900/30 ring-1 ring-orange-500/10"
              : "border-gray-100 dark:border-gray-800 opacity-60",
          )}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Giờ ra
            </span>
            <LogOut className={cn("h-4 w-4", "text-gray-400")} />
          </div>
          <span className="text-2xl font-bold text-gray-300 dark:text-gray-600 tabular-nums">
            --:--
          </span>
          <Button
            onClick={onCheckOut}
            disabled={workStatus === "idle"}
            className={cn(
              "w-full h-11 rounded-xl font-bold transition-all duration-300",
              workStatus !== "idle"
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400",
            )}
          >
            Ra ca
          </Button>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={onGroupAttendance}
          className="h-12 rounded-xl border-indigo-200 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 font-bold gap-2 text-xs"
        >
          <Users className="h-4 w-4" />
          Chấm công nhóm
        </Button>
        <Button
          variant="outline"
          onClick={onRefreshLocation}
          className="h-12 rounded-xl border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 font-bold gap-2 text-xs"
        >
          {locationLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          Quản lý GPS
        </Button>
      </div>

      {/* GPS Status Bar mini */}
      <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full animate-pulse",
              location ? "bg-green-500" : "bg-red-500",
            )}
          />
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {location ? "GPS Active" : "No Signal"}
          </span>
        </div>
        <span className="text-[10px] font-medium text-gray-400 truncate max-w-[150px]">
          {location
            ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
            : "Đang xác định vị trí..."}
        </span>
      </div>
    </div>
  );
}
