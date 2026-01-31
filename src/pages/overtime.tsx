import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Clock,
  TrendingUp,
  History as HistoryIcon,
  PieChart,
  Info,
  CheckCircle2,
  XCircle,
  CalendarDays,
  FileText,
  Send,
  ShieldCheck,
  Zap,
  ChevronLeft,
  Bell,
  Calendar,
} from "lucide-react";
import {
  useNavigate,
  Box,
  Tabs,
  Sheet,
  Select as ZSelect,
  DatePicker,
  useSnackbar,
} from "zmp-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";
import { TimePicker } from "@/components/common/TimePicker";
import { useUserStore } from "@/store/user-store";
import {
  getApiV3OvertimeSchedules,
  postApiV3OvertimeSchedules,
} from "@/client-timekeeping/sdk.gen";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";
import { OvertimeRequest } from "@/components/dashboard/sections/OvertimeSection";

const { Option } = ZSelect;

const OvertimePage: React.FC = () => {
  const navigate = useNavigate();
  const { userName, userAvatar } = useUserStore();
  const { openSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState("stats");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Request Form State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState("17:30");
  const [endTime, setEndTime] = useState("20:30");
  const [reason, setReason] = useState("");

  // Data State
  const [employeeId, setEmployeeId] = useState<string>(() => {
    return localStorage.getItem("cached_employeeId") || "";
  });
  const [allMonthRecords, setAllMonthRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check for action=new in URL to open sheet automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setIsSheetVisible(true);
    }
  }, []);

  const fetchOvertimeData = useCallback(async (eid: string) => {
    setIsLoading(true);
    try {
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const res = await getApiV3OvertimeSchedules({
        query: {
          employeeId: eid,
          fromDate: monthStart,
          toDate: monthEnd,
          pageSize: 100, // Get all records for the month
        },
      });

      if (res.data) {
        setAllMonthRecords((res.data as any).data || []);
      }
    } catch (error) {
      console.error("Failed to fetch overtime data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (employeeId) {
      fetchOvertimeData(employeeId);
    }
  }, [employeeId, fetchOvertimeData]);

  // Derived Stats
  const totalHours = allMonthRecords.reduce(
    (acc, curr) =>
      acc +
      (curr.status === "COMPLETED" || curr.status === "ACTIVE"
        ? curr.actualHours || curr.scheduledHours || 0
        : 0),
    0,
  );

  const pendingHours = allMonthRecords.reduce(
    (acc, curr) =>
      acc + (curr.status === "PENDING" ? curr.scheduledHours || 0 : 0),
    0,
  );

  const totalPossibleHours = totalHours + pendingHours;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "ACTIVE":
      case "COMPLETED":
        return "Đã duyệt";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Từ chối";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-orange-500";
      case "ACTIVE":
      case "COMPLETED":
        return "text-emerald-500";
      case "CANCELLED":
        return "text-gray-500";
      default:
        return "text-red-500";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-500/10";
      case "ACTIVE":
      case "COMPLETED":
        return "bg-emerald-500/10";
      case "CANCELLED":
        return "bg-gray-500/10";
      default:
        return "bg-red-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "ACTIVE":
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  // Weekly chart data
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const dayDate = addDays(weekStart, i);
    const dayRecords = allMonthRecords.filter((r) =>
      isSameDay(parseISO(r.date), dayDate),
    );
    const approved = dayRecords
      .filter((r) => r.status === "COMPLETED" || r.status === "ACTIVE")
      .reduce(
        (acc, curr) => acc + (curr.actualHours || curr.scheduledHours || 0),
        0,
      );
    const pending = dayRecords
      .filter((r) => r.status === "PENDING")
      .reduce((acc, curr) => acc + (curr.scheduledHours || 0), 0);

    return {
      day: format(dayDate, "EEEE", { locale: vi }),
      approved,
      pending,
    };
  });

  const chartConfig = {
    approved: {
      label: "Đã duyệt",
      color: "hsl(270 70% 60%)",
    },
    pending: {
      label: "Chờ duyệt",
      color: "hsl(25 95% 60%)",
    },
  } satisfies ChartConfig;

  const otTypes = [
    {
      label: "Giờ tăng ca",
      approved: totalHours,
      pending: pendingHours,
      total: 30, // Mock limit
      icon: <Clock className="h-4 w-4" />,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      indicatorColor: "bg-purple-500",
    },
  ];

  const filteredEntries = allMonthRecords
    .filter((req) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "pending") return req.status === "PENDING";
      if (filterStatus === "approved")
        return req.status === "COMPLETED" || req.status === "ACTIVE";
      if (filterStatus === "rejected")
        return (
          req.status !== "PENDING" &&
          req.status !== "COMPLETED" &&
          req.status !== "ACTIVE" &&
          req.status !== "CANCELLED"
        );
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleCreateOvertime = async () => {
    if (!reason.trim()) {
      openSnackbar({
        type: "error",
        text: "Vui lòng nhập lý do tăng ca",
        duration: 2000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await postApiV3OvertimeSchedules({
        body: {
          employeeIds: [employeeId],
          date: format(selectedDate, "yyyy-MM-dd"),
          startTime,
          endTime,
          reason,
        },
      });

      if (res.data && res.data.created > 0) {
        openSnackbar({
          type: "success",
          text: "Gửi yêu cầu tăng ca thành công",
          duration: 3000,
        });
        setIsSheetVisible(false);
        setReason("");
        // Refresh data
        fetchOvertimeData(employeeId);
      } else if (res.data && res.data.errors && res.data.errors.length > 0) {
        openSnackbar({
          type: "error",
          text: res.data.errors[0].message || "Có lỗi xảy ra",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error("Failed to create overtime", error);
      openSnackbar({
        type: "error",
        text: error.message || "Không thể gửi yêu cầu",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageContainer
        header={
          <CustomPageHeader
            title="Tăng ca"
            subtitle="Overtime"
            user={{ name: userName, avatar: userAvatar }}
            onBack={() => navigate(-1)}
            variant="purple"
          />
        }
      >
        <Box className="mb-32">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            className="w-full zaui-tabs-custom"
          >
            <Tabs.Tab
              key="stats"
              label={
                <div className="flex items-center gap-2">
                  <PieChart className="h-3.5 w-3.5" />
                  <span>Thống kê</span>
                </div>
              }
            >
              <div className="mt-4 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {/* Main Stats Hero Card */}
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-xl shadow-purple-500/20 rounded-2xl p-8">
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-purple-100" />
                        <span className="text-xs font-bold text-purple-100 uppercase tracking-widest">
                          Tổng giờ tăng ca
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-6xl font-black tabular-nums">
                          {totalPossibleHours.toFixed(1)}
                        </h2>
                        <span className="text-xl font-bold opacity-80">
                          giờ
                        </span>
                      </div>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                      <Clock className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                      <div
                        className="absolute top-0 left-0 h-full bg-orange-400 rounded-full"
                        style={{
                          width: `${Math.min(100, (totalPossibleHours / 30) * 100)}%`,
                        }}
                      />
                      <div
                        className="absolute top-0 left-0 h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"
                        style={{
                          width: `${Math.min(100, (totalHours / 30) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-purple-100/60">
                        Đã duyệt
                      </span>
                      <span className="text-lg font-bold">
                        {totalHours.toFixed(1)} giờ
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase font-bold text-purple-100/60">
                        Đang chờ
                      </span>
                      <span className="text-lg font-bold">
                        {pendingHours.toFixed(1)} giờ
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Activity Trend Chart */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                    <span>Biểu đồ hàng tuần</span>
                    <TrendingUp className="h-3.5 w-3.5 opacity-50" />
                  </h3>
                  <Card className="p-6 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl overflow-hidden">
                    <div className="h-48 w-full">
                      <ChartContainer
                        config={chartConfig}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: -20,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 3"
                              stroke="#88888820"
                            />
                            <XAxis
                              dataKey="day"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tick={{
                                fill: "#888",
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent />}
                            />
                            <Bar
                              dataKey="approved"
                              stackId="a"
                              fill="var(--color-approved)"
                              radius={[0, 0, 0, 0]}
                              barSize={24}
                            />
                            <Bar
                              dataKey="pending"
                              stackId="a"
                              fill="var(--color-pending)"
                              radius={[6, 6, 0, 0]}
                              barSize={24}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </Card>
                </div>

                {/* Breakdown Section */}
                <div className="grid grid-cols-1 gap-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                    <span>Phân loại tăng ca</span>
                    <Info className="h-3.5 w-3.5 opacity-50" />
                  </h3>
                  {otTypes.map((type, idx) => (
                    <Card
                      key={idx}
                      className="p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl"
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                            type.bgColor,
                            type.color,
                          )}
                        >
                          {type.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {type.label}
                            </h4>
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-sm font-black tabular-nums text-purple-600 dark:text-purple-400">
                                  {type.approved.toFixed(1)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 mx-0.5">
                                  /
                                </span>
                                <span className="text-sm font-black tabular-nums text-orange-500">
                                  {type.pending.toFixed(1)}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 ml-1 uppercase">
                                  giờ
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="relative h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            {/* Pending portion */}
                            <div
                              className="absolute top-0 left-0 h-full bg-orange-400/60"
                              style={{
                                width: `${Math.min(100, ((type.approved + type.pending) / type.total) * 100)}%`,
                              }}
                            />
                            {/* Approved portion */}
                            <div
                              className="absolute top-0 left-0 h-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                              style={{
                                width: `${Math.min(100, (type.approved / type.total) * 100)}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between mt-2">
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                              <span className="text-[10px] font-bold text-slate-500 italic">
                                Đã duyệt: {type.approved.toFixed(1)}h
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                              <span className="text-[10px] font-bold text-slate-500 italic">
                                Đang chờ: {type.pending.toFixed(1)}h
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Info Box */}
                <div className="bg-purple-50/50 dark:bg-purple-500/5 rounded-2xl border border-purple-100/50 dark:border-purple-500/10 p-5 flex gap-4 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Info className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-tighter">
                      Chính sách tăng ca
                    </p>
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400/80 leading-relaxed">
                      Tăng ca cần được phê duyệt trước khi thực hiện.
                    </p>
                  </div>
                </div>
              </div>
            </Tabs.Tab>
            <Tabs.Tab
              key="history"
              label={
                <div className="flex items-center gap-2">
                  <HistoryIcon className="h-3.5 w-3.5" />
                  <span>Lịch sử đơn</span>
                </div>
              }
            >
              <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {/* Filter Bar */}
                <div className="overflow-x-auto no-scrollbar py-2 -mx-1 px-1 flex items-center gap-3">
                  {[
                    { label: "Tất cả", value: "all" },
                    { label: "Chờ duyệt", value: "pending" },
                    { label: "Đã duyệt", value: "approved" },
                    { label: "Từ chối", value: "rejected" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterStatus(filter.value)}
                      className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                        filterStatus === filter.value
                          ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/20"
                          : "bg-white dark:bg-[#262A31] border-gray-100 dark:border-gray-800 text-slate-500 dark:text-slate-400 hover:border-purple-200 dark:hover:border-purple-900/30",
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
                        <HistoryIcon className="h-8 w-8" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        Chưa có dữ liệu
                      </h4>
                      <p className="text-xs text-slate-500">
                        Bạn chưa có yêu cầu tăng ca nào trong tháng này
                      </p>
                    </div>
                  ) : (
                    filteredEntries.map((req, idx) => (
                      <Card
                        key={req.id || idx}
                        className={cn(
                          "p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:translate-y-[-2px] rounded-2xl group",
                          (req.status === "REJECTED" ||
                            req.status === "CANCELLED") &&
                            "opacity-60 grayscale-[0.3]",
                        )}
                      >
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300",
                                getStatusBg(req.status),
                                getStatusColor(req.status),
                              )}
                            >
                              {getStatusIcon(req.status)}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">
                                {req.reason || "Tăng ca"}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                  {format(parseISO(req.date), "dd 'Tháng' MM", {
                                    locale: vi,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest bg-transparent border-none px-0",
                              getStatusColor(req.status),
                            )}
                          >
                            {getStatusLabel(req.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Clock className="h-3 w-3" /> Khoảng thời gian
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {req.startTime} - {req.endTime}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <TrendingUp className="h-3 w-3" /> Tổng số giờ
                            </span>
                            <span className="text-[11px] font-black text-purple-600 dark:text-purple-400">
                              +{req.actualHours || req.scheduledHours}h
                            </span>
                          </div>
                        </div>

                        {req.note && (
                          <div className="relative p-4 bg-purple-50/30 dark:bg-purple-950/10 rounded-2xl border border-purple-100/50 dark:border-purple-900/20">
                            <FileText className="absolute right-3 top-3 h-4 w-4 text-purple-200 dark:text-purple-900/40" />
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                              {req.note}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Tabs.Tab>
          </Tabs>
        </Box>
      </PageContainer>

      {/* Floating Action CTA - Moved outside PageContainer and increased z-index */}
      <div className="fixed bottom-28 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-auto">
        {/* Tăng ca Button */}
        <button
          className="w-52 h-16 pl-4 pr-8 rounded-2xl shadow-xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white border-none group relative overflow-hidden outline-none"
          onClick={() => setIsSheetVisible(true)}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shrink-0 shadow-lg border border-white/20">
            <Plus className="h-7 w-7" />
          </div>
          <div className="flex flex-col items-start leading-tight whitespace-nowrap z-10">
            <span className="text-[10px] uppercase font-black text-purple-100/70 tracking-widest block text-left mb-0.5">
              Đăng ký
            </span>
            <span className="block text-left text-base font-black tracking-tight">
              Tăng ca
            </span>
          </div>
        </button>
      </div>

      <Sheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        mask
        handler
        swipeToClose
      >
        <div className="flex flex-col h-[85vh] w-full max-w-3xl mx-auto bg-white dark:bg-[#1a1d23] sm:rounded-t-[2rem] overflow-hidden relative text-left">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#353A45] flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#1a1d23]/95 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-sm">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Tăng ca mới
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Đăng ký tăng ca
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSheetVisible(false)}
              className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-6 pb-24">
            {/* Date & Time Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                  Ngày bắt đầu
                </label>
                <div className="relative">
                  <DatePicker
                    mask
                    maskClosable
                    title="Chọn ngày bắt đầu"
                    dateFormat="dd/mm/yyyy"
                    value={selectedDate}
                    onChange={(value) => setSelectedDate(value as Date)}
                    inputClass="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                  Ngày kết thúc
                </label>
                <div className="relative">
                  <DatePicker
                    mask
                    maskClosable
                    title="Chọn ngày kết thúc"
                    dateFormat="dd/mm/yyyy"
                    value={selectedDate}
                    onChange={(value) => setSelectedDate(value as Date)}
                    inputClass="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                  Thời gian
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <TimePicker
                      value={startTime}
                      onChange={setStartTime}
                      placeholder="Bắt đầu"
                      inputClass="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm text-center"
                    />
                  </div>
                  <span className="text-slate-300 font-black">-</span>
                  <div className="relative flex-1">
                    <TimePicker
                      value={endTime}
                      onChange={setEndTime}
                      placeholder="Kết thúc"
                      inputClass="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                Lý do
              </label>
              <textarea
                placeholder="Nhập lý do chi tiết..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-[120px] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#262A31] font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none resize-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Footer - Sticky with safe area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#1a1d23] z-30 pb-safe">
            <div className="flex gap-3 max-w-3xl mx-auto">
              <button
                onClick={() => setIsSheetVisible(false)}
                className="flex-1 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleCreateOvertime}
                className="flex-[2] h-12 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 hover:bg-purple-700 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
};

export default OvertimePage;
