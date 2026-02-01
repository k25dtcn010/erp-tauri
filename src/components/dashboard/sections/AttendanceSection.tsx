import React, { useMemo } from "react";
import { Clock, Fingerprint, Timer, Zap, Briefcase, CalendarRange, Users, MapPin, CheckCircle2, AlertCircle, ArrowRight, LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "zmp-ui";
import { useCurrentTime } from "@/hooks/use-current-time";

export interface AttendanceSessionItem {
  id: string;
  checkInAt: string;
  checkOutAt?: string | null;
  status: string;
  workedHours?: number;
}

export interface AttendanceSchedule {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  name?: string;
}

interface AttendanceSectionProps {
  workStatus: "idle" | "working" | "paused";
  onCheckIn: () => void;
  onCheckOut: () => void;
  onOpenLateEarlyModal?: () => void;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  sessions?: AttendanceSessionItem[];
  shift?: AttendanceSchedule | null;
  overtime?: AttendanceSchedule | null;
}

export function AttendanceSection({
  workStatus,
  onCheckIn,
  onCheckOut,
  checkInTime,
  checkOutTime,
  sessions = [],
  shift,
  overtime,
}: AttendanceSectionProps) {
  const navigate = useNavigate();
  const currentTime = useCurrentTime();
  const isWorking = workStatus === "working" || workStatus === "paused";

  // Helper to convert HH:mm to minutes from midnight
  const getMinutes = (timeStr?: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = useMemo(() => {
    return parseInt(format(currentTime, "H")) * 60 + parseInt(format(currentTime, "m"));
  }, [currentTime]);

  const timelineStats = useMemo(() => {
    // Default range 07:00 - 19:00 if undefined
    let start = 7 * 60;
    let end = 19 * 60;

    if (shift) {
      const s = getMinutes(shift.startTime);
      const e = getMinutes(shift.endTime);
      start = Math.min(start, s - 60); // Add buffer
      end = Math.max(end, e + 60);
    }

    if (overtime) {
      const s = getMinutes(overtime.startTime);
      const e = getMinutes(overtime.endTime);
      start = Math.min(start, s - 30);
      end = Math.max(end, e + 30);
    }

    // Ensure current time is visible
    start = Math.min(start, currentMinutes - 60);
    end = Math.max(end, currentMinutes + 60);

    return { start, end, duration: end - start };
  }, [shift, overtime, currentMinutes]);

  const getPosition = (minutes: number) => {
    const pos = ((minutes - timelineStats.start) / timelineStats.duration) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  const isOvertimeNow = useMemo(() => {
    if (!overtime) return false;
    const start = getMinutes(overtime.startTime);
    const end = getMinutes(overtime.endTime);
    return currentMinutes >= start && currentMinutes <= end;
  }, [overtime, currentMinutes]);

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Chấm công</h3>
      </div>

      {/* Premium Main Stats Card (Restored) */}
      <Card className="relative overflow-hidden rounded-[24px] border-none shadow-xl shadow-blue-900/10">
        {/* Dynamic Background */}
        <div className={cn(
          "absolute inset-0 transition-colors duration-500",
          isOvertimeNow
            ? "bg-gradient-to-br from-indigo-600 to-purple-700"
            : "bg-gradient-to-br from-blue-600 to-blue-800"
        )} />

        {/* Decorative Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl opacity-20" />

        <div className="relative z-10 p-6 flex flex-col gap-6">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                  <CalendarRange className="h-3 w-3 text-blue-50" />
                  <span className="text-[10px] font-medium text-blue-50 uppercase tracking-wide">
                    {format(currentTime, "EEEE", { locale: vi })}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {format(currentTime, "d 'thg' M")}
              </h3>
            </div>

            {/* Status Badge */}
            <div className={cn(
              "px-3 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-2 shadow-sm transition-all",
              isOvertimeNow
                ? "bg-purple-500/30 border-purple-200/20 text-purple-50"
                : isWorking
                  ? "bg-green-500/30 border-green-200/20 text-green-50"
                  : "bg-white/10 border-white/10 text-blue-50"
            )}>
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                isOvertimeNow ? "bg-purple-300 animate-pulse" :
                  isWorking ? "bg-green-300 animate-pulse" : "bg-gray-300"
              )} />
              <span className="text-xs font-semibold">
                {isOvertimeNow ? "Tăng ca" : isWorking ? "Đang làm việc" : "Ngoài giờ"}
              </span>
            </div>
          </div>

          {/* Timeline Visualization */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-medium text-white/60 px-1">
              <span>
                {shift ? `Hành chính: ${shift.startTime} - ${shift.endTime}` : "Chưa có lịch"}
              </span>
              {overtime && (
                <span className="text-purple-200 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  OT: {overtime.startTime} - {overtime.endTime}
                </span>
              )}
            </div>

            {/* Progress Bar Container */}
            <div className="h-3 bg-black/20 rounded-full relative w-full overflow-hidden backdrop-blur-sm">
              {shift && (
                <div
                  className="absolute top-0 bottom-0 bg-white/30 rounded-full"
                  style={{
                    left: `${getPosition(getMinutes(shift.startTime))}%`,
                    width: `${getPosition(getMinutes(shift.endTime)) - getPosition(getMinutes(shift.startTime))}%`
                  }}
                />
              )}
              {overtime && (
                <div
                  className="absolute top-0 bottom-0 bg-purple-400/50 rounded-full striped-bg"
                  style={{
                    left: `${getPosition(getMinutes(overtime.startTime))}%`,
                    width: `${getPosition(getMinutes(overtime.endTime)) - getPosition(getMinutes(overtime.startTime))}%`
                  }}
                />
              )}

              {/* Actual Working Sessions */}
              {sessions.map((session) => {
                const startMins = getMinutes(format(new Date(session.checkInAt), "HH:mm"));
                const endMins = session.checkOutAt
                  ? getMinutes(format(new Date(session.checkOutAt), "HH:mm"))
                  : currentMinutes;

                return (
                  <div
                    key={session.id}
                    className="absolute top-0 bottom-0 bg-green-400/60 z-10"
                    style={{
                      left: `${getPosition(startMins)}%`,
                      width: `${getPosition(endMins) - getPosition(startMins)}%`
                    }}
                  />
                );
              })}

              <div
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-20 shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                style={{ left: `${getPosition(currentMinutes)}%` }}
              >
                <div className="absolute -top-1 -left-[3px] w-2 h-2 bg-yellow-400 rounded-full ring-2 ring-black/10" />
              </div>
            </div>

            <p className="text-xs text-center mt-1 text-white/80 font-medium">
              {isOvertimeNow
                ? "Bạn đang trong giờ tăng ca. Hãy nhớ check-out khi về!"
                : isWorking
                  ? "Chúc bạn một ngày làm việc hiệu quả!"
                  : "Đã đến lúc nghỉ ngơi hoặc chuẩn bị cho ca làm việc."}
            </p>
          </div>

          {/* Time Stats */}
          <div className="grid grid-cols-1 mt-2">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10 flex items-center justify-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-[10px] text-white/60 uppercase font-bold">Giờ hiện tại</p>
                <p className="text-xl font-bold text-white tabular-nums leading-none mt-0.5">
                  {format(currentTime, "HH:mm")}
                  <span className="text-base opacity-60">:{format(currentTime, "ss")}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons (New Design Kept) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Check In Card */}
        <div className={cn(
          "p-3.5 rounded-2xl bg-white dark:bg-gray-800 border-2 transition-all flex flex-col gap-3 shadow-sm",
          isWorking ? "border-green-100 dark:border-green-900/20" : "border-gray-50 dark:border-gray-700"
        )}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Giờ vào</span>
            <LogIn className={cn("h-4 w-4", isWorking ? "text-green-500" : "text-gray-300")} />
          </div>
          <p className={cn("text-2xl font-bold tabular-nums", isWorking ? "text-green-600" : "text-gray-400")}>
            {checkInTime || "--:--"}
          </p>
          <Button
            onClick={onCheckIn}
            disabled={workStatus !== "idle"}
            className={cn(
              "w-full h-10 rounded-xl font-bold text-sm shadow-none",
              isWorking
                ? "bg-green-50 text-green-700 hover:bg-green-100 border-none"
                : "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            {isWorking ? "Đã vào" : "Vào ca"}
          </Button>
        </div>

        {/* Check Out Card */}
        <div className={cn(
          "p-3.5 rounded-2xl bg-white dark:bg-gray-800 border-2 transition-all flex flex-col gap-3 shadow-sm",
          !isWorking && checkOutTime ? "border-orange-100 dark:border-orange-900/20" : "border-gray-50 dark:border-gray-700"
        )}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Giờ ra</span>
            <LogOut className={cn("h-4 w-4", !isWorking && checkOutTime ? "text-orange-500" : "text-gray-300")} />
          </div>
          <p className={cn("text-2xl font-bold tabular-nums", !isWorking && checkOutTime ? "text-gray-800 dark:text-gray-100" : "text-gray-400")}>
            {checkOutTime || "--:--"}
          </p>
          <Button
            onClick={onCheckOut}
            disabled={!isWorking}
            className={cn(
              "w-full h-10 rounded-xl font-bold text-sm shadow-none",
              !isWorking && checkOutTime
                ? "bg-orange-50 text-orange-700 hover:bg-orange-100 border-none"
                : "bg-orange-600 text-white hover:bg-orange-700"
            )}
          >
            {!isWorking && checkOutTime ? "Đã ra" : "Ra ca"}
          </Button>
        </div>
      </div>

      {/* Sessions List Header */}
      {sessions.length > 0 && (
        <div className="flex items-center justify-between px-1 mt-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Lịch sử trong ngày
            </h4>
          </div>
          <button
            onClick={() => navigate("/attendance-history")}
            className="text-xs font-bold text-blue-600"
          >
            Xem lịch sử
          </button>
        </div>
      )}

      {/* Sessions List */}
      <div className="flex flex-col gap-3">
        {[...sessions]
          .sort((a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime())
          .map((session) => (
            <div
              key={session.id}
              className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center gap-3 transition-all"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                session.status === "ACTIVE" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
              )}>
                {session.status === "ACTIVE" ? <Timer className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>

              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Phiên làm việc</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {format(new Date(session.checkInAt), "HH:mm")}
                  </span>
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {session.checkOutAt ? format(new Date(session.checkOutAt), "HH:mm") : "..."}
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">
                {session.workedHours ? `${session.workedHours.toFixed(1)}h` : "..."}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
