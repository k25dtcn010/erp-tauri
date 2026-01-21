import { memo } from "react";
import {
  Calendar,
  ChevronRight,
  Plus,
  Inbox,
  ShieldCheck,
  CalendarDays,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface LeaveItem {
  id: string;
  startDate: Date;
  endDate: Date;
  typeDisplay: string;
  status: "approved" | "pending" | "rejected";
  days: number;
}

interface LeaveSectionProps {
  totalLeaveDays: number;
  entitlementLeaveDays: number;
  recentLeaveRequests: LeaveItem[];
  isLoading?: boolean;
}

export const LeaveSection = memo(function LeaveSection({
  totalLeaveDays,
  entitlementLeaveDays,
  recentLeaveRequests,
  isLoading,
}: LeaveSectionProps) {
  const getStatusConfig = (status: LeaveItem["status"]) => {
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
        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
          <Calendar className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
          Nghỉ phép
        </h3>
      </div>

      {/* Main Stats Card */}
      <Card className="p-5 border-none bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 rounded-3xl">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-orange-100" />
              <span className="text-sm font-medium text-orange-50 capitalize">
                Quỹ phép năm {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-bold">{totalLeaveDays}</span>
              <span className="text-lg font-bold opacity-80 text-orange-100">
                ngày
              </span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-200 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Khả dụng
            </span>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium text-orange-50">
              Tổng định mức:
            </span>
          </div>
          <span className="text-xl font-bold">{entitlementLeaveDays} ngày</span>
        </div>
      </Card>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#262A31] border border-orange-100 dark:border-orange-900/30 ring-1 ring-orange-500/5 transition-all duration-300 flex flex-col gap-3 shadow-sm group active:scale-[0.98]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Phép năm
            </span>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500">
              <Plus className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Nghỉ phép
            </span>
            <span className="text-[10px] text-gray-400">Đăng ký mới</span>
          </div>
          <Button className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20">
            Tạo đơn
          </Button>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#262A31] border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col gap-3 shadow-sm opacity-80 hover:opacity-100 group active:scale-[0.98]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Loại khác
            </span>
            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
              Nghỉ ốm...
            </span>
            <span className="text-[10px] text-gray-400">Chế độ BHXH</span>
          </div>
          <Button
            variant="outline"
            className="w-full h-10 rounded-xl border-gray-200 dark:border-gray-700 font-bold text-xs"
          >
            Chi tiết
          </Button>
        </div>
      </div>

      {/* History Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-700 dark:text-orange-400" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Gần đây
            </span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {recentLeaveRequests.length} đơn
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentLeaveRequests.length === 0 ? (
          <Card className="py-12 px-4 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/20 border-dashed rounded-2xl">
            <Inbox className="h-10 w-10 text-gray-300 mb-2" />
            <span className="text-xs text-gray-400 italic">
              Chưa có đơn nghỉ phép nào
            </span>
          </Card>
        ) : (
          recentLeaveRequests.map((leave) => {
            const config = getStatusConfig(leave.status);
            return (
              <Card
                key={leave.id}
                className="p-4 border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#262A31] shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-xl", config.bg)}>
                    <Calendar className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {leave.typeDisplay}
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
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">
                        {format(leave.startDate, "dd/MM", { locale: vi })} -{" "}
                        {format(leave.endDate, "dd/MM/yyyy", { locale: vi })}
                      </span>
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                        {leave.days} ngày
                      </span>
                    </div>
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
        className="w-full h-12 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20 font-bold gap-2 text-sm border border-orange-100/50 dark:border-orange-900/30 transition-colors"
      >
        Lịch sử nghỉ phép
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});
