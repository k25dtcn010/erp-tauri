import React, { useState } from "react";
import { Sheet, Text, useSnackbar, DatePicker } from "zmp-ui";
import { CalendarDays, Clock, FileText, Send, X } from "lucide-react";
import { TimePicker } from "@/components/common/TimePicker";

interface LateEarlyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LateEarlyRequestModal: React.FC<LateEarlyRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [type, setType] = useState<"late" | "early">("late");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const { openSnackbar } = useSnackbar();

  const handleSubmit = () => {
    if (!time || !reason) {
      openSnackbar({
        type: "error",
        text: "Vui lòng nhập đầy đủ thông tin!",
        duration: 3000,
      });
      return;
    }

    // Mock submit logic

    openSnackbar({
      type: "success",
      text: "Gửi yêu cầu thành công!",
      duration: 3000,
    });
    onClose();
  };

  return (
    <Sheet
      visible={isOpen}
      onClose={onClose}
      autoHeight
      mask
      handler
      swipeToClose
    >
      <div className="p-4 pb-10 bg-white dark:bg-[#1a1d23] rounded-t-3xl min-h-[60vh]">
        <div className="flex justify-between items-center mb-6">
          <Text className="text-xl font-black text-slate-800 dark:text-white">
            Xin Đi muộn / Về sớm
          </Text>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              Hình thức
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("late")}
                className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  type === "late"
                    ? "bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 shadow-sm"
                    : "bg-white border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                Đi muộn
              </button>
              <button
                onClick={() => setType("early")}
                className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  type === "early"
                    ? "bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 shadow-sm"
                    : "bg-white border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                Về sớm
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
                Ngày xin nghỉ
              </label>

              <DatePicker
                mask
                maskClosable
                title="Chọn ngày xin nghỉ"
                dateFormat="dd/mm/yyyy"
                value={date}
                onChange={(value) => setDate(value as Date)}
                inputClass="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Time */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                Giờ xin nghỉ
              </label>
              <TimePicker
                value={time}
                onChange={setTime}
                placeholder="Chọn giờ"
                inputClass="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-purple-500" />
              Lý do
            </label>
            <textarea
              placeholder="Nhập lý do cụ thể..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[100px] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#262A31] font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none resize-none transition-all shadow-sm"
            />
          </div>

          {/* Guidelines Box */}
          <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/10">
            <div className="flex gap-3">
              <div className="h-5 w-5 rounded-full bg-orange-400 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                i
              </div>
              <p className="text-[11px] text-orange-700 dark:text-orange-300 font-medium leading-relaxed">
                Đơn {type === "late" ? "đi muộn" : "về sớm"} cần được gửi trước
                thời điểm phát sinh ít nhất 30 phút để quản lý kịp thời nắm bắt
                thông tin.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSubmit}
              className="w-full h-14 rounded-2xl bg-orange-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-orange-600"
            >
              <Send className="h-4 w-4" />
              Gửi yêu cầu phê duyệt
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
