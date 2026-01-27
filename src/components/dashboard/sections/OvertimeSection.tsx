import { memo } from "react";
import { Briefcase, Clock, FileClock, Plus } from "lucide-react";
import { useNavigate } from "zmp-ui";
import { Card } from "@/components/ui/card";

interface OvertimeSectionProps {
  totalOTHours: number;
  pendingOTRequests: number;
}

export const OvertimeSection = memo(function OvertimeSection({
  totalOTHours,
  pendingOTRequests,
}: OvertimeSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
            Tăng ca
          </h3>
        </div>
        <button
          onClick={() => navigate("/overtime")}
          className="text-xs font-bold text-purple-500 underline underline-offset-4"
        >
          Xem chi tiết
        </button>
      </div>

      {/* Stats Summary Card */}
      <Card
        className="p-5 border-none bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 rounded-2xl cursor-pointer active:scale-[0.98] transition-all"
        onClick={() => navigate("/overtime")}
      >
        <div className="grid grid-cols-2 divide-x divide-white/20">
          <div className="flex flex-col gap-2 pr-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-purple-50">
                Tổng OT
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold">
                {totalOTHours.toFixed(1)}
              </span>
              <span className="text-lg font-bold opacity-80">h</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pl-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20">
                <FileClock className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium text-purple-50">
                Chờ duyệt
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold">{pendingOTRequests}</span>
              <span className="text-lg font-bold opacity-80">ca</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Create Request Button */}
      <button
        onClick={() => navigate("/overtime?action=new")}
        className="h-16 w-full pl-5 pr-8 rounded-[2rem] shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.98] transition-all flex items-center gap-4 text-sm font-black bg-purple-600 text-white border-none group"
      >
        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shrink-0">
          <Plus className="h-6 w-6" />
        </div>
        <div className="flex flex-col items-start leading-tight whitespace-nowrap">
          <span className="text-[10px] uppercase font-bold text-purple-100/80 tracking-widest block text-left">
            Tạo mới
          </span>
          <span className="block text-left text-base">Yêu cầu tăng ca</span>
        </div>
      </button>
    </div>
  );
});
