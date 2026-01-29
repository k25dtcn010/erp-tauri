import { memo } from "react";
import {
  Briefcase,
  Clock,
  FileClock,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "zmp-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export interface OvertimeRequest {
  id: string;
  date: string; // ISO string
  hours: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

interface OvertimeSectionProps {
  totalOTHours: number;
  pendingOTRequests: number;
  requests?: OvertimeRequest[];
}

export const OvertimeSection = memo(function OvertimeSection({
  totalOTHours,
  pendingOTRequests,
  requests = [],
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

      {/* Recent Requests List */}
      {requests.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Gần đây
          </h4>
          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-500 font-medium uppercase">
                      {format(new Date(req.date), "EEE", { locale: vi })}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {format(new Date(req.date), "dd")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {req.startTime} - {req.endTime}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {req.hours} giờ
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
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={() => navigate("/overtime?action=new")}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 border-none"
        >
          <div className="p-1 rounded bg-white/20 flex items-center justify-center">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm">Đăng ký tăng ca</span>
        </Button>
      </div>
    </div>
  );
});
