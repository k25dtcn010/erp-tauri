import { memo } from "react";
import {
  CalendarCheck,
  ChevronRight,
  Inbox,
  Timer,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Text, List, useNavigate } from "zmp-ui";

const { Title, Header } = Text;

interface HistoryItem {
  id: string;
  date: Date;
  status: "present" | "late" | "absent" | "weekend" | "leave" | "holiday";
  checkIn?: string;
  checkOut?: string;
}

interface AttendanceHistorySectionProps {
  totalWorkHours: number;
  attendanceRate: number;
  presentDays: number;
  recentHistory: HistoryItem[];
  isLoading?: boolean;
}

export const AttendanceHistorySection = memo(function AttendanceHistorySection({
  totalWorkHours,
  attendanceRate,
  presentDays,
  recentHistory,
  isLoading,
}: AttendanceHistorySectionProps) {
  const navigate = useNavigate();
  const getStatusConfig = (status: HistoryItem["status"]) => {
    switch (status) {
      case "present":
        return {
          label: "Có mặt",
          color: "text-green-600",
          bg: "bg-green-500/10",
          iconBg: "bg-green-500/20",
        };
      case "late":
        return {
          label: "Đi muộn",
          color: "text-orange-600",
          bg: "bg-orange-500/10",
          iconBg: "bg-orange-500/20",
        };
      case "absent":
        return {
          label: "Vắng mặt",
          color: "text-red-600",
          bg: "bg-red-500/10",
          iconBg: "bg-red-500/20",
        };
      case "leave":
        return {
          label: "Nghỉ phép",
          color: "text-blue-600",
          bg: "bg-blue-500/10",
          iconBg: "bg-blue-500/20",
        };
      case "weekend":
        return {
          label: "Cuối tuần",
          color: "text-gray-500",
          bg: "bg-gray-500/10",
          iconBg: "bg-gray-500/20",
        };
      case "holiday":
        return {
          label: "Ngày lễ",
          color: "text-purple-600",
          bg: "bg-purple-500/10",
          iconBg: "bg-purple-500/20",
        };
      default:
        return {
          label: "N/A",
          color: "text-gray-400",
          bg: "bg-gray-100",
          iconBg: "bg-gray-200",
        };
    }
  };

  return (
    <div className="flex flex-col gap-4  mt-8 pb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <Title className="!text-lg !font-bold text-blue-900 dark:text-blue-100 m-0">
            Lịch sử Chấm công
          </Title>
        </div>
        <button
          onClick={() => navigate("/attendance-history")}
          className="text-xs font-bold text-blue-500 underline underline-offset-4"
        >
          Xem chi tiết
        </button>
      </div>

      {/* Stats Summary Card */}
      <Card className="p-5 border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 rounded-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="grid grid-cols-3 divide-x divide-white/20 relative z-10">
          <div className="flex flex-col items-center gap-2">
            <Timer className="h-5 w-5 opacity-80" />
            <Header className="!text-lg !font-bold !text-white m-0">
              {totalWorkHours.toFixed(1)}h
            </Header>
            <Text className="!text-[10px] !uppercase !font-medium !text-white opacity-70 tracking-wider text-center m-0">
              Giờ làm
            </Text>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-5 w-5 opacity-80" />
            <Header className="!text-lg !font-bold !text-white m-0">
              {attendanceRate}%
            </Header>
            <Text className="!text-[10px] !uppercase !font-medium !text-white opacity-70 tracking-wider text-center m-0">
              Tỷ lệ
            </Text>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Calendar className="h-5 w-5 opacity-80" />
            <Header className="!text-lg !font-bold !text-white m-0">
              {presentDays}
            </Header>
            <Text className="!text-[10px] !uppercase !font-medium !text-white opacity-70 tracking-wider text-center m-0">
              Công
            </Text>
          </div>
        </div>
      </Card>

      {/* Recent History List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentHistory.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-50 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Inbox className="h-10 w-10 text-slate-400" />
            </div>
            <Text className="!text-sm m-0">Không có dữ liệu chấm công</Text>
          </div>
        ) : (
          <>
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Gần đây
            </h4>
            <div className="flex flex-col gap-3">
              {recentHistory.map((item) => {
                const config = getStatusConfig(item.status);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
                    onClick={() => navigate("/attendance-history")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <span className="text-[10px] text-blue-600 font-medium uppercase">
                          Th{format(item.date, "M")}
                        </span>
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                          {format(item.date, "dd")}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {format(item.date, "EEEE", { locale: vi })}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Timer className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {item.checkIn || "--:--"} -{" "}
                              {item.checkOut || "--:--"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase border",
                          config.bg,
                          config.color,
                          config.color
                            .replace("text-", "border-")
                            .replace("600", "100"),
                        )}
                      >
                        {config.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
});
