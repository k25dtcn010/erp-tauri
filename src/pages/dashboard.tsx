import React, { useState, useEffect } from "react";
import { useSnackbar } from "zmp-ui";
import { GreetingSection } from "@/components/dashboard/sections/GreetingSection";
import { AttendanceSection } from "@/components/dashboard/sections/AttendanceSection";
import { AttendanceHistorySection } from "@/components/dashboard/sections/AttendanceHistorySection";
import { OvertimeSection } from "@/components/dashboard/sections/OvertimeSection";
import { LeaveSection } from "@/components/dashboard/sections/LeaveSection";
import { FaceVerificationModal } from "@/components/dashboard/FaceVerificationModal";
import { OfflineAttendanceService } from "@/services/offline-attendance";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronRight,
  Bell,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UnsyncedRecordsSheet } from "@/components/dashboard/UnsyncedRecordsSheet";
import { PageContainer } from "@/components/layout/PageContainer";

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

  const updatePendingCount = async () => {
    const records = await OfflineAttendanceService.getRecords();
    setPendingSync(records.length);
  };

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
        <div className="flex items-center justify-between w-full px-4 py-2">
          <div className="w-16 shrink-0" />

          <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-white/5 pl-1 pr-3 py-1 rounded-2xl border border-gray-100 dark:border-white/5 shrink-0 shadow-sm">
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 shadow-sm">
                <AvatarImage src="https://i.pravatar.cc/150?u=a" alt="User" />
                <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-[10px]">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800" />
            </div>

            <div className="flex flex-col min-w-[80px]">
              <h1 className="text-[11px] font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                Tổng quan
              </h1>
              <p className="text-[8px] font-bold text-orange-500 uppercase tracking-widest opacity-80">
                Dashboard
              </p>
            </div>

            <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 relative shrink-0"
            >
              <Bell className="h-3.5 w-3.5 text-gray-500" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full border border-white dark:border-[#1a1d23]" />
            </Button>
          </div>

          <div className="w-16 shrink-0" />
        </div>
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
      <GreetingSection displayName="Nguyễn Văn A" />

      <AttendanceSection
        workStatus={workStatus}
        currentTime={currentTime}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
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
        onVerified={onVerified}
      />

      <UnsyncedRecordsSheet
        isOpen={isSyncSheetOpen}
        onClose={() => setIsSyncSheetOpen(false)}
        onSyncComplete={updatePendingCount}
      />

      {/* DEBUG: Temporary button to test UI */}
      <div className="p-4 flex justify-center opacity-50 hover:opacity-100">
        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-gray-400"
          onClick={async () => {
            await OfflineAttendanceService.saveRecord(
              {
                type: Math.random() > 0.5 ? "check-in" : "check-out",
                timestamp: Date.now() - Math.floor(Math.random() * 86400000),
              },
              "https://via.placeholder.com/150",
            );
            updatePendingCount();
          }}
        >
          [Debug] Tạo dữ liệu pending mẫu
        </Button>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
