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
  overtimes?: AttendanceSchedule[];
}

export function AttendanceSection({
  workStatus,
  onCheckIn,
  onCheckOut,
  checkInTime,
  checkOutTime,
  sessions = [],
  shift,
  overtimes = [],
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

    // Process all overtimes
    overtimes.forEach(overtime => {
      const s = getMinutes(overtime.startTime);
      const e = getMinutes(overtime.endTime);
      start = Math.min(start, s - 30);
      end = Math.max(end, e + 30);
    });

    // Ensure current time is visible
    start = Math.min(start, currentMinutes - 60);
    end = Math.max(end, currentMinutes + 60);

    return { start, end, duration: end - start };
  }, [shift, overtimes, currentMinutes]);

  const getPosition = (minutes: number) => {
    const pos = ((minutes - timelineStats.start) / timelineStats.duration) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  // Helper to check if two positions are too close (< 8% apart)
  const isTooClose = (pos1: number, pos2: number, threshold = 8) => {
    return Math.abs(pos1 - pos2) < threshold;
  };

  // Calculate which markers to show based on proximity
  const markerVisibility = useMemo(() => {
    const startPos = getPosition(0);
    const endPos = getPosition(24 * 60);
    const shiftStartPos = shift ? getPosition(getMinutes(shift.startTime)) : -100;
    const shiftEndPos = shift ? getPosition(getMinutes(shift.endTime)) : -100;

    // Check proximity with all overtimes
    const hasTooCloseOvertimeAtStart = overtimes.some(ot =>
      isTooClose(startPos, getPosition(getMinutes(ot.startTime)))
    );
    const hasTooCloseOvertimeAtEnd = overtimes.some(ot =>
      isTooClose(endPos, getPosition(getMinutes(ot.endTime)))
    );

    return {
      show0: !isTooClose(startPos, shiftStartPos) && !hasTooCloseOvertimeAtStart,
      show24: !isTooClose(endPos, shiftEndPos) && !hasTooCloseOvertimeAtEnd,
    };
  }, [shift, overtimes, timelineStats]);

  const isOvertimeNow = useMemo(() => {
    return overtimes.some(overtime => {
      const start = getMinutes(overtime.startTime);
      const end = getMinutes(overtime.endTime);
      return currentMinutes >= start && currentMinutes <= end;
    });
  }, [overtimes, currentMinutes]);

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Chấm công</h3>
      </div>

      {/* Premium Main Stats Card - Redesigned */}
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

        <div className="relative z-10 p-6 flex flex-col gap-5">
          {/* Top Section: Date & Status */}
          <div className="flex justify-between items-center">
            {/* Current Time - Prominent Display */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <CalendarRange className="h-3.5 w-3.5 text-white/70" />
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                  {format(currentTime, "EEEE, d 'thg' M", { locale: vi })}
                </span>
              </div>
              <time className="text-4xl font-bold text-white tabular-nums leading-none tracking-tight">
                {format(currentTime, "HH:mm")}
                <span className="text-2xl opacity-50 ml-0.5">:{format(currentTime, "ss")}</span>
              </time>
            </div>

            {/* Status Badge */}
            <div className={cn(
              "px-3 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-2 shadow-lg transition-all",
              isOvertimeNow
                ? "bg-purple-500/30 border-purple-200/20 text-purple-50"
                : isWorking
                  ? "bg-green-500/30 border-green-200/20 text-green-50"
                  : "bg-white/10 border-white/10 text-blue-50"
            )}>
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                isOvertimeNow ? "bg-purple-300 animate-pulse shadow-[0_0_4px_rgba(216,180,254,0.8)]" :
                  isWorking ? "bg-green-300 animate-pulse shadow-[0_0_4px_rgba(134,239,172,0.8)]" : "bg-gray-300"
              )} />
              <span className="text-xs font-semibold">
                {isOvertimeNow ? "Tăng ca" : isWorking ? "Đang làm" : "Ngoài giờ"}
              </span>
            </div>
          </div>

          {/* Schedule Overview - New Section */}
          {(shift || overtimes.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {shift && (
                <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-white/90" />
                  <span className="text-xs font-semibold text-white/90">
                    Ca làm: {shift.startTime} - {shift.endTime}
                  </span>
                </div>
              )}
              {overtimes.map((overtime, index) => (
                <div key={index} className="px-3 py-1.5 rounded-lg bg-purple-300/30 backdrop-blur-sm border border-purple-100/40 flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-50">
                    Tăng ca: {overtime.startTime} - {overtime.endTime}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Timeline Visualization - Improved */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Timeline Label */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                Tiến trình hôm nay
              </span>
              <span className="text-xs font-semibold text-white/80 tabular-nums">
                {format(currentTime, "HH:mm")}
              </span>
            </div>

            {/* Progress Bar Container - Larger & Clearer */}
            <div className="relative">
              {/* Timeline Markers - Above the bar */}
              <div className="relative w-full h-6 mb-1.5">
                {/* Start time marker (0:00) */}
                {markerVisibility.show0 && (
                  <div
                    className="absolute -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${getPosition(0)}%` }}
                  >
                    <div className="text-[10px] font-bold text-white/40 mb-0.5">0:00</div>
                    <div className="w-px h-2 bg-white/20"></div>
                  </div>
                )}

                {/* Shift markers */}
                {shift && (
                  <>
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center z-10"
                      style={{ left: `${getPosition(getMinutes(shift.startTime))}%` }}
                    >
                      <div className="text-[11px] font-bold mb-0.5 whitespace-nowrap text-white">
                        {shift.startTime}
                      </div>
                      <div className="w-px h-3 bg-white/70 shadow-sm"></div>
                    </div>
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center z-10"
                      style={{ left: `${getPosition(getMinutes(shift.endTime))}%` }}
                    >
                      <div className="text-[11px] font-bold mb-0.5 whitespace-nowrap text-white">
                        {shift.endTime}
                      </div>
                      <div className="w-px h-3 bg-white/70 shadow-sm"></div>
                    </div>
                  </>
                )}

                {/* Overtime markers */}
                {overtimes.map((overtime, index) => (
                  <React.Fragment key={index}>
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center z-10"
                      style={{ left: `${getPosition(getMinutes(overtime.startTime))}%` }}
                    >
                      <div className="text-[11px] font-bold text-purple-200 mb-0.5 whitespace-nowrap">
                        {overtime.startTime}
                      </div>
                      <div className="w-px h-3 bg-purple-300/80"></div>
                    </div>
                    <div
                      className="absolute -translate-x-1/2 flex flex-col items-center z-10"
                      style={{ left: `${getPosition(getMinutes(overtime.endTime))}%` }}
                    >
                      <div className="text-[11px] font-bold text-purple-200 mb-0.5 whitespace-nowrap">
                        {overtime.endTime}
                      </div>
                      <div className="w-px h-3 bg-purple-300/80"></div>
                    </div>
                  </React.Fragment>
                ))}

                {/* End time marker (24:00) */}
                {markerVisibility.show24 && (
                  <div
                    className="absolute -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${getPosition(24 * 60)}%` }}
                  >
                    <div className="text-[10px] font-bold text-white/40 mb-0.5">24:00</div>
                    <div className="w-px h-2 bg-white/20"></div>
                  </div>
                )}
              </div>

              {/* Progress Bar - Larger and more visible */}
              <div className="h-4 bg-black/30 rounded-full relative w-full overflow-hidden backdrop-blur-sm shadow-inner">
                {/* Shift time range */}
                {shift && (
                  <div
                    className="absolute top-0 bottom-0 bg-white/40 rounded-full"
                    style={{
                      left: `${getPosition(getMinutes(shift.startTime))}%`,
                      width: `${getPosition(getMinutes(shift.endTime)) - getPosition(getMinutes(shift.startTime))}%`
                    }}
                  />
                )}

                {/* Overtime ranges */}
                {overtimes.map((overtime, index) => (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 bg-purple-400/60 rounded-full striped-bg"
                    style={{
                      left: `${getPosition(getMinutes(overtime.startTime))}%`,
                      width: `${getPosition(getMinutes(overtime.endTime)) - getPosition(getMinutes(overtime.startTime))}%`
                    }}
                  />
                ))}

                {/* Actual Working Sessions */}
                {sessions.map((session) => {
                  const startMins = getMinutes(format(new Date(session.checkInAt), "HH:mm"));
                  const endMins = session.checkOutAt
                    ? getMinutes(format(new Date(session.checkOutAt), "HH:mm"))
                    : currentMinutes;

                  return (
                    <div
                      key={session.id}
                      className="absolute top-0 bottom-0 bg-green-400/70 z-10 shadow-sm"
                      style={{
                        left: `${getPosition(startMins)}%`,
                        width: `${getPosition(endMins) - getPosition(startMins)}%`
                      }}
                    />
                  );
                })}

                {/* Current Time Indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-20 shadow-[0_0_12px_rgba(250,204,21,0.9)]"
                  style={{ left: `${getPosition(currentMinutes)}%` }}
                >
                  <div className="absolute -top-1.5 -left-[4px] w-2.5 h-2.5 bg-yellow-400 rounded-full ring-2 ring-white/30 shadow-lg" />
                  <div className="absolute -bottom-1.5 -left-[4px] w-2.5 h-2.5 bg-yellow-400 rounded-full ring-2 ring-white/30 shadow-lg" />
                </div>
              </div>

              {/* Legend - Below the bar */}
              <div className="flex items-center justify-center gap-4 mt-2.5">
                {shift && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-white/40"></div>
                    <span className="text-[10px] font-medium text-white/70">Ca làm</span>
                  </div>
                )}
                {overtimes.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-purple-400/60 striped-bg"></div>
                    <span className="text-[10px] font-medium text-purple-200">Tăng ca</span>
                  </div>
                )}
                {sessions.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-green-400/70"></div>
                    <span className="text-[10px] font-medium text-green-200">Đã làm</span>
                  </div>
                )}
              </div>
            </div>

            {/* Helper Message */}
            <p className="text-xs text-center text-white/70 font-medium leading-relaxed">
              {isOvertimeNow
                ? "Bạn đang trong giờ tăng ca. Hãy nhớ check-out khi về!"
                : isWorking
                  ? "Chúc bạn một ngày làm việc hiệu quả!"
                  : "Đã đến lúc nghỉ ngơi hoặc chuẩn bị cho ca làm việc."}
            </p>
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
          <p className={cn("text-2xl font-bold tabular-nums", isWorking && checkOutTime ? "text-gray-800 dark:text-gray-100" : "text-gray-400")}>
            {isWorking ? (checkOutTime || "--:--") : "--:--"}
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
