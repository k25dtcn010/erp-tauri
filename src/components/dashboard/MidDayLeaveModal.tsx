import React, { useState, useCallback } from "react";
import { Sheet, Button as ZButton, useSnackbar } from "zmp-ui";
import { X, Coffee, Clock, Calendar, Send } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface MidDayLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MidDayLeaveModal: React.FC<MidDayLeaveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { openSnackbar } = useSnackbar();
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total hours
  const calculateTotalHours = useCallback(() => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diffMinutes = endMinutes - startMinutes;
    return diffMinutes > 0 ? diffMinutes / 60 : 0;
  }, [startTime, endTime]);

  const totalHours = calculateTotalHours();

  // Validation
  const validate = useCallback(() => {
    if (!selectedDate) {
      openSnackbar({
        type: "error",
        text: "Vui lòng chọn ngày nghỉ",
        duration: 3000,
      });
      return false;
    }

    if (!startTime || !endTime) {
      openSnackbar({
        type: "error",
        text: "Vui lòng chọn giờ bắt đầu và giờ kết thúc",
        duration: 3000,
      });
      return false;
    }

    if (totalHours <= 0) {
      openSnackbar({
        type: "error",
        text: "Giờ kết thúc phải sau giờ bắt đầu",
        duration: 3000,
      });
      return false;
    }

    if (totalHours < 0.5) {
      openSnackbar({
        type: "error",
        text: "Thời gian nghỉ tối thiểu là 30 phút",
        duration: 3000,
      });
      return false;
    }

    if (totalHours > 4) {
      openSnackbar({
        type: "error",
        text: "Thời gian nghỉ tối đa là 4 giờ",
        duration: 3000,
      });
      return false;
    }

    return true;
  }, [selectedDate, startTime, endTime, totalHours, openSnackbar]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Mock API call - Save to local storage
      const employeeId = localStorage.getItem("cached_employeeId") || "";
      const existingData = localStorage.getItem("midDayLeaveRequests");
      const requests = existingData ? JSON.parse(existingData) : [];

      const newRequest = {
        id: `mid-day-${Date.now()}`,
        employeeId,
        date: selectedDate,
        startTime,
        endTime,
        totalHours: parseFloat(totalHours.toFixed(2)),
        reason: "",
        status: "pending",
        type: "Nghỉ giữa giờ",
        createdAt: new Date().toISOString(),
      };

      requests.unshift(newRequest);
      localStorage.setItem("midDayLeaveRequests", JSON.stringify(requests));

      openSnackbar({
        type: "success",
        text: "Đã gửi đơn nghỉ giữa giờ thành công!",
        duration: 3000,
      });

      // Reset form
      setSelectedDate(format(new Date(), "yyyy-MM-dd"));
      setStartTime("14:00");
      setEndTime("16:00");

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error("Failed to submit mid-day leave request", error);
      openSnackbar({
        type: "error",
        text: "Gửi đơn thất bại. Vui lòng thử lại!",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, selectedDate, startTime, endTime, totalHours, onSuccess, onClose, openSnackbar]);

  return (
    <Sheet
      visible={isOpen}
      onClose={onClose}
      autoHeight
      mask
      handler
      swipeToClose
    >
      <div className="p-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Coffee className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Nghỉ giữa giờ
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đăng ký nghỉ vài giờ trong ngày
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-orange-500" />
              Ngày nghỉ
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4 text-orange-500" />
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4 text-orange-500" />
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Total Hours Display */}
          <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tổng thời gian nghỉ:
              </span>
              <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                {totalHours > 0 ? `${totalHours.toFixed(1)} giờ` : "0 giờ"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Gửi đơn
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
