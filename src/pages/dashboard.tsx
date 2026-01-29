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
import { OfflineAttendanceService } from "@/services/offline-attendance";
import { WifiOff, RefreshCw, ChevronRight } from "lucide-react";
import { UnsyncedRecordsSheet } from "@/components/dashboard/UnsyncedRecordsSheet";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getApiV3AttendanceToday,
  getApiV3OvertimeSchedules,
  getApiV3AttendanceHistory,
  getApiV3LeaveRequestsMy,
  getApiV3LeavePoliciesBalances,
} from "@/client-timekeeping/sdk.gen";
import { getApiEmployeesMe } from "@/client/sdk.gen";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";
import {
  format,
  startOfMonth,
  endOfMonth,
  subDays,
  parseISO,
  isSameDay,
} from "date-fns";
import { useSheetBackHandler } from "@/hooks/use-sheet-back-handler";
import { useSyncStore } from "@/store/sync-store";

// Lazy load heavy components
const FaceVerificationModal = React.lazy(() =>
  import("@/components/dashboard/FaceVerificationModal").then((module) => ({
    default: module.FaceVerificationModal,
  })),
);

const DashboardPage: React.FC = () => {
  const [workStatus, setWorkStatus] = useState<"idle" | "working" | "paused">(
    "idle",
  );
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);

  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isPreCheckModalOpen, setIsPreCheckModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<string>("check-in");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Overtime state
  const [employeeId, setEmployeeId] = useState<string>(() => {
    return localStorage.getItem("cached_employeeId") || "";
  });
  const [totalOTHours, setTotalOTHours] = useState(0);
  const [pendingOTRequests, setPendingOTRequests] = useState(0);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(
    [],
  );

  // Attendance History state
  const [historyStats, setHistoryStats] = useState({
    totalWorkHours: 0,
    attendanceRate: 0,
    presentDays: 0,
  });
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const {
    pendingCount: pendingSync,
    isSyncing,
    refreshPendingCount,
  } = useSyncStore();

  const [isSyncSheetOpen, setIsSyncSheetOpen] = useState(false);

  // Handle Android back button for sheets
  const closeFaceModal = useCallback(() => setIsFaceModalOpen(false), []);
  const closeSyncSheet = useCallback(() => setIsSyncSheetOpen(false), []);
  const closePreCheckModal = useCallback(
    () => setIsPreCheckModalOpen(false),
    [],
  );

  useSheetBackHandler(isFaceModalOpen, closeFaceModal);
  useSheetBackHandler(isSyncSheetOpen, closeSyncSheet);
  useSheetBackHandler(isPreCheckModalOpen, closePreCheckModal);

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
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [leaveTotals, setLeaveTotals] = useState({ total: 0, entitled: 0 });

  const fetchLeaveData = useCallback(async () => {
    try {
      // Fetch recent leave requests
      const requestsRes = await getApiV3LeaveRequestsMy({
        query: { limit: "3" },
      });
      if (requestsRes.data && requestsRes.data.requests) {
        setRecentRequests(
          requestsRes.data.requests.map((req: any) => ({
            id: req.id,
            startDate: req.startDate,
            endDate: req.endDate,
            type: req.policyName || "Nghỉ phép",
            status: (req.status || "pending").toLowerCase(),
            days: req.days,
          })),
        );
      }

      // Fetch leave balances
      const balancesRes = await getApiV3LeavePoliciesBalances();
      if (balancesRes.data && balancesRes.data.balances) {
        const balances = balancesRes.data.balances as any[];
        // Find the "Annual Leave" or main leave policy. For now, let's sum them or find a primary one.
        // Usually, users care about "Phep nam" (Annual Leave).
        const mainBalance =
          balances.find(
            (b) =>
              b.policyName?.toLowerCase().includes("phép năm") ||
              b.policyName?.toLowerCase().includes("annual"),
          ) || balances[0];

        if (mainBalance) {
          setLeaveTotals({
            total: mainBalance.availableDays || 0,
            entitled: mainBalance.entitledDays || 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch leave data", error);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await getApiV3AttendanceToday();
      if (res.data) {
        const { activeSession, sessions } = res.data as any;
        setTodaySessions(sessions || []);

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
  }, []);

  useEffect(() => {
    if (isOnline) {
      fetchDashboardData();
    }
  }, [isOnline, fetchDashboardData]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getApiEmployeesMe();
        if (res.data) {
          const data = (res.data as any).data;
          const fullName = data.fullName;
          const avatar = data.avatarUrl || "";
          const code = data.employeeCode || "";
          const id = data.id || "";

          setUserName(fullName);
          setUserAvatar(avatar);
          setEmployeeCode(code);
          setEmployeeId(id);

          // Cache the data
          localStorage.setItem("cached_userName", fullName);
          localStorage.setItem("cached_userAvatar", avatar);
          localStorage.setItem("cached_employeeCode", code);
          localStorage.setItem("cached_employeeId", id);
        }
      } catch (error) {
        console.error("Failed to fetch user information", error);
      }
    };
    fetchUser();
  }, []);

  const mapOTStatus = (
    status: string,
  ): "pending" | "approved" | "rejected" | "cancelled" => {
    switch (status) {
      case "PENDING":
        return "pending";
      case "ACTIVE":
      case "COMPLETED":
        return "approved";
      case "CANCELLED":
        return "cancelled";
      default:
        return "rejected";
    }
  };

  const fetchOvertimeData = useCallback(async (eid: string) => {
    try {
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      // Fetch month data for both summary and the list
      const res = await getApiV3OvertimeSchedules({
        query: {
          employeeId: eid,
          fromDate: monthStart,
          toDate: monthEnd,
        },
      });

      if (res.data) {
        const records = (res.data as any).data || [];

        // 1. Calculate summary for the month
        const total = records.reduce(
          (acc: number, curr: any) =>
            acc + (curr.actualHours || curr.scheduledHours || 0),
          0,
        );
        const pending = records.filter(
          (r: any) => r.status === "PENDING",
        ).length;
        setTotalOTHours(total);
        setPendingOTRequests(pending);

        // 2. Get top 3 most recent items from the month
        const sortedRecords = [...records].sort((a, b) => {
          const dateTimeA = `${a.date}T${a.startTime}`;
          const dateTimeB = `${b.date}T${b.startTime}`;
          return dateTimeB.localeCompare(dateTimeA);
        });

        const mapped: OvertimeRequest[] = sortedRecords
          .slice(0, 3)
          .map((r: any) => ({
            id: r.id,
            date: r.date,
            hours: r.actualHours || r.scheduledHours,
            status: mapOTStatus(r.status),
            startTime: r.startTime,
            endTime: r.endTime,
          }));
        setOvertimeRequests(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch overtime data", error);
    }
  }, []);

  useEffect(() => {
    if (employeeId && isOnline) {
      fetchOvertimeData(employeeId);
    }
  }, [employeeId, isOnline, fetchOvertimeData]);

  const fetchHistoryData = useCallback(async (eid: string) => {
    setIsHistoryLoading(true);
    try {
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const res = await getApiV3AttendanceHistory({
        query: {
          employeeId: eid,
          fromDate: monthStart,
          toDate: monthEnd,
          pageSize: 100, // Get all for the month
        },
      });

      if (res.data) {
        const data = (res.data as any).data || [];

        // 1. Calculate stats
        const sessionsByDay: Record<string, any[]> = {};
        let totalHours = 0;

        data.forEach((session: any) => {
          const day = format(parseISO(session.checkInAt), "yyyy-MM-dd");
          if (!sessionsByDay[day]) sessionsByDay[day] = [];
          sessionsByDay[day].push(session);
          totalHours += session.workedHours || 0;
        });

        const presentDays = Object.keys(sessionsByDay).length;
        // Simple attendance rate calculation (present days / working days so far)
        // Assume working days is 22 for a generic month for now, or calculate based on today
        const workingDaysSoFar = Math.min(now.getDate(), 22); // Cap at 22 for simplicity
        const rate =
          workingDaysSoFar > 0
            ? Math.round((presentDays / workingDaysSoFar) * 100)
            : 0;

        setHistoryStats({
          totalWorkHours: totalHours,
          attendanceRate: Math.min(rate, 100),
          presentDays,
        });

        // 2. Map recent history (last 3 items)
        const mapped = data.slice(0, 3).map((s: any) => ({
          id: s.id,
          date: parseISO(s.checkInAt),
          status:
            s.status === "COMPLETED" || s.status === "ACTIVE"
              ? "present"
              : s.status === "AUTO_CLOSED" || s.status === "MISSING_CHECKOUT"
                ? "late"
                : "absent",
          checkIn: format(parseISO(s.checkInAt), "HH:mm"),
          checkOut: s.checkOutAt
            ? format(parseISO(s.checkOutAt), "HH:mm")
            : undefined,
        }));
        setRecentHistory(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch history data", error);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      fetchLeaveData();
      fetchDashboardData();
    };
    window.addEventListener("leave-request-submitted", handleRefresh);
    return () =>
      window.removeEventListener("leave-request-submitted", handleRefresh);
  }, [fetchLeaveData, fetchDashboardData]);

  useEffect(() => {
    if (employeeId && isOnline) {
      fetchOvertimeData(employeeId);
      fetchHistoryData(employeeId);
      fetchLeaveData();
      fetchDashboardData();
    }
  }, [
    employeeId,
    isOnline,
    fetchOvertimeData,
    fetchHistoryData,
    fetchLeaveData,
    fetchDashboardData,
  ]);

  // Check network status and pending records
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    refreshPendingCount();
    // Check every 5 seconds
    const interval = setInterval(refreshPendingCount, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshPendingCount]);

  // Initialize Anticheat Service
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
      photoDataUrl: string,
      metadata: { location?: any; deviceInfo?: any },
      onlineTrialFailed?: boolean,
    ) => {
      setIsFaceModalOpen(false);

      // Refresh pending count since modal just saved a record
      await refreshPendingCount();

      // Refresh today's status and history from API
      if (isOnline && !onlineTrialFailed) {
        setTimeout(() => {
          fetchDashboardData();
          if (employeeId) fetchHistoryData(employeeId);
          fetchLeaveData();
        }, 1000); // Give background worker a moment
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
    },
    [
      isOnline,
      modalMode,
      openSnackbar,
      refreshPendingCount,
      fetchDashboardData,
      employeeId,
      fetchHistoryData,
      fetchLeaveData,
    ],
  );

  const handleOpenLateEarlyModal = useCallback(
    () => navigate("/leave?action=late-early"),
    [navigate],
  );

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

  // Placeholder for leave requests (to be integrated later)
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
      )}

      <AttendanceSection
        workStatus={workStatus}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onOpenLateEarlyModal={() => navigate("/leave?action=late-early")}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
        sessions={todaySessions}
      />

      <div className="grid grid-cols-1 gap-6">
        <OvertimeSection
          totalOTHours={totalOTHours}
          pendingOTRequests={pendingOTRequests}
          requests={overtimeRequests}
        />
        <LeaveSection
          totalLeaveDays={leaveTotals.total}
          entitlementLeaveDays={leaveTotals.entitled}
          requests={recentRequests}
        />
      </div>

      <AttendanceHistorySection
        totalWorkHours={historyStats.totalWorkHours}
        attendanceRate={historyStats.attendanceRate}
        presentDays={historyStats.presentDays}
        recentHistory={recentHistory}
        isLoading={isHistoryLoading}
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
    </PageContainer>
  );
};

export default DashboardPage;
