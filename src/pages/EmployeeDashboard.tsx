import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  checkPermissions,
  requestPermissions,
  watchPosition,
  clearWatch,
  Position,
} from "@tauri-apps/plugin-geolocation";
import { FaceVerificationModal } from "@/components/dashboard/FaceVerificationModal";
import { GreetingSection } from "@/components/dashboard/sections/GreetingSection";
import { AttendanceSection } from "@/components/dashboard/sections/AttendanceSection";
import { AttendanceHistorySection } from "@/components/dashboard/sections/AttendanceHistorySection";
import { OvertimeSection } from "@/components/dashboard/sections/OvertimeSection";
import { LeaveSection } from "@/components/dashboard/sections/LeaveSection";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const [workStatus, setWorkStatus] = useState<"idle" | "working" | "paused">(
    "idle",
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<string>("check-in");

  const recentHistory = [
    {
      id: "1",
      date: new Date(),
      status: "present" as const,
      checkIn: "08:30",
      checkOut: "17:35",
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000),
      status: "late" as const,
      checkIn: "09:15",
      checkOut: "18:00",
    },
    {
      id: "3",
      date: new Date(Date.now() - 86400000 * 2),
      status: "present" as const,
      checkIn: "08:25",
      checkOut: "17:30",
    },
  ];

  const recentOTRequests = [
    {
      id: "OT1",
      date: new Date(),
      startTime: "17:30",
      endTime: "19:30",
      hours: 2,
      status: "approved" as const,
      reason: "Hoàn thành báo cáo quý",
    },
    {
      id: "OT2",
      date: new Date(Date.now() - 86400000 * 3),
      startTime: "18:00",
      endTime: "20:00",
      hours: 2,
      status: "pending" as const,
      reason: "Hỗ trợ triển khai hệ thống",
    },
  ];

  const recentLeaveRequests = [
    {
      id: "L1",
      startDate: new Date(Date.now() + 86400000 * 5),
      endDate: new Date(Date.now() + 86400000 * 6),
      typeDisplay: "Nghỉ phép năm",
      status: "pending" as const,
      days: 2,
    },
    {
      id: "L2",
      startDate: new Date(Date.now() - 86400000 * 10),
      endDate: new Date(Date.now() - 86400000 * 10),
      typeDisplay: "Nghỉ ốm",
      status: "approved" as const,
      days: 1,
    },
  ];

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

  const handleStartWork = useCallback(() => {
    setModalMode("check-in");
    setIsCheckInModalOpen(true);
  }, []);

  const handleEndWork = useCallback(() => {
    setModalMode("check-out");
    setIsCheckInModalOpen(true);
  }, []);

  const handleVerified = useCallback(
    (photoDataUrl: string) => {
      console.log(
        `${modalMode} photo captured:`,
        photoDataUrl.substring(0, 50) + "...",
      );
      setIsCheckInModalOpen(false);

      if (modalMode === "check-in") {
        setWorkStatus("working");
      } else if (modalMode === "pause") {
        setWorkStatus("paused");
      } else if (modalMode === "resume") {
        setWorkStatus("working");
      } else {
        setWorkStatus("idle");
        setElapsedSeconds(0);
      }
    },
    [modalMode],
  );

  const startTracking = useCallback(async () => {
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null) {
        clearWatch(watchIdRef.current).catch(console.error);
      }
    };
  }, []);

  return (
    <PageContainer
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div
              className="relative group cursor-pointer active:scale-95 transition-all"
              onClick={() => navigate("/profile")}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <Avatar className="h-12 w-12 border-2 border-white dark:border-[#262A31] ring-2 ring-gray-100 dark:ring-white/5 relative">
                <AvatarImage
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAx4va01cTU2WHiCjIE09WZBoZoD4YwYPBmPAu0lL8MEf3YqwUDmzHwK--ugZqAK4ipsuZY-IxiAN8unO7T57f1PziQ09VAnXZAq0zpwMsDymtynZ65S5i50pCzw_t4rWpf9Rqh4XQqmp3OLyAnayeL2oG1wVGkBzgZloXj9_R8b11dpXwZc5ST5aVsGYzMDAy4u16JwwCSxjIruWHNjs45HJVrxlN4r1AOx357hp1VlvqbG_00UQwNkckvS2Q4G75HfMlAJJEK-C4y"
                  alt="Alex"
                />
                <AvatarFallback className="bg-emerald-100 text-emerald-600 font-black">
                  AS
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 bg-green-500 border-[3px] border-white dark:border-[#1a1d23] rounded-full shadow-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] leading-none mb-1">
                Xin chào,
              </span>
              <h2 className="text-base font-black leading-tight text-slate-900 dark:text-white">
                Alex Smith
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all active:scale-95"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-orange-500 rounded-full ring-4 ring-white dark:ring-[#1a1d23] animate-pulse"></span>
            </Button>
          </div>
        </div>
      }
    >
      <GreetingSection displayName="Alex Smith" hour={currentTime.getHours()} />

      <AttendanceSection
        workStatus={workStatus}
        currentTime={currentTime}
        elapsedSeconds={elapsedSeconds}
        onCheckIn={handleStartWork}
        onCheckOut={handleEndWork}
        location={location}
        locationLoading={loading}
        onRefreshLocation={startTracking}
      />

      <AttendanceHistorySection
        totalWorkHours={168.5}
        attendanceRate={98}
        presentDays={21}
        recentHistory={recentHistory}
      />

      <OvertimeSection
        totalOTHours={12.5}
        pendingOTRequests={1}
        recentOTRequests={recentOTRequests}
      />

      <LeaveSection
        totalLeaveDays={6}
        entitlementLeaveDays={12}
        recentLeaveRequests={recentLeaveRequests}
      />

      <FaceVerificationModal
        isOpen={isCheckInModalOpen}
        onOpenChange={setIsCheckInModalOpen}
        mode={modalMode}
        currentTime={currentTime}
        onVerified={handleVerified}
      />
    </PageContainer>
  );
}
