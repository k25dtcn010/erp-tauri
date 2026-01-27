import React, { useState, useEffect } from "react";
import { Page, Header, useSnackbar } from "zmp-ui";
import { GreetingSection } from "@/components/dashboard/sections/GreetingSection";
import { AttendanceSection } from "@/components/dashboard/sections/AttendanceSection";
import { AttendanceHistorySection } from "@/components/dashboard/sections/AttendanceHistorySection";
import { OvertimeSection } from "@/components/dashboard/sections/OvertimeSection";
import { LeaveSection } from "@/components/dashboard/sections/LeaveSection";
import { FaceVerificationModal } from "@/components/dashboard/FaceVerificationModal";
import { OfflineAttendanceService } from "@/services/offline-attendance";
import { Wifi, WifiOff, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnsyncedRecordsSheet } from "@/components/dashboard/UnsyncedRecordsSheet";

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

  const updatePendingCount = () => {
    const records = OfflineAttendanceService.getRecords();
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

  const onVerified = (photoDataUrl: string) => {
    console.log("Verified with photo:", photoDataUrl.substring(0, 50) + "...");
    setIsFaceModalOpen(false);

    if (modalMode === "check-in") {
      setWorkStatus("working");

      if (!isOnline) {
        OfflineAttendanceService.saveRecord({
          type: "check-in",
          timestamp: Date.now(),
          photoDataUrl: photoDataUrl,
        });
        setPendingSync((prev) => prev + 1);
        openSnackbar({
          type: "warning",
          text: "Đã lưu check-in offline. Sẽ đồng bộ khi có mạng.",
          duration: 3000,
        });
      } else {
        // TODO: Call API directly if online
        openSnackbar({
          type: "success",
          text: "Vào ca thành công!",
          duration: 3000,
        });
      }
    } else {
      setWorkStatus("idle");

      if (!isOnline) {
        OfflineAttendanceService.saveRecord({
          type: "check-out",
          timestamp: Date.now(),
          photoDataUrl: photoDataUrl,
        });
        setPendingSync((prev) => prev + 1);
        openSnackbar({
          type: "warning",
          text: "Đã lưu check-out offline. Sẽ đồng bộ khi có mạng.",
          duration: 3000,
        });
      } else {
        // TODO: Call API directly if online
        openSnackbar({
          type: "success",
          text: "Ra ca thành công!",
          duration: 3000,
        });
      }
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
    <Page className="bg-gray-50/50">
      <Header
        title="Trang chủ"
        showBackIcon={false}
        textColor={isOnline ? "blue" : "red"}
      />

      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="h-3 w-3" />
            <span>Đang offline. Dữ liệu sẽ được lưu cục bộ.</span>
          </div>
        </div>
      )}

      {/* Pending Sync Indicator */}
      {pendingSync > 0 && (
        <div
          className="bg-orange-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between cursor-pointer active:opacity-80 transition-opacity"
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

      <div className="grid grid-cols-1 gap-6 px-4 mt-4">
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
          onClick={() => {
            OfflineAttendanceService.saveRecord({
              type: Math.random() > 0.5 ? "check-in" : "check-out",
              timestamp: Date.now() - Math.floor(Math.random() * 86400000),
              photoDataUrl: "https://via.placeholder.com/150",
            });
            updatePendingCount();
          }}
        >
          [Debug] Tạo dữ liệu pending mẫu
        </Button>
      </div>
    </Page>
  );
};

export default DashboardPage;
