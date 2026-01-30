import {
  ChevronLeft,
  Calendar,
  ChevronRight,
  TrendingUp,
  Timer,
  AlertCircle,
  Clock,
  CalendarCheck,
  RefreshCw,
  Info,
  CheckCircle2,
  History,
  LogIn,
  LogOut,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect, useCallback } from "react";
import { getApiV3AttendanceHistory } from "@/client-timekeeping/sdk.gen";
import { getApiEmployeesMe } from "@/client/sdk.gen";
import {
  Select,
  Sheet,
  Modal,
  Box,
  Header,
  Page,
  Text,
  useNavigate,
} from "zmp-ui";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameDay,
  getDay,
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";
import { useSheetBackHandler } from "@/hooks/use-sheet-back-handler";

const { Option } = Select;

// Types
interface AttendanceRecord {
  id?: string;
  date: Date;
  status: "normal" | "late" | "absent" | "leave" | "holiday" | "weekend" | "none";
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  overtimeHours?: number;
  reason?: string;
  lateMinutes?: number;
  notes?: string;
  checkInPhoto?: string | null;
  checkOutPhoto?: string | null;
  locationStatus?: {
    in: string;
    out: string | null;
  };
  sessions?: any[];
}

const AttendanceHistoryPage = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<AttendanceRecord | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Handle Android back button
  const closeDetail = useCallback(() => setIsDetailOpen(false), []);
  const closeModal = useCallback(() => setIsModalVisible(false), []);

  useSheetBackHandler(isDetailOpen, closeDetail);
  useSheetBackHandler(isModalVisible, closeModal);

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("cached_userName") || "";
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem("cached_userAvatar") || "";
  });
  const [employeeId, setEmployeeId] = useState<string>(() => {
    return localStorage.getItem("cached_employeeId") || "";
  });
  const [apiData, setApiData] = useState<any[]>([]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getApiEmployeesMe();
        if (res.data) {
          const data = (res.data as any).data;
          const fullName = data.fullName;
          const avatar = data.avatarUrl || "";
          const id = data.id || "";

          setUserName(fullName);
          setUserAvatar(avatar);
          setEmployeeId(id);

          // Cache the data
          localStorage.setItem("cached_userName", fullName);
          localStorage.setItem("cached_userAvatar", avatar);
          localStorage.setItem("cached_employeeId", id);
        }
      } catch (error) {
        console.error("Failed to fetch user information", error);
      }
    };
    fetchUser();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!employeeId) return;
    setIsLoading(true);
    try {
      const fromDate = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
      const toDate = format(endOfMonth(selectedMonth), "yyyy-MM-dd");
      const res = await getApiV3AttendanceHistory({
        query: {
          employeeId,
          fromDate,
          toDate,
          pageSize: 100,
        },
      });
      if (res.data) {
        setApiData((res.data as any).data || []);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, selectedMonth]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const attendanceData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    // Map API data to daily records
    const dailySessionsMap: Record<string, any[]> = {};
    apiData.forEach((s) => {
      const day = format(parseISO(s.checkInAt), "yyyy-MM-dd");
      if (!dailySessionsMap[day]) {
        dailySessionsMap[day] = [];
      }
      dailySessionsMap[day].push(s);
    });

    return days.map((date) => {
      const dayKey = format(date, "yyyy-MM-dd");
      const daySessions = dailySessionsMap[dayKey] || [];
      const session = daySessions[0];
      const dayOfWeek = getDay(date);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (session) {
        const checkIn = format(parseISO(session.checkInAt), "HH:mm");
        const checkOut = session.checkOutAt
          ? format(parseISO(session.checkOutAt), "HH:mm")
          : undefined;

        let status: AttendanceRecord["status"] = "normal";
        if (session.status === "REJECTED") status = "absent";
        else if (
          session.status === "AUTO_CLOSED" ||
          session.status === "MISSING_CHECKOUT"
        )
          status = "late"; // Or incomplete

        // You could add logic here to check if late based on shift

        return {
          id: session.id,
          date,
          status,
          checkIn,
          checkOut,
          totalHours: session.workedHours || 0,
          overtimeHours: 0, // Need API for this or calculate
          checkInPhoto: session.checkInPhotoUrl,
          checkOutPhoto: session.checkOutPhotoUrl,
          locationStatus: {
            in: session.checkinLocationStatus,
            out: session.checkoutLocationStatus,
          },
          sessions: daySessions,
        } as AttendanceRecord;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isFuture = date.getTime() > today.getTime();

      return {
        date,
        status: isWeekend ? "weekend" : isFuture ? "none" : "absent",
        totalHours: 0,
        sessions: [],
      } as AttendanceRecord;
    });
  }, [selectedMonth, apiData]);

  // Calendar stats
  const stats = useMemo(() => {
    const present = attendanceData.filter(
      (d) =>
        d.id !== undefined && (d.status === "normal" || d.status === "late"),
    ).length;
    const workingDays = attendanceData.filter(
      (d) => d.status !== "weekend" && d.status !== "holiday",
    ).length;
    const late = apiData.filter(
      (d) => d.status === "AUTO_CLOSED" || d.status === "MISSING_CHECKOUT",
    ).length;
    const leave = 0; // Need leave data integration
    const rate =
      workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;

    return { present, workingDays, late, leave, rate };
  }, [attendanceData, apiData]);

  const handleRefresh = () => {
    fetchHistory();
  };

  const getStatusConfig = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "normal":
        return {
          label: "Bình thường",
          color: "bg-green-500",
          text: "text-green-600",
          bg: "bg-green-50",
        };
      case "late":
        return {
          label: "Đi muộn",
          color: "bg-orange-500",
          text: "text-orange-600",
          bg: "bg-orange-50",
        };
      case "absent":
        return {
          label: "Vắng mặt",
          color: "bg-red-500",
          text: "text-red-600",
          bg: "bg-red-50",
        };
      case "leave":
        return {
          label: "Nghỉ phép",
          color: "bg-blue-500",
          text: "text-blue-600",
          bg: "bg-blue-50",
        };
      case "weekend":
        return {
          label: "Cuối tuần",
          color: "bg-gray-300",
          text: "text-gray-500",
          bg: "bg-gray-50",
        };
      case "holiday":
        return {
          label: "Ngày lễ",
          color: "bg-purple-500",
          text: "text-purple-600",
          bg: "bg-purple-50",
        };
      case "none":
        return {
          label: "Chưa đến",
          color: "bg-gray-100",
          text: "text-gray-400",
          bg: "bg-gray-50",
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-200",
          text: "text-gray-400",
          bg: "bg-gray-50",
        };
    }
  };

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string; date: Date }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = startOfMonth(
        new Date(now.getFullYear(), now.getMonth() - i, 1),
      );
      options.push({
        value: date.getTime().toString(),
        label: format(date, "MMMM yyyy", { locale: vi }),
        date: date,
      });
    }
    return options;
  }, []);

  return (
    <PageContainer
      header={
        <CustomPageHeader
          title="LỊCH SỬ"
          subtitle="Chấm công"
          onBack={() => navigate(-1)}
          user={{ name: userName, avatar: userAvatar }}
          variant="default"
        />
      }
    >
      {/* Month Selector using ZaUI Select */}
      <Box>
        <Select
          label="Thời gian"
          placeholder="Chọn tháng"
          value={selectedMonth.getTime().toString()}
          onChange={(value) => {
            const selected = monthOptions.find((opt) => opt.value === value);
            if (selected) setSelectedMonth(selected.date);
          }}
          closeOnSelect
          className="bg-white dark:bg-[#262A31] rounded-2xl border-none shadow-sm"
        >
          {monthOptions.map((opt) => (
            <Option key={opt.value} value={opt.value} title={opt.label} />
          ))}
        </Select>
      </Box>

      {/* Stats Summary Card (Shadcn) */}
      <Card className="p-5 border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-1.5 rounded-lg bg-white/20">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold">Thống kê tháng</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center">
            <History className="h-6 w-6 opacity-80 mb-2" />
            <span className="text-xl font-bold">
              {stats.present}/{stats.workingDays}
            </span>
            <span className="text-[10px] uppercase font-medium opacity-70 tracking-wider">
              Ngày công
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Timer className="h-6 w-6 opacity-80 mb-2" />
            <span className="text-xl font-bold">{stats.late}</span>
            <span className="text-[10px] uppercase font-medium opacity-70 tracking-wider">
              Đi muộn
            </span>
          </div>
          <div className="flex flex-col items-center">
            <CalendarCheck className="h-6 w-6 opacity-80 mb-2" />
            <span className="text-xl font-bold">{stats.leave}</span>
            <span className="text-[10px] uppercase font-medium opacity-70 tracking-wider">
              Nghỉ phép
            </span>
          </div>
        </div>

        <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-white/20">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium leading-relaxed">
            {stats.rate >= 95
              ? "Xuất sắc! Bạn duy trì tỷ lệ đi làm rất tốt. Tiếp tục phát huy nhé!"
              : "Tốt! Bạn đã hoàn thành hầu hết các ngày công. Cố gắng cải thiện tỷ lệ đi làm trễ."}
          </p>
        </div>
      </Card>

      {/* Calendar Section (Shadcn Card) */}
      <div className="space-y-4">
        <Card className="p-6 border-none shadow-sm bg-white dark:bg-[#262A31] rounded-2xl">
          <div className="grid grid-cols-7 gap-y-6 gap-x-2">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: getDay(startOfMonth(selectedMonth)) }).map(
              (_, i) => (
                <div key={`empty-${i}`} />
              ),
            )}

            {attendanceData.map((record, idx) => {
              const isSelected =
                selectedDate && isSameDay(record.date, selectedDate.date);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(record);
                    setIsDetailOpen(true);
                  }}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-2xl text-sm font-bold transition-all relative group",
                    isToday(record.date) &&
                      !isSelected &&
                      "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#262A31]",
                    isSelected &&
                      "scale-110 z-10 shadow-lg ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-[#262A31]",
                    record.status === "normal" &&
                      "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
                    record.status === "late" &&
                      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
                    record.status === "absent" &&
                      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
                    record.status === "leave" &&
                      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
                    record.status === "weekend" &&
                      "bg-gray-50 text-gray-400 dark:bg-gray-800/50",
                    record.status === "holiday" &&
                      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
                  )}
                >
                  {format(record.date, "d")}
                  {isToday(record.date) && (
                    <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-blue-600 rounded-full border-2 border-white dark:border-[#262A31]" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Legend (Shadcn Card) */}
        <Card className="p-5 border-none shadow-sm bg-white dark:bg-[#262A31] rounded-2xl">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Chú thích
          </h4>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {[
              { label: "Bình thường", color: "bg-green-500" },
              { label: "Đi muộn", color: "bg-orange-500" },
              { label: "Vắng mặt", color: "bg-red-500" },
              { label: "Nghỉ phép", color: "bg-blue-500" },
              { label: "Ngày lễ", color: "bg-purple-500" },
              { label: "Cuối tuần", color: "bg-gray-300" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", item.color)} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detail Drawer using ZaUI Sheet */}
      <Sheet
        visible={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        mask
        handler
        title="Chi tiết ngày công"
      >
        {selectedDate &&
          (() => {
            const approvedCount =
              selectedDate.sessions?.filter(
                (s) => s.status === "COMPLETED" || s.status === "ACTIVE",
              ).length || 0;
            const pendingCount =
              selectedDate.sessions?.filter(
                (s) =>
                  s.status === "PENDING_REVIEW" ||
                  s.status === "NEEDS_CONFIRMATION",
              ).length || 0;

            return (
              <Box className="p-6 bg-white dark:bg-[#1a1d23]">
                <Box className="flex items-center gap-4 mb-6">
                  <Box
                    className={cn(
                      "p-4 rounded-2xl",
                      getStatusConfig(selectedDate.status).bg,
                    )}
                  >
                    <Clock
                      className={cn(
                        "h-8 w-8",
                        getStatusConfig(selectedDate.status).text,
                      )}
                    />
                  </Box>
                  <Box>
                    <Text className="text-xl font-extrabold capitalize m-0">
                      {format(selectedDate.date, "EEEE, dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </Text>
                    <Box className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-none",
                          getStatusConfig(selectedDate.status).bg,
                          getStatusConfig(selectedDate.status).text,
                        )}
                      >
                        {getStatusConfig(selectedDate.status).label}
                      </Badge>
                      <Text className="text-[10px] font-medium text-gray-400 m-0">
                        Ca hành chính
                      </Text>
                    </Box>
                  </Box>
                </Box>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                        Giờ vào
                      </span>
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4 text-green-500" />
                        <span className="text-lg font-bold tabular-nums">
                          {selectedDate.checkIn || "--:--"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                        Giờ ra
                      </span>
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-orange-500" />
                        <span className="text-lg font-bold tabular-nums">
                          {selectedDate.checkOut || "--:--"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Session Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                        Tổng ca
                      </span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {selectedDate.sessions?.length || 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-center">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">
                        Chờ duyệt
                      </span>
                      <span className="text-lg font-bold text-orange-700 dark:text-orange-300">
                        {pendingCount}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-center">
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block mb-1">
                        Hợp lệ
                      </span>
                      <span className="text-lg font-bold text-green-700 dark:text-green-300">
                        {approvedCount}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          Tổng thời gian
                        </span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {selectedDate.totalHours}h
                      </span>
                    </div>

                    {selectedDate.status === "late" && (
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                            Đi muộn
                          </span>
                        </div>
                        <span className="text-sm font-bold text-orange-600">
                          {selectedDate.lateMinutes} phút
                        </span>
                      </div>
                    )}

                    {selectedDate.notes && (
                      <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Ghi chú
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 pl-7 m-0">
                          {selectedDate.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-dashed border-2 border-gray-200 dark:border-gray-800 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold gap-2 mt-4 text-sm"
                    onClick={() => setIsModalVisible(true)}
                  >
                    <Info className="h-4 w-4" />
                    Yêu cầu điều chỉnh
                  </Button>
                </div>
              </Box>
            );
          })()}
      </Sheet>

      {/* Adjustment Request Modal using ZaUI Modal */}
      <Modal
        visible={isModalVisible}
        title="Yêu cầu điều chỉnh"
        onClose={() => setIsModalVisible(false)}
        verticalActions
        actions={[
          {
            text: "Gửi yêu cầu",
            onClick: () => setIsModalVisible(false),
            highLight: true,
          },
          {
            text: "Hủy",
            onClick: () => setIsModalVisible(false),
          },
        ]}
      >
        <Box className="space-y-4">
          <Text size="small">
            Bạn đang yêu cầu điều chỉnh cho ngày{" "}
            <strong>
              {selectedDate && format(selectedDate.date, "dd/MM/yyyy")}
            </strong>
          </Text>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <Text size="xSmall" className="text-gray-500 mb-1">
              Ghi chú điều chỉnh
            </Text>
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-sm no-scrollbar min-h-[80px]"
              placeholder="Nhập lý do điều chỉnh..."
            />
          </div>
        </Box>
      </Modal>
    </PageContainer>
  );
};

export default AttendanceHistoryPage;
