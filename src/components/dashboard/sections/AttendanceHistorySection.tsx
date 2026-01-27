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
    <div className="flex flex-col gap-4 px-4 mt-8 pb-10">
      {/* Section Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
          <CalendarCheck className="h-5 w-5" />
        </div>
        <Title className="!text-lg !font-bold text-blue-900 dark:text-blue-100 m-0">
          Lịch sử Chấm công
        </Title>
      </div>

      {/* Stats Summary Card */}
      <Card className="p-5 border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 rounded-[2rem] overflow-hidden relative group">
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

      {/* History List using zmp-ui List */}
      <div className="mt-2">
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
          <List
            dataSource={recentHistory}
            renderItem={(item: HistoryItem) => {
              const config = getStatusConfig(item.status);
              return (
                <div key={item.id} className="mb-3 px-1">
                  <Card className="p-4 border-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl active:scale-[0.98]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-2xl flex flex-col items-center justify-center border transition-all",
                            config.iconBg,
                            config.color,
                            "border-transparent",
                          )}
                        >
                          <span className="text-[10px] font-bold uppercase opacity-60">
                            Th{format(item.date, "M")}
                          </span>
                          <span className="text-lg font-black leading-none mt-0.5">
                            {format(item.date, "dd")}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Header className="!text-sm !font-bold text-slate-900 dark:text-white m-0 capitalize">
                              {format(item.date, "EEEE", { locale: vi })}
                            </Header>
                            <div
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                config.bg,
                                config.color,
                              )}
                            >
                              {config.label}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <Timer className="h-3 w-3 text-slate-400" />
                              <Text className="!text-xs !text-slate-500 m-0">
                                {item.checkIn || "--:--"}
                              </Text>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                            <div className="flex items-center gap-1.5">
                              <div className="h-3 w-3 rounded-full border border-slate-300 flex items-center justify-center">
                                <div className="h-1 w-1 rounded-full bg-slate-400" />
                              </div>
                              <Text className="!text-xs !text-slate-500 m-0">
                                {item.checkOut || "--:--"}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  </Card>
                </div>
              );
            }}
          />
        )}
      </div>

      <button
        onClick={() => navigate("/attendance-history")}
        className="w-full py-4 text-blue-600 dark:text-blue-400 font-bold text-sm bg-blue-50 dark:bg-blue-900/20 rounded-2xl active:scale-[0.98] transition-all mt-2"
      >
        Xem tất cả lịch sử
      </button>
    </div>
  );
});
