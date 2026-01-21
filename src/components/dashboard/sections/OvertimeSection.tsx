import { memo } from "react";
import {
  Briefcase,
  ChevronRight,
  Clock,
  Plus,
  Inbox,
  FileClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface OTItem {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  hours: number;
  status: "approved" | "pending" | "rejected";
  reason: string;
}

interface OvertimeSectionProps {
  totalOTHours: number;
  pendingOTRequests: number;
  recentOTRequests: OTItem[];
  isLoading?: boolean;
}

export const OvertimeSection = memo(function OvertimeSection({
  totalOTHours,
  pendingOTRequests,
  recentOTRequests,
  isLoading,
}: OvertimeSectionProps) {
  const getStatusConfig = (status: OTItem["status"]) => {
    switch (status) {
      case "approved":
        return {
          label: "Đã duyệt",
          color: "text-green-600",
          bg: "bg-green-500/10",
        };
      case "pending":
        return {
          label: "Chờ duyệt",
          color: "text-orange-600",
          bg: "bg-orange-500/10",
        };
      case "rejected":
        return { label: "Từ chối", color: "text-red-600", bg: "bg-red-500/10" };
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
          <Briefcase className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
          Tăng ca
        </h3>
      </div>

      {/* Stats Summary Card */}
      <Card className="p-5 border-none bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 rounded-3xl">
        <div className="grid grid-cols-2 divide-x divide-white/20">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-purple-50">
                Tổng giờ OT
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold">
                {totalOTHours.toFixed(1)}
              </span>
              <span className="text-lg font-bold opacity-80">h</span>
            </div>
            <span className="text-[10px] uppercase font-medium opacity-70 tracking-wider">
              Tháng này
            </span>
          </div>

          <div className="flex flex-col gap-2 pl-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20">
                <FileClock className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-purple-50">
                Đang chờ duyệt
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold">{pendingOTRequests}</span>
              <span className="text-sm font-bold opacity-80">đơn</span>
            </div>
            <span className="text-[10px] uppercase font-medium opacity-70 tracking-wider">
              Cần theo dõi
            </span>
          </div>
        </div>
      </Card>

      {/* Request Button */}
      <Button className="w-full h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all">
        <Plus className="h-5 w-5" />
        Yêu cầu tăng ca
      </Button>

      {/* History List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <Clock className="h-4 w-4 text-purple-700 dark:text-purple-400" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Lịch sử yêu cầu
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="h-6 w-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentOTRequests.length === 0 ? (
          <Card className="py-10 px-4 flex flex-col items-center justify-center bg-white dark:bg-[#262A31] border-gray-100 dark:border-gray-800 rounded-2xl">
            <Inbox className="h-10 w-10 text-gray-200 mb-2" />
            <span className="text-xs text-gray-400">
              Chưa có đơn tăng ca nào
            </span>
          </Card>
        ) : (
          recentOTRequests.map((ot) => {
            const config = getStatusConfig(ot.status);
            return (
              <Card
                key={ot.id}
                className="p-4 border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#262A31] shadow-sm"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={cn("p-2 rounded-xl", config.bg)}>
                    <Clock className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">
                        {format(ot.date, "dd/MM/yyyy")}
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
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-50 dark:border-gray-800/50 pt-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-medium">
                      Thời gian
                    </span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {ot.startTime} - {ot.endTime}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 pl-4">
                    <span className="text-[10px] text-gray-400 uppercase font-medium">
                      Tổng giờ
                    </span>
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                      {ot.hours}h
                    </span>
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
        className="w-full h-12 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 font-bold gap-2 text-sm border border-purple-100/50 dark:border-purple-900/30"
      >
        Xem toàn bộ lịch sử
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});
