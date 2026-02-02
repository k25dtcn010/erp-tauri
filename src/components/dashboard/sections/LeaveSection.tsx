import { memo } from "react";
import {
  Calendar,
  ShieldCheck,
  CalendarDays,
  Plus,
  Clock,
  LogOut,
} from "lucide-react";
import { useNavigate } from "zmp-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export interface LeaveRequest {
  id: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  type: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  days: number;
}

interface LeaveSectionProps {
  totalLeaveDays: number;
  entitlementLeaveDays: number;
  requests?: LeaveRequest[];
  onMidDayLeaveClick?: () => void;
}

export const LeaveSection = memo(function LeaveSection({
  totalLeaveDays,
  entitlementLeaveDays,
  requests = [],
  onMidDayLeaveClick,
}: LeaveSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
            Nghỉ phép
          </h3>
        </div>
        <button
          onClick={() => navigate("/leave")}
          className="text-xs font-bold text-orange-500 underline underline-offset-4"
        >
          Xem chi tiết
        </button>
      </div>

      {/* Main Stats Card */}
      <Card
        className="p-5 border-none bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 rounded-2xl cursor-pointer active:scale-[0.98] transition-all"
        onClick={() => navigate("/leave")}
      >
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-center">
              Khả dụng
            </span>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium text-orange-50 text-center">
              Định mức:
            </span>
          </div>
          <span className="text-xl font-bold tabular-nums">
            {entitlementLeaveDays} ngày
          </span>
        </div>
      </Card>

      {/* Recent Requests List */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
          Gần đây
        </h4>
        {requests.length > 0 ? (
          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                    <span className="text-[10px] text-orange-600 font-medium uppercase">
                      {format(new Date(req.startDate), "EEE", { locale: vi })}
                    </span>
                    <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                      {format(new Date(req.startDate), "dd")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {req.type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {req.days} ngày •{" "}
                        {format(new Date(req.startDate), "MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {req.status === "approved" && (
                    <div className="px-2 py-1 rounded bg-green-50 text-green-600 text-[10px] font-bold uppercase border border-green-100">
                      Đã duyệt
                    </div>
                  )}
                  {req.status === "pending" && (
                    <div className="px-2 py-1 rounded bg-orange-50 text-orange-600 text-[10px] font-bold uppercase border border-orange-100">
                      Chờ duyệt
                    </div>
                  )}
                  {req.status === "rejected" && (
                    <div className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-bold uppercase border border-red-100">
                      Từ chối
                    </div>
                  )}
                  {req.status === "cancelled" && (
                    <div className="px-2 py-1 rounded bg-gray-50 text-gray-500 text-[10px] font-bold uppercase border border-gray-200">
                      Đã hủy
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center py-8">
            <span className="text-xs text-gray-500 italic">
              Không có yêu cầu nghỉ phép nào gần đây
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 border-none"
          onClick={() => navigate("/leave?action=new-leave")}
        >
          <div className="p-1 rounded bg-white/20 flex items-center justify-center text-white">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-sm">Xin nghỉ phép</span>
        </Button>
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 border-none"
          onClick={() => navigate("/leave?action=late-early")}
        >
          <div className="p-1 rounded bg-white/20 flex items-center justify-center text-white">
            <Clock className="h-4 w-4" />
          </div>
          <span className="text-sm">Xin đi muộn, về sớm</span>
        </Button>
        <Button
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl h-11 font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 border-none"
          onClick={onMidDayLeaveClick}
        >
          <div className="p-1 rounded bg-white/20 flex items-center justify-center text-white">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-sm">Xin ra ngoài</span>
        </Button>
      </div>
    </div>
  );
});
