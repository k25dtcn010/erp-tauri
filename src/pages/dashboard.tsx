import React, { useState, useEffect } from "react";
import { useSnackbar, useNavigate } from "zmp-ui";
import { GreetingSection } from "@/components/dashboard/sections/GreetingSection";
import { AttendanceSection } from "@/components/dashboard/sections/AttendanceSection";
import { AttendanceHistorySection } from "@/components/dashboard/sections/AttendanceHistorySection";
import { OvertimeSection } from "@/components/dashboard/sections/OvertimeSection";
import { LeaveSection } from "@/components/dashboard/sections/LeaveSection";
import { FaceVerificationModal } from "@/components/dashboard/FaceVerificationModal";
import { OfflineAttendanceService } from "@/services/offline-attendance";
import { WifiOff, RefreshCw, ChevronRight } from "lucide-react";
import { UnsyncedRecordsSheet } from "@/components/dashboard/UnsyncedRecordsSheet";
import { PageContainer } from "@/components/layout/PageContainer";
import { getApiEmployeesMe } from "@/client/sdk.gen";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";

const DashboardPage: React.FC = () => {
  const [workStatus, setWorkStatus] = useState<"idle" | "working" | "paused">(
    "idle",
  );
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

  const updatePendingCount = async () => {
    const records = await OfflineAttendanceService.getRecords();
    setPendingSync(records.length);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getApiEmployeesMe();
        if (res.data) {
          const fullName = res.data.data.fullName;
          const avatar = res.data.data.avatarUrl || "";
          const code = res.data.data.employeeCode || "";

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
  ) => {
    console.log("Verified with photo:", photoDataUrl.substring(0, 50) + "...");
    setIsFaceModalOpen(false);

    // Refresh pending count since modal just saved a record
    updatePendingCount();

    if (modalMode === "check-in") {
      setWorkStatus("working");
      openSnackbar({
        type: "success",
        text: isOnline ? "Vào ca thành công!" : "Đã lưu check-in (Offline)",
        duration: 3000,
      });
    } else {
      setWorkStatus("idle");
      openSnackbar({
        type: "success",
        text: isOnline ? "Ra ca thành công!" : "Đã lưu check-out (Offline)",
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
        <div className="bg-red-500 text-white py-2 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="h-3 w-3" />
            <span>Đang offline. Dữ liệu sẽ được lưu cục bộ.</span>
          </div>
        </div>
      )}

      {/* Pending Sync Indicator */}
      {pendingSync > 0 && (
        <div
          className="bg-orange-500 text-white py-2 text-xs font-bold flex items-center justify-between cursor-pointer active:opacity-80 transition-opacity"
          onClick={() => setIsSyncSheetOpen(true)}
        >
          <div className="flex items-center gap-2">
            <RefreshCw
              className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span>Có {pendingSync} bản ghi chưa đồng bộ</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="opacity-90">Chi tiết</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      )}
      <GreetingSection displayName={userName || "Nguyễn Văn A"} />

      <AttendanceSection
        workStatus={workStatus}
        currentTime={currentTime}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onOpenLateEarlyModal={() => navigate("/leave?action=late-early")}
      />

      <div className="grid grid-cols-1 gap-6">
        <OvertimeSection totalOTHours={12.5} pendingOTRequests={2} />
        <LeaveSection totalLeaveDays={12} entitlementLeaveDays={8} />
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
