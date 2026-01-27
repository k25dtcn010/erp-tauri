import { memo } from "react";
import { Calendar, ShieldCheck, CalendarDays } from "lucide-react";
import { useNavigate } from "zmp-ui";
import { Card } from "@/components/ui/card";

interface LeaveSectionProps {
  totalLeaveDays: number;
  entitlementLeaveDays: number;
}

export const LeaveSection = memo(function LeaveSection({
  totalLeaveDays,
  entitlementLeaveDays,
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
    </div>
  );
});
