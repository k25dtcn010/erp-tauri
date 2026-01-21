import { memo } from "react";
import {
  CalendarCheck,
  ChevronRight,
  Inbox,
  Timer,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

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
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
          <CalendarCheck className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
          Chấm công
        </h3>
      </div>

      {/* Stats Summary Card */}
      <Card className="p-5 border-none bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/20 rounded-3xl">
        <div className="grid grid-cols-3 divide-x divide-white/20">
          <div className="flex flex-col items-center gap-2">
            <Timer className="h-5 w-5 opacity-80" />
            <span className="text-lg font-bold">
              {totalWorkHours.toFixed(1)}h
            </span>
            <span className="text-[10px] uppercase font-medium opacity-70 tracking-wider">
              Tổng giờ làm
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-5 w-5 opacity-80" />
            <span className="text-lg font-bold">{attendanceRate}%</span>
            <span className="text-[10px] uppercase font-medium opacity-70 tracking-wider">
              Tỷ lệ đi làm
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Calendar className="h-5 w-5 opacity-80" />
            <span className="text-lg font-bold">{presentDays}</span>
            <span className="text-[10px] uppercase font-medium opacity-70 tracking-wider">
              Công tháng
            </span>
          </div>
        </div>
      </Card>

      {/* History List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentHistory.length === 0 ? (
          <Card className="py-12 px-4 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/20 border-dashed rounded-2xl">
            <Inbox className="h-12 w-12 text-gray-300 mb-3" />
            <span className="text-sm text-gray-400">
              Chưa có lịch sử chấm công
            </span>
          </Card>
        ) : (
          recentHistory.map((item) => {
            const config = getStatusConfig(item.status);
            return (
              <Card
                key={item.id}
                className="p-4 border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#262A31] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-xl", config.bg)}>
                    <Calendar className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate capitalize">
                        {format(item.date, "EEEE, dd/MM", { locale: vi })}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                          config.bg,
                          config.color,
                        )}
                      >
                        {config.label}
                      </span>
                    </div>
                    {item.checkIn || item.checkOut ? (
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Vào:
                          </span>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-none">
                            {item.checkIn || "--:--"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Ra:
                          </span>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-none">
                            {item.checkOut || "--:--"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs italic text-gray-400">
                        Không có dữ liệu
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* View All Button */}
      <Button
        variant="ghost"
        className="w-full h-12 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 font-bold gap-2 text-sm border border-blue-100/50 dark:border-blue-900/30"
        onClick={() => navigate("/attendance-history")}
      >
        Xem toàn bộ lịch sử
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});
