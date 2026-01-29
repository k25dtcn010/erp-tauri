import { Clock, Fingerprint } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Text, useNavigate } from "zmp-ui";

const { Title, Header } = Text;

interface AttendanceSectionProps {
  workStatus: "idle" | "working" | "paused";
  currentTime: Date;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onOpenLateEarlyModal?: () => void;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

export function AttendanceSection({
  workStatus,
  currentTime,
  onCheckIn,
  onCheckOut,
  onOpenLateEarlyModal,
  checkInTime,
  checkOutTime,
}: AttendanceSectionProps) {
  const navigate = useNavigate();
  const isWorking = workStatus === "working" || workStatus === "paused";

  return (
    <div className="flex flex-col gap-4  mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
          <Title className="!text-lg !font-bold text-blue-900 dark:text-blue-100 m-0">
            Chấm công
          </Title>
        </div>
        <button
          onClick={() => navigate("/attendance-history")}
          className="text-xs font-bold text-blue-500 underline underline-offset-4"
        >
          Xem chi tiết
        </button>
      </div>

      {/* Main Stats Card */}
      <Card className="p-5 border-none bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col">
            <Text className="!text-sm !font-medium !text-blue-100/90 capitalize m-0">
              {format(currentTime, "EEEE, p", { locale: vi })}
            </Text>
            <Header className="!text-2xl !font-bold !text-white mt-1 m-0">
              {format(currentTime, "dd/MM/yyyy")}
            </Header>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                workStatus === "working"
                  ? "bg-green-400 animate-pulse"
                  : workStatus === "paused"
                    ? "bg-amber-400"
                    : "bg-orange-400",
              )}
            />
            <Text className="!text-[10px] !font-bold !text-white !uppercase tracking-wider m-0">
              {workStatus === "working"
                ? "Đang làm việc"
                : workStatus === "paused"
                  ? "Đang tạm nghỉ"
                  : "Chưa vào"}
            </Text>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 opacity-80" />
            <Text className="!text-sm !font-medium !text-blue-50 m-0">
              Giờ hiện tại:
            </Text>
          </div>
          <Header className="!text-xl !font-bold !text-white tabular-nums m-0">
            {format(currentTime, "HH:mm:ss")}
          </Header>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Check In Button Card */}
        <div
          className={cn(
            "p-4 rounded-2xl bg-white dark:bg-[#262A31] border transition-all duration-300 flex flex-col gap-3 shadow-sm",
            workStatus === "idle"
              ? "border-green-100 dark:border-green-900/30 ring-1 ring-green-500/10"
              : "border-gray-100 dark:border-gray-800 opacity-60",
          )}
        >
          <div className="flex justify-between items-center">
            <Text className="!text-xs !font-medium text-gray-500 dark:text-gray-400 m-0">
              Giờ vào
            </Text>
            <Fingerprint
              className={cn(
                "h-4 w-4",
                workStatus !== "idle" ? "text-green-500" : "text-gray-400",
              )}
            />
          </div>
          <Header
            className={cn(
              "!text-2xl !font-bold tabular-nums m-0",
              workStatus !== "idle"
                ? "text-green-600 dark:text-green-400"
                : "text-gray-300 dark:text-gray-600",
            )}
          >
            {checkInTime || "--:--"}
          </Header>
          <Button
            onClick={onCheckIn}
            disabled={workStatus !== "idle"}
            className={cn(
              "w-full h-11 rounded-xl font-bold transition-all duration-300",
              workStatus === "idle"
                ? "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20"
                : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-none",
            )}
          >
            {workStatus !== "idle" ? "Đã vào" : "Vào ca"}
          </Button>
        </div>

        {/* Check Out Button Card */}
        <div
          className={cn(
            "p-4 rounded-2xl bg-white dark:bg-[#262A31] border transition-all duration-300 flex flex-col gap-3 shadow-sm",
            isWorking
              ? "border-orange-100 dark:border-orange-900/30 ring-1 ring-orange-500/10"
              : "border-gray-100 dark:border-gray-800 opacity-60",
          )}
        >
          <div className="flex justify-between items-center">
            <Text className="!text-xs !font-medium text-gray-500 dark:text-gray-400 m-0">
              Giờ ra
            </Text>
            <Clock
              className={cn(
                "h-4 w-4",
                workStatus === "idle" ? "text-orange-500" : "text-gray-400",
              )}
            />
          </div>
          <Header
            className={cn(
              "!text-2xl !font-bold tabular-nums m-0",
              checkOutTime
                ? "text-orange-600 dark:text-orange-400"
                : "text-gray-300 dark:text-gray-600",
            )}
          >
            {checkOutTime || "--:--"}
          </Header>
          <Button
            onClick={onCheckOut}
            disabled={!isWorking}
            className={cn(
              "w-full h-11 rounded-xl font-bold transition-all duration-300",
              isWorking
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                : "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-none",
            )}
          >
            Ra ca
          </Button>
        </div>
      </div>
    </div>
  );
}
