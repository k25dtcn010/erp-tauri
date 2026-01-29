import React, { useState, useEffect } from "react";
import { useSnackbar, useNavigate, Text } from "zmp-ui";
import { GreetingSection } from "@/components/dashboard/sections/GreetingSection";
import { AttendanceSection } from "@/components/dashboard/sections/AttendanceSection";
import { AttendanceHistorySection } from "@/components/dashboard/sections/AttendanceHistorySection";
import {
  OvertimeSection,
  OvertimeRequest,
} from "@/components/dashboard/sections/OvertimeSection";
import {
  LeaveSection,
  LeaveRequest,
} from "@/components/dashboard/sections/LeaveSection";
import { FaceVerificationModal } from "@/components/dashboard/FaceVerificationModal";
import { OfflineAttendanceService } from "@/services/offline-attendance";
import { WifiOff, RefreshCw, ChevronRight } from "lucide-react";
import { UnsyncedRecordsSheet } from "@/components/dashboard/UnsyncedRecordsSheet";
import { PageContainer } from "@/components/layout/PageContainer";
import { getApiV3AttendanceToday } from "@/client-timekeeping/sdk.gen";
import { getApiEmployeesMe } from "@/client/sdk.gen";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";
import { format } from "date-fns";

const DashboardPage: React.FC = () => {
  const [workStatus, setWorkStatus] = useState<"idle" | "working" | "paused">(
    "idle",
  );
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<string>("check-in");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncSheetOpen, setIsSyncSheetOpen] = useState(false);

  const { openSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Initialize state from local storage if available to prevent flickering
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("cached_userName") || "";
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem("cached_userAvatar") || "";
  });
  const [employeeCode, setEmployeeCode] = useState<string>(() => {
    return localStorage.getItem("cached_employeeCode") || "";
  });

  // Fetch today's attendance status
  const fetchTodayStatus = async () => {
    try {
      const res = await getApiV3AttendanceToday();
      if (res.data) {
        const { activeSession, sessions } = res.data as any;

        if (activeSession) {
          setWorkStatus("working");
          setCheckInTime(format(new Date(activeSession.checkInAt), "HH:mm"));
          setCheckOutTime(null);
        } else if (sessions && sessions.length > 0) {
          // If no active session, check the latest completed session of today
          const lastSession = sessions[0]; // Assuming they are sorted descending or just take the first
          setWorkStatus("idle");
          setCheckInTime(format(new Date(lastSession.checkInAt), "HH:mm"));
          if (lastSession.checkOutAt) {
            setCheckOutTime(format(new Date(lastSession.checkOutAt), "HH:mm"));
          }
        } else {
          setWorkStatus("idle");
          setCheckInTime(null);
          setCheckOutTime(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch today's attendance status", error);
    }
  };

  useEffect(() => {
    if (isOnline) {
      fetchTodayStatus();
    }
  }, [isOnline]);

  const updatePendingCount = async () => {
    try {
      const records = await OfflineAttendanceService.getRecords();
      setPendingSync(records.length);
    } catch (err) {
      console.error("[Dashboard] updatePendingCount error:", err);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getApiEmployeesMe();
        if (res.data) {
          const fullName = (res.data as any).data.fullName;
          const avatar = (res.data as any).data.avatarUrl || "";
          const code = (res.data as any).data.employeeCode || "";

          setUserName(fullName);
          setUserAvatar(avatar);
          setEmployeeCode(code);

          // Cache the data
          localStorage.setItem("cached_userName", fullName);
          localStorage.setItem("cached_userAvatar", avatar);
          localStorage.setItem("cached_employeeCode", code);
        }
      } catch (error) {
        console.error("Failed to fetch user information", error);
      }
    };
    fetchUser();
  }, []);

  // Check network status and pending records
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    updatePendingCount();
    // Check every 5 seconds
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Auto-sync removed as per user request (manual only)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    setModalMode("check-in");
    setIsFaceModalOpen(true);
  };

  const handleCheckOut = () => {
    setModalMode("check-out");
    setIsFaceModalOpen(true);
  };

  const onVerified = async (
    photoDataUrl: string,
    metadata: { location?: any; deviceInfo?: any },
    onlineTrialFailed?: boolean,
  ) => {
    setIsFaceModalOpen(false);

    // Refresh pending count since modal just saved a record
    await updatePendingCount();

    // Refresh today's status from API
    if (isOnline && !onlineTrialFailed) {
      setTimeout(fetchTodayStatus, 1000); // Give background worker a moment
    }

    const showSyncWarning = !isOnline || onlineTrialFailed;

    if (modalMode === "check-in") {
      setWorkStatus("working");
      openSnackbar({
        type: showSyncWarning ? "warning" : "success",
        text: showSyncWarning
          ? "Đã lưu check-in (Chờ đồng bộ)"
          : "Vào ca thành công!",
        duration: 3000,
      });
    } else {
      setWorkStatus("idle");
      openSnackbar({
        type: showSyncWarning ? "warning" : "success",
        text: showSyncWarning
          ? "Đã lưu check-out (Chờ đồng bộ)"
          : "Ra ca thành công!",
        duration: 3000,
      });
    }
  };

  const mockHistory: any[] = [
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

  const mockOvertimeRequests: OvertimeRequest[] = [
    {
      id: "ot1",
      date: new Date().toISOString(),
      hours: 2.5,
      status: "pending",
      startTime: "17:30",
      endTime: "20:00",
    },
    {
      id: "ot2",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      hours: 1.5,
      status: "approved",
      startTime: "17:30",
      endTime: "19:00",
    },
    {
      id: "ot3",
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      hours: 3,
      status: "rejected",
      startTime: "18:00",
      endTime: "21:00",
    },
  ];

  const mockLeaveRequests: LeaveRequest[] = [
    {
      id: "l1",
      startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      type: "Nghỉ phép năm",
      status: "pending",
      days: 1,
    },
    {
      id: "l2",
      startDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      type: "Nghỉ ốm",
      status: "approved",
      days: 1,
    },
    {
      id: "l3",
      startDate: new Date(Date.now() - 86400000 * 20).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 18).toISOString(),
      type: "Nghỉ việc riêng",
      status: "approved",
      days: 2,
    },
  ];

  return (
    <PageContainer
      header={
        <CustomPageHeader
          title={userName || "TỔNG QUAN"}
          subtitle="Dashboard"
          user={{ name: userName, avatar: userAvatar }}
          variant="default"
        />
      }
    >
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mt-2">
          <WifiOff className="h-4 w-4" />
          <span>Bạn đang ở chế độ ngoại tuyến. Dữ liệu sẽ được lưu tạm.</span>
        </div>
      )}

      <GreetingSection displayName={userName || "Nguyễn Văn A"} />

      {/* Pending Sync Indicator - Redesigned for Premium Look */}
      {pendingSync > 0 && (
        <div
          className="mt-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all overflow-hidden relative group"
          onClick={() => setIsSyncSheetOpen(true)}
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 rounded-full bg-orange-500/20 text-orange-600">
              <RefreshCw
                className={`h-5 w-5 ${isSyncing ? "animate-spin" : ""}`}
              />
            </div>
            <div className="flex flex-col">
              <Text className="!text-sm !font-bold text-orange-700 m-0">
                {pendingSync} dữ liệu chưa được tải lên
              </Text>
              <Text className="!text-xs text-orange-600/70 m-0">
                Chạm để đồng bộ ngay khi có mạng
              </Text>
            </div>
          </div>

          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors relative z-10">
            <ChevronRight className="h-4 w-4 text-orange-600" />
          </div>
        </div>
      )}

      <AttendanceSection
        workStatus={workStatus}
        currentTime={currentTime}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onOpenLateEarlyModal={() => navigate("/leave?action=late-early")}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
      />

      <div className="grid grid-cols-1 gap-6">
        <OvertimeSection
          totalOTHours={12.5}
          pendingOTRequests={2}
          requests={mockOvertimeRequests}
        />
        <LeaveSection
          totalLeaveDays={12}
          entitlementLeaveDays={8}
          requests={mockLeaveRequests}
        />
      </div>

      <AttendanceHistorySection
        totalWorkHours={156.5}
        attendanceRate={98}
        presentDays={21}
        recentHistory={mockHistory}
      />

      <FaceVerificationModal
        isOpen={isFaceModalOpen}
        onOpenChange={setIsFaceModalOpen}
        mode={modalMode}
        currentTime={currentTime}
        employeeCode={employeeCode}
        onVerified={onVerified}
      />

      <UnsyncedRecordsSheet
        isOpen={isSyncSheetOpen}
        onClose={() => setIsSyncSheetOpen(false)}
        onSyncComplete={updatePendingCount}
      />
    </PageContainer>
  );
};

export default DashboardPage;
