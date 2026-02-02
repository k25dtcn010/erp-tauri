import React, { useState, useEffect, useCallback, Suspense } from "react";
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
import { PreCheckModal } from "@/components/dashboard/PreCheckModal";
import { AnticheatService } from "@/services/anticheat";
import { WifiOff, RefreshCw, ChevronRight } from "lucide-react";
import { UnsyncedRecordsSheet } from "@/components/dashboard/UnsyncedRecordsSheet";
import { GpsRegistrationModal } from "@/components/dashboard/GpsRegistrationModal";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAttendanceStore } from "@/store/attendance-store";
import { getApiEmployeesMe } from "@/client/sdk.gen";
import { MainHeader } from "@/components/layout/MainHeader";
import { format } from "date-fns";
import { useSheetBackHandler } from "@/hooks/use-sheet-back-handler";
import { useSyncStore } from "@/store/sync-store";
import { TimeSyncService } from "@/services/time-sync";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// Lazy load heavy components
const FaceVerificationModal = React.lazy(() =>
  import("@/components/dashboard/FaceVerificationModal").then((module) => ({
    default: module.FaceVerificationModal,
  })),
);

const RequestOutModal = React.lazy(() =>
  import("@/components/dashboard/RequestOutModal").then((module) => ({
    default: module.RequestOutModal,
  })),
);

const DashboardPage: React.FC = () => {
  const {
    workStatus,
    checkInTime,
    checkOutTime,
    todaySessions,
    fetchTodayAttendance,
    performCheckIn,
    performCheckOut,
  } = useAttendanceStore();

  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isPreCheckModalOpen, setIsPreCheckModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<string>("check-in");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRequestOutModalOpen, setIsRequestOutModalOpen] = useState(false);

  // Employee ID state
  const [employeeId, setEmployeeId] = useState<string>(() => {
    return localStorage.getItem("cached_employeeId") || "";
  });

  // ✅ USE REACT QUERY HOOK - Replaces all manual state management
  const { overtime, leave, history, attendance, isRefreshing, refetchAll } =
    useDashboardData(employeeId);

  const {
    pendingCount: pendingSync,
    isSyncing,
    refreshPendingCount,
  } = useSyncStore();

  const [isSyncSheetOpen, setIsSyncSheetOpen] = useState(false);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
  const [gpsData, setGpsData] = useState<any>(null);

  // Handle Android back button for sheets
  const closeFaceModal = useCallback(() => setIsFaceModalOpen(false), []);
  const closeSyncSheet = useCallback(() => setIsSyncSheetOpen(false), []);
  const closePreCheckModal = useCallback(
    () => setIsPreCheckModalOpen(false),
    [],
  );
  const closeRequestOutModal = useCallback(
    () => setIsRequestOutModalOpen(false),
    [],
  );

  useSheetBackHandler(isFaceModalOpen, closeFaceModal);
  useSheetBackHandler(isSyncSheetOpen, closeSyncSheet);
  useSheetBackHandler(isPreCheckModalOpen, closePreCheckModal);
  useSheetBackHandler(isRequestOutModalOpen, closeRequestOutModal);

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

  // ✅ No need for registerRefreshCallback - data auto-refreshes via invalidateQueries

  // Fetch user data on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const res = await getApiEmployeesMe();
        if (res.data) {
          const data = (res.data as any).data;
          const {
            fullName,
            avatarUrl: avatar = "",
            employeeCode: code = "",
            id,
          } = data;

          setUserName(fullName);
          setUserAvatar(avatar);
          setEmployeeCode(code);
          setEmployeeId(id);

          // Cache data
          localStorage.setItem("cached_userName", fullName);
          localStorage.setItem("cached_userAvatar", avatar);
          localStorage.setItem("cached_employeeCode", code);
          localStorage.setItem("cached_employeeId", id);
        }
      } catch (error) {
        console.error("Failed to fetch user information", error);
      }
    };
    initUser();
  }, []);

  // 5. Network & Sync Monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshPendingCount]);

  // 6. Time Sync Init - Sync chỉ khi cần (> 5 phút từ lần sync cuối)
  useEffect(() => {
    // Initial sync (chỉ khi cần)
    TimeSyncService.syncTimeIfNeeded().catch((error) => {
      console.warn("[Dashboard] Initial time sync failed:", error);
    });

    // Auto check và sync mỗi 5 phút nếu cần
    const syncInterval = setInterval(
      () => {
        TimeSyncService.syncTimeIfNeeded().catch((error) => {
          console.warn("[Dashboard] Periodic time sync failed:", error);
        });
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(syncInterval);
  }, []);

  // 7. Security Init
  useEffect(() => {
    AnticheatService.init().catch((err) =>
      console.error("Anticheat init failed", err),
    );
  }, []);

  // Auto-sync removed as per user request (manual only)

  const handlePreCheckSuccess = useCallback(() => {
    console.log("[Dashboard] handlePreCheckSuccess called");
    setIsPreCheckModalOpen(false);
    // Slight delay to allow the sheet to close smoothly before opening the next one
    setTimeout(() => {
      console.log("[Dashboard] Opening FaceVerificationModal");
      setIsFaceModalOpen(true);
    }, 200);
  }, []);

  const handleCheckAction = useCallback(
    async (mode: "check-in" | "check-out") => {
      console.log(`[Dashboard] handleCheckAction: ${mode}`);
      setModalMode(mode);

      // Perform background security check
      try {
        const result = await AnticheatService.scanEnvironment();
        if (result.isSafe) {
          console.log("[Dashboard] Background check passed. Proceeding...");
          handlePreCheckSuccess();
        } else {
          console.log(
            "[Dashboard] Background check failed. Opening PreCheckModal.",
          );
          setIsPreCheckModalOpen(true);
        }
      } catch (e) {
        console.error("[Dashboard] Background check error:", e);
        // On error, fallback to opening modal so user can see/retry the check there
        setIsPreCheckModalOpen(true);
      }
    },
    [handlePreCheckSuccess],
  );

  const handleCheckIn = useCallback(() => {
    handleCheckAction("check-in");
  }, [handleCheckAction]);

  const handleCheckOut = useCallback(() => {
    handleCheckAction("check-out");
  }, [handleCheckAction]);

  const onVerified = useCallback(
    async (
      metadata: { location?: any; deviceInfo?: any },
      onlineTrialFailed?: boolean,
      responseData?: any,
    ) => {
      const currentTimeStr = format(new Date(), "HH:mm");
      const showSyncWarning = !isOnline || onlineTrialFailed;

      console.log("[Dashboard] onVerified: Immediate Optimistic Update", {
        modalMode,
        currentTimeStr,
        isOnline,
        onlineTrialFailed,
      });

      // 1. PERFORM OPTIMISTIC UPDATE IMMEDIATELY
      if (modalMode === "check-in") {
        performCheckIn(currentTimeStr);
        openSnackbar({
          type: showSyncWarning ? "warning" : "success",
          text: showSyncWarning
            ? "Đã lưu check-in (Chờ đồng bộ)"
            : "Vào ca thành công!",
          duration: 3000,
        });
      } else {
        performCheckOut(currentTimeStr);
        openSnackbar({
          type: showSyncWarning ? "warning" : "success",
          text: showSyncWarning
            ? "Đã lưu check-out (Chờ đồng bộ)"
            : "Ra ca thành công!",
          duration: 3000,
        });
      }

      setIsFaceModalOpen(false);

      // 2. Background Task: Refresh pending count
      await refreshPendingCount();

      // Check if response is PENDING_APPROVAL and has GPS info
      if (
        responseData?.status === "PENDING_APPROVAL" &&
        responseData?.nearestLocation
      ) {
        setGpsData({
          latitude: metadata.location?.latitude || 0,
          longitude: metadata.location?.longitude || 0,
          distance: responseData.nearestLocation.distance,
          nearestLocationName: responseData.nearestLocation.name,
        });
        setIsGpsModalOpen(true);
        return;
      }

      // 3. Data Consistency Refreshes - Use React Query
      console.log("[Dashboard] onVerified: Scheduling consistency fetches...");

      // Initial refresh after server sync
      const timer1 = setTimeout(() => refetchAll(), 1000);
      // Final eventual consistency check
      const timer2 = setTimeout(() => refetchAll(), 5000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    },
    [
      isOnline,
      modalMode,
      openSnackbar,
      refreshPendingCount,
      refetchAll,
      performCheckIn,
      performCheckOut,
    ],
  );

  const handleOpenLateEarlyModal = useCallback(
    () => navigate("/leave?action=late-early"),
    [navigate],
  );

  const handleOpenRequestOutModal = useCallback(() => {
    setIsRequestOutModalOpen(true);
  }, []);

  const handleRequestOutSuccess = useCallback(() => {
    // Refresh data after successful submission
    refetchAll();
  }, [refetchAll]);

  // ✅ REFRESH HANDLER - Super simple with React Query!
  const handleRefresh = useCallback(async () => {
    try {
      await refetchAll();
      openSnackbar({
        type: "success",
        text: "Đã làm mới dữ liệu!",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to refresh data", error);
      openSnackbar({
        type: "error",
        text: "Không thể làm mới dữ liệu",
        duration: 3000,
      });
    }
  }, [refetchAll, openSnackbar]);

  return (
    <PageContainer
      header={
        <MainHeader
          title="TỔNG QUAN"
          subtitle="Dashboard"
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      }
    >
      {/* Network Status Indicator */}
      {!isOnline ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mt-2">
          <WifiOff className="h-4 w-4" />
          <span>Bạn đang ở chế độ ngoại tuyến. Dữ liệu sẽ được lưu tạm.</span>
        </div>
      ) : null}

      <GreetingSection displayName={userName || "Nguyễn Văn A"} />

      {/* Pending Sync Indicator - Redesigned for Premium Look */}
      {pendingSync > 0 ? (
        <div
          className="mt-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all overflow-hidden relative group"
          onClick={() => setIsSyncSheetOpen(true)}
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />

          <div className="flex items-center gap-3 relative z-10">
            <div
              className={`p-2.5 rounded-full ${isSyncing ? "bg-orange-500/30" : "bg-orange-500/20"} text-orange-600 transition-colors`}
            >
              <RefreshCw
                className={`h-5 w-5 ${isSyncing ? "animate-spin" : ""}`}
              />
            </div>
            <div className="flex flex-col">
              <Text className="!text-sm !font-bold text-orange-700 m-0">
                {isSyncing
                  ? "Đang đồng bộ..."
                  : `${pendingSync} dữ liệu chưa được tải lên`}
              </Text>
              <Text className="!text-xs text-orange-600/70 m-0">
                {isSyncing
                  ? "Vui lòng giữ kết nối mạng"
                  : "Chạm để đồng bộ ngay khi có mạng"}
              </Text>
            </div>
          </div>

          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors relative z-10">
            <ChevronRight className="h-4 w-4 text-orange-600" />
          </div>
        </div>
      ) : null}

      <AttendanceSection
        workStatus={workStatus}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onOpenLateEarlyModal={() => navigate("/leave?action=late-early")}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
        sessions={todaySessions}
        shift={{ startTime: "08:00", endTime: "17:00" }}
        overtimes={overtime.data?.todaySchedules ?? []}
      />

      <div className="grid grid-cols-1 gap-6">
        <OvertimeSection
          totalOTHours={overtime.data?.totalHours ?? 0}
          pendingOTRequests={overtime.data?.pendingCount ?? 0}
          requests={overtime.data?.recentRequests ?? []}
        />
        <LeaveSection
          totalLeaveDays={leave.data?.leaveTotals.total ?? 0}
          entitlementLeaveDays={leave.data?.leaveTotals.entitled ?? 0}
          requests={leave.data?.recentRequests ?? []}
          onMidDayLeaveClick={handleOpenRequestOutModal}
        />
      </div>

      <AttendanceHistorySection
        requiredWorkDays={history.data?.stats.requiredWorkDays ?? 22}
        presentDays={history.data?.stats.presentDays ?? 0}
        onTimeRate={history.data?.stats.onTimeRate ?? 0}
        recentHistory={history.data?.recentHistory ?? []}
        isLoading={history.isLoading}
      />

      <Suspense fallback={null}>
        <FaceVerificationModal
          isOpen={isFaceModalOpen}
          onOpenChange={setIsFaceModalOpen}
          mode={modalMode}
          employeeCode={employeeCode}
          onVerified={onVerified}
        />
      </Suspense>

      <PreCheckModal
        isOpen={isPreCheckModalOpen}
        onClose={() => setIsPreCheckModalOpen(false)}
        onSuccess={handlePreCheckSuccess}
      />

      <UnsyncedRecordsSheet
        isOpen={isSyncSheetOpen}
        onClose={() => setIsSyncSheetOpen(false)}
        onSyncComplete={refreshPendingCount}
      />

      {gpsData && (
        <GpsRegistrationModal
          isOpen={isGpsModalOpen}
          onClose={() => setIsGpsModalOpen(false)}
          location={gpsData}
          employeeId={employeeId}
          onSuccess={() => {
            refetchAll();
          }}
        />
      )}

      <Suspense fallback={null}>
        <RequestOutModal
          isOpen={isRequestOutModalOpen}
          onClose={() => setIsRequestOutModalOpen(false)}
          onSuccess={handleRequestOutSuccess}
        />
      </Suspense>
    </PageContainer>
  );
};

export default DashboardPage;
