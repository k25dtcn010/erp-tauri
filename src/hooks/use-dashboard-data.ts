import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getApiV3AttendanceHistory,
  getApiV3LeaveRequestsMy,
  getApiV3LeavePoliciesBalances,
  getApiV3OvertimeSchedules,
} from "@/client-timekeeping/sdk.gen";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { useAttendanceStore } from "@/store/attendance-store";
import { MidDayLeaveService } from "@/services/mid-day-leave";

// ============================================
// QUERY KEYS FACTORY
// ============================================
// Centralized query keys for better cache management
export const dashboardKeys = {
  all: ["dashboard"] as const,
  overtime: (employeeId: string) => ["dashboard", "overtime", employeeId] as const,
  history: (employeeId: string) => ["dashboard", "history", employeeId] as const,
  leave: () => ["dashboard", "leave"] as const,
  attendance: () => ["dashboard", "attendance"] as const,
};

// ============================================
// INDIVIDUAL HOOKS
// ============================================

/**
 * Hook to fetch overtime data for current month
 * @param employeeId - Employee ID
 * @returns Query result with overtime data, total hours, pending requests
 */
export const useOvertimeData = (employeeId: string) => {
  return useQuery({
    queryKey: dashboardKeys.overtime(employeeId),
    queryFn: async () => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const res = await getApiV3OvertimeSchedules({
        query: {
          employeeId,
          fromDate: monthStart,
          toDate: monthEnd,
        },
      });

      const records = ((res.data as any)?.data || []) as any[];

      // Calculate summary in single pass
      let totalHours = 0;
      let pendingCount = 0;

      records.forEach((record: any) => {
        totalHours += record.actualHours || record.scheduledHours || 0;
        if (record.status === "PENDING") {
          pendingCount++;
        }
      });

      // Find all today's overtime schedules (including PENDING)
      const todayStr = format(now, "yyyy-MM-dd");
      const todayOTs = records.filter(
        (r: any) =>
          r.date === todayStr &&
          (r.status === "APPROVED" || r.status === "COMPLETED" || r.status === "ACTIVE" || r.status === "PENDING")
      );

      // Get top 3 most recent
      const sortedRecords = [...records].sort((a, b) => {
        const dateTimeA = `${a.date}T${a.startTime}`;
        const dateTimeB = `${b.date}T${b.startTime}`;
        return dateTimeB.localeCompare(dateTimeA);
      });

      const mapOTStatus = (status: string) => {
        switch (status) {
          case "PENDING": return "pending";
          case "ACTIVE":
          case "COMPLETED": return "approved";
          case "CANCELLED": return "cancelled";
          default: return "rejected";
        }
      };

      const recentRequests = sortedRecords.slice(0, 3).map((r: any) => ({
        id: r.id,
        date: r.date,
        hours: r.actualHours || r.scheduledHours,
        status: mapOTStatus(r.status),
        startTime: r.startTime,
        endTime: r.endTime,
      }));

      // Map status helper
      const mapStatusToLowercase = (status: string): "pending" | "approved" | "rejected" => {
        switch (status) {
          case "PENDING": return "pending";
          case "APPROVED":
          case "COMPLETED":
          case "ACTIVE": return "approved";
          default: return "rejected";
        }
      };

      return {
        totalHours,
        pendingCount,
        recentRequests,
        todaySchedules: todayOTs.map((ot: any) => ({
          startTime: ot.startTime,
          endTime: ot.endTime,
          status: mapStatusToLowercase(ot.status),
        })),
      };
    },
    enabled: !!employeeId, // Only run if employeeId exists
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

/**
 * Hook to fetch leave requests and balances (for Dashboard - limited data)
 * @returns Query result with leave data
 */
export const useLeaveData = () => {
  return useQuery({
    queryKey: dashboardKeys.leave(),
    queryFn: async () => {
      const [requestsRes, balancesRes] = await Promise.all([
        getApiV3LeaveRequestsMy({ query: { limit: "3" } }),
        getApiV3LeavePoliciesBalances(),
      ]);

      const apiRequests = (requestsRes.data?.requests || []).map((req: any) => ({
        id: req.id,
        startDate: req.startDate,
        endDate: req.endDate,
        type: req.policyName || "Nghỉ phép",
        status: (req.status || "pending").toLowerCase(),
        days: req.days,
      }));

      // Get mid-day leave requests from localStorage
      const midDayRequests = MidDayLeaveService.getRecentRequests(3);
      const midDayAsLeaveRequests = midDayRequests.map(req =>
        MidDayLeaveService.convertToLeaveRequest(req)
      );

      // Merge and sort by creation date (most recent first)
      const allRequests = [...apiRequests, ...midDayAsLeaveRequests]
        .sort((a, b) => {
          const dateA = new Date(a.startDate).getTime();
          const dateB = new Date(b.startDate).getTime();
          return dateB - dateA;
        })
        .slice(0, 5); // Show top 5 recent requests

      const balances = (balancesRes.data?.balances || []) as any[];
      const mainBalance = balances.find(
        (b) =>
          b.policyName?.toLowerCase().includes("phép năm") ||
          b.policyName?.toLowerCase().includes("annual")
      ) || balances[0];

      const leaveTotals = mainBalance
        ? {
            total: mainBalance.availableDays || 0,
            entitled: mainBalance.entitledDays || 0,
          }
        : { total: 0, entitled: 0 };

      return {
        recentRequests: allRequests,
        leaveTotals,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch full leave page data (for Leave Page - full history)
 * @param employeeId - Employee ID
 * @returns Query result with full leave balances and history
 */
export const useLeavePageData = (employeeId: string) => {
  return useQuery({
    queryKey: ["leave-page", employeeId],
    queryFn: async () => {
      const [balancesRes, requestsRes] = await Promise.all([
        getApiV3LeavePoliciesBalances({
          query: { employeeId },
        }),
        getApiV3LeaveRequestsMy({
          query: { limit: "50" },
        }),
      ]);

      // Deduplicate balances by policyId and fiscalYear
      const uniqueBalancesMap = new Map();
      (balancesRes.data?.balances || []).forEach((b: any) => {
        const key = `${b.policyId}-${b.fiscalYear}`;
        if (!uniqueBalancesMap.has(key)) {
          uniqueBalancesMap.set(key, b);
        }
      });
      const leaveBalances = Array.from(uniqueBalancesMap.values());

      const apiRequests = requestsRes.data?.requests || [];

      // Get all mid-day leave requests from localStorage
      const midDayRequests = MidDayLeaveService.getAllAsLeaveRequests();

      // Merge API requests with mid-day leave requests
      const allHistoryRequests = [...apiRequests, ...midDayRequests]
        .sort((a, b) => {
          const dateA = new Date(a.startDate).getTime();
          const dateB = new Date(b.startDate).getTime();
          return dateB - dateA;
        });

      return {
        leaveBalances,
        historyRequests: allHistoryRequests,
      };
    },
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch full overtime page data (for Overtime Page - full history)
 * @param employeeId - Employee ID
 * @returns Query result with all overtime records for current month
 */
export const useOvertimePageData = (employeeId: string) => {
  return useQuery({
    queryKey: ["overtime-page", employeeId],
    queryFn: async () => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const res = await getApiV3OvertimeSchedules({
        query: {
          employeeId,
          fromDate: monthStart,
          toDate: monthEnd,
          pageSize: 100,
        },
      });

      const allMonthRecords = ((res.data as any)?.data || []) as any[];

      return {
        allMonthRecords,
      };
    },
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

/**
 * Hook to fetch attendance history for current month
 * @param employeeId - Employee ID
 * @returns Query result with history stats and recent records
 */
export const useHistoryData = (employeeId: string) => {
  return useQuery({
    queryKey: dashboardKeys.history(employeeId),
    queryFn: async () => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const res = await getApiV3AttendanceHistory({
        query: {
          employeeId,
          fromDate: monthStart,
          toDate: monthEnd,
          pageSize: 100,
        },
      });

      const data = ((res.data as any)?.data || []) as any[];

      // Calculate stats
      const sessionsByDay: Record<string, any[]> = {};
      let totalHours = 0;

      data.forEach((session: any) => {
        const day = format(parseISO(session.checkInAt), "yyyy-MM-dd");
        if (!sessionsByDay[day]) sessionsByDay[day] = [];
        sessionsByDay[day].push(session);
        totalHours += session.workedHours || 0;
      });

      const presentDays = Object.keys(sessionsByDay).length;
      const workingDaysSoFar = Math.min(now.getDate(), 22);
      const attendanceRate = workingDaysSoFar > 0
        ? Math.min(Math.round((presentDays / workingDaysSoFar) * 100), 100)
        : 0;

      // Map recent history (last 3)
      const recentHistory = data.slice(0, 3).map((s: any) => ({
        id: s.id,
        date: parseISO(s.checkInAt),
        status:
          s.status === "COMPLETED" || s.status === "ACTIVE"
            ? "present"
            : s.status === "AUTO_CLOSED" || s.status === "MISSING_CHECKOUT"
              ? "late"
              : "absent",
        checkIn: format(parseISO(s.checkInAt), "HH:mm"),
        checkOut: s.checkOutAt ? format(parseISO(s.checkOutAt), "HH:mm") : undefined,
      }));

      return {
        stats: {
          totalWorkHours: totalHours,
          attendanceRate,
          presentDays,
        },
        recentHistory,
      };
    },
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to fetch today's attendance from store
 * Uses React Query to wrap the store's fetch function
 */
export const useAttendanceData = () => {
  const { fetchTodayAttendance } = useAttendanceStore();

  return useQuery({
    queryKey: dashboardKeys.attendance(),
    queryFn: async () => {
      await fetchTodayAttendance();
      // Return current store state after fetch
      return useAttendanceStore.getState();
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

// ============================================
// COMBINED HOOK - Main Dashboard Hook
// ============================================

/**
 * Main hook that combines all dashboard data queries
 * Provides unified interface for all dashboard data + refetch capability
 *
 * @param employeeId - Employee ID
 * @returns Combined query results with refetchAll function
 */
export const useDashboardData = (employeeId: string) => {
  const queryClient = useQueryClient();

  const overtime = useOvertimeData(employeeId);
  const leave = useLeaveData();
  const history = useHistoryData(employeeId);
  const attendance = useAttendanceData();

  return {
    // Individual query results
    overtime: {
      data: overtime.data,
      isLoading: overtime.isLoading,
      isError: overtime.isError,
      isFetching: overtime.isFetching,
      error: overtime.error,
    },
    leave: {
      data: leave.data,
      isLoading: leave.isLoading,
      isError: leave.isError,
      isFetching: leave.isFetching,
      error: leave.error,
    },
    history: {
      data: history.data,
      isLoading: history.isLoading,
      isError: history.isError,
      isFetching: history.isFetching,
      error: history.error,
    },
    attendance: {
      data: attendance.data,
      isLoading: attendance.isLoading,
      isError: attendance.isError,
      isFetching: attendance.isFetching,
      error: attendance.error,
    },

    // Aggregate states
    isLoading: overtime.isLoading || leave.isLoading || history.isLoading || attendance.isLoading,
    isError: overtime.isError || leave.isError || history.isError || attendance.isError,
    isRefreshing: overtime.isFetching || leave.isFetching || history.isFetching || attendance.isFetching,

    // Refetch functions
    refetchAll: async () => {
      // Refetch all queries in parallel
      await Promise.all([
        overtime.refetch(),
        leave.refetch(),
        history.refetch(),
        attendance.refetch(),
      ]);
    },

    // Alternative: Invalidate all dashboard queries (will trigger background refetch)
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  };
};
