import { memo } from "react";
import { Briefcase, Clock, FileClock, Plus } from "lucide-react";
import { useNavigate } from "zmp-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="outline"
          onClick={() => navigate("/overtime?action=new")}
          className="w-full border-2 border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400 rounded-2xl h-14 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-purple-500/5"
        >
          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-sm">Đăng ký tăng ca</span>
        </Button>
      </div>
    </div>
  );
});
