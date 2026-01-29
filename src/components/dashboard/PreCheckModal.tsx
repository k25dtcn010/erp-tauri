import React, { useEffect, useState } from "react";
import { Sheet, Button, Box, Text } from "zmp-ui";
import {
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Clock,
  Cpu,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { AnticheatService } from "../../services/anticheat";

interface PreCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type CheckStatus = "idle" | "checking" | "safe" | "risk" | "error";

interface CheckItem {
  key: string;
  label: string;
  status: "pending" | "safe" | "risk";
  message?: string;
  icon: React.ReactNode;
}

export function PreCheckModal({
  isOpen,
  onClose,
  onSuccess,
}: PreCheckModalProps) {
  const [overallStatus, setOverallStatus] = useState<CheckStatus>("idle");
  const [items, setItems] = useState<CheckItem[]>([
    {
      key: "root",
      label: "Kiểm tra hệ thống (Root)",
      status: "pending",
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      key: "mock",
      label: "Vị trí thực (Mock Location)",
      status: "pending",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      key: "time",
      label: "Đồng bộ thời gian",
      status: "pending",
      icon: <Clock className="w-5 h-5" />,
    },
  ]);

  // Track mounted state
  const isMountedRef = React.useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runChecks = React.useCallback(async () => {
    if (!isOpen) {
      console.log("[PreCheckModal] Skipping checks because isOpen is false");
      return;
    }
    console.log("[PreCheckModal] Starting checks...");

    setOverallStatus("checking");
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        status: "pending",
        message: undefined,
      })),
    );

    if (!isMountedRef.current) return;

    try {
      // Run checks and min-wait time in parallel
      const minDelayPromise = new Promise((resolve) =>
        setTimeout(resolve, 800),
      );
      const scanPromise = AnticheatService.scanEnvironment();

      const [_, result] = await Promise.all([minDelayPromise, scanPromise]);

      if (!isMountedRef.current) return;

      // Update items based on service result
      const details = result.details;

      const newItems: CheckItem[] = [
        {
          key: "root",
          label: "Kiểm tra hệ thống",
          status: details.root.isSafe ? "safe" : "risk",
          message: details.root.message,
          icon: <Cpu className="w-5 h-5" />,
        },
        {
          key: "mock",
          label: "Vị trí thực",
          status: details.location.isSafe ? "safe" : "risk",
          message: details.location.message,
          icon: <MapPin className="w-5 h-5" />,
        },
        {
          key: "time",
          label: "Đồng bộ thời gian",
          status: details.time.isSafe ? "safe" : "risk",
          message: details.time.message,
          icon: <Clock className="w-5 h-5" />,
        },
      ];

      setItems(newItems);
      const anyRisk = !result.isSafe;
      setOverallStatus(anyRisk ? "risk" : "safe");

      if (!anyRisk) {
        // Auto close on success after a short delay
        console.log("[PreCheckModal] All checks safe. Closing in 1s...");
        setTimeout(() => {
          if (isMountedRef.current) {
            console.log("[PreCheckModal] Calling onSuccess...");
            onSuccess();
          }
        }, 1000);
      } else {
        console.log("[PreCheckModal] Risks detected.");
      }
    } catch (e) {
      console.error("Anticheat check error:", e);
      setOverallStatus("error");
    }
  }, [isOpen, onSuccess]);

  useEffect(() => {
    if (isOpen) {
      runChecks();
    }
  }, [isOpen, runChecks]);

  return (
    <Sheet
      visible={isOpen}
      onClose={onClose}
      mask
      swipeToClose={false} // Force wait for check
      autoHeight
      title="Kiểm tra an toàn"
    >
      <Box className="p-4 pb-8 flex flex-col gap-6">
        {/* Status Header */}
        <div
          className={`flex items-center gap-4 p-4 rounded-2xl ${
            overallStatus === "checking"
              ? "bg-blue-50 border border-blue-100"
              : overallStatus === "safe"
                ? "bg-green-50 border border-green-100"
                : overallStatus === "risk"
                  ? "bg-red-50 border border-red-100"
                  : "bg-gray-50"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              overallStatus === "checking"
                ? "bg-blue-100 text-blue-600"
                : overallStatus === "safe"
                  ? "bg-green-100 text-green-600"
                  : overallStatus === "risk"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-200"
            }`}
          >
            {overallStatus === "checking" && (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
            {overallStatus === "safe" && <ShieldCheck className="w-6 h-6" />}
            {overallStatus === "risk" && <ShieldAlert className="w-6 h-6" />}
            {overallStatus === "error" && <AlertTriangle className="w-6 h-6" />}
          </div>

          <div className="flex-1">
            <Text className="text-lg font-bold">
              {overallStatus === "checking" && "Đang kiểm tra bảo mật..."}
              {overallStatus === "safe" && "Thiết bị an toàn"}
              {overallStatus === "risk" && "Phát hiện rủi ro bảo mật"}
              {overallStatus === "error" && "Lỗi kiểm tra"}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              {overallStatus === "checking" && "Vui lòng đợi trong giây lát"}
              {overallStatus === "safe" && "Đủ điều kiện để chấm công"}
              {overallStatus === "risk" &&
                "Vui lòng khắc phục các vấn đề bên dưới"}
              {overallStatus === "error" && "Không thể kiểm tra an toàn"}
            </Text>
          </div>
        </div>

        {/* Check Items List */}
        <div className="flex flex-col gap-0 divide-y divider-gray-100">
          {items.map((item) => (
            <div key={item.key} className="py-4 flex items-start gap-3">
              <div
                className={`mt-0.5 ${
                  item.status === "pending"
                    ? "text-gray-400"
                    : item.status === "safe"
                      ? "text-green-500"
                      : "text-red-500"
                }`}
              >
                {item.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Text className="font-medium text-sm text-gray-700">
                    {item.label}
                  </Text>
                  {item.status === "pending" && (
                    <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                  )}
                  {item.status === "safe" && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {item.status === "risk" && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>

                {item.message && (
                  <Text
                    className={`text-xs mt-1 ${
                      item.status === "risk"
                        ? "text-red-500 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {item.message}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button - Only show Close if failed */}
        {(overallStatus === "risk" || overallStatus === "error") && (
          <div className="flex gap-3">
            <Button
              fullWidth
              variant="secondary"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              Đóng
            </Button>
            <Button
              fullWidth
              variant="primary"
              onClick={() => runChecks()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Thử lại
            </Button>
          </div>
        )}
      </Box>
    </Sheet>
  );
}
