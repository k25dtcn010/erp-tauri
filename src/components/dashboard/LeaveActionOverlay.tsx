import React, { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  XCircle,
  PieChart,
  Info,
  CalendarDays,
  FileText,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Sheet, Select as ZSelect, DatePicker, useSnackbar } from "zmp-ui";
import { LateEarlyRequestModal } from "./LateEarlyRequestModal";
import {
  getApiV3LeavePolicies,
  postApiV3LeaveRequests,
  getApiV3LeavePoliciesBalances,
} from "@/client-timekeeping/sdk.gen";
import { getApiEmployeesMe } from "@/client/sdk.gen";
import {
  differenceInCalendarDays,
  addDays,
  format,
  startOfDay,
} from "date-fns";

const { Option } = ZSelect;

const LeaveActionOverlay: React.FC = () => {
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isLateEarlyModalOpen, setIsLateEarlyModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(startOfDay(addDays(new Date(), 1)));
  const [reason, setReason] = useState("");
  const [policies, setPolicies] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action === "late-early") {
      setIsLateEarlyModalOpen(true);
    } else if (action === "new-leave") {
      setIsSheetVisible(true);
    }

    // Fetch policies
    getApiV3LeavePolicies().then((res) => {
      if (res.data && res.data.policies) {
        setPolicies(res.data.policies as any[]);
        if (res.data.policies.length > 0) {
          setSelectedPolicyId(res.data.policies[0].id);
        }
      }
    });

    // Fetch balances
    getApiV3LeavePoliciesBalances().then((res) => {
      if (res.data && res.data.balances) {
        setBalances(res.data.balances as any[]);
      }
    });

    // Get companyId from user info
    getApiEmployeesMe().then((res) => {
      if (res.data) {
        const data = (res.data as any).data;
        const cId =
          data.primaryCompany?.id ||
          (data.companies && data.companies[0]?.companyId);
        if (cId) setCompanyId(cId);
      }
    });
  }, []);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diff =
      differenceInCalendarDays(startOfDay(endDate), startOfDay(startDate)) + 1;
    return diff > 0 ? diff : 0;
  };

  const translateError = (error: any) => {
    const message =
      error?.message || error?.error?.message || error?.data?.message || "";
    if (message.includes("Leave duration must be greater than 0")) {
      return "Thời gian nghỉ không hợp lệ hoặc không có ngày làm việc nào trong khoảng thời gian này";
    }
    if (message.toLowerCase().includes("insufficient balance")) {
      return "Số dư phép không đủ để thực hiện yêu cầu này";
    }
    if (message.toLowerCase().includes("overlap")) {
      return "Thời gian nghỉ bị trùng với một đơn khác đã xin";
    }
    return message || "Gửi yêu cầu thất bại. Vui lòng thử lại sau";
  };

  const handleSubmit = async () => {
    if (!companyId || !selectedPolicyId) {
      openSnackbar({
        type: "error",
        text: "Vui lòng chọn đầy đủ thông tin loại phép",
      });
      return;
    }

    const days = calculateDays();
    if (days <= 0) {
      openSnackbar({
        type: "error",
        text: "Ngày kết thúc phải sau hoặc trùng với ngày bắt đầu",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await postApiV3LeaveRequests({
        body: {
          companyId,
          policyId: selectedPolicyId,
          startDate: format(startOfDay(startDate), "yyyy-MM-dd"),
          endDate: format(startOfDay(endDate), "yyyy-MM-dd"),
          days,
          reason,
        },
      });

      if (res.data) {
        openSnackbar({
          type: "success",
          text: "Gửi yêu cầu thành công",
        });
        setIsSheetVisible(false);
        setReason("");
        // Notify pages to refresh data without reload
        window.dispatchEvent(new CustomEvent("leave-request-submitted"));
      } else if (res.error) {
        openSnackbar({
          type: "error",
          text: translateError(res.error),
        });
      }
    } catch (error: any) {
      console.error("Failed to submit leave request", error);
      openSnackbar({
        type: "error",
        text: translateError(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);
  const selectedBalance = balances.find((b) => b.policyId === selectedPolicyId);

  const availableDays = selectedBalance?.availableDays || 0;
  const entitledDays = selectedBalance?.entitledDays || 0;
  const usedDays = selectedBalance?.usedDays || 0;
  const progressPercent =
    entitledDays > 0 ? (availableDays / entitledDays) * 100 : 0;

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-28 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-auto">
        {/* Đi muộn / Về sớm Button */}
        <button
          className="w-52 h-14 pl-4 pr-6 rounded-2xl shadow-lg shadow-orange-500/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 bg-white dark:bg-[#1a1d23] text-slate-800 dark:text-white border border-orange-50 dark:border-orange-900/20 group relative overflow-hidden"
          onClick={() => setIsLateEarlyModalOpen(true)}
        >
          <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors pointer-events-none" />
          <div className="h-9 w-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 transition-all duration-300 shrink-0 group-hover:bg-orange-600 group-hover:text-white">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-start leading-tight whitespace-nowrap z-10">
            <span className="text-[9px] uppercase font-black text-orange-600/60 dark:text-orange-400/60 tracking-widest block text-left mb-0.5">
              Tạo đơn
            </span>
            <span className="block text-left text-xs font-bold text-slate-700 dark:text-slate-200">
              Đi muộn / Về sớm
            </span>
          </div>
        </button>

        {/* Nghỉ phép Button */}
        <button
          className="w-52 h-16 pl-4 pr-8 rounded-2xl shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white border-none group relative overflow-hidden"
          onClick={() => setIsSheetVisible(true)}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shrink-0 shadow-lg border border-white/20">
            <Plus className="h-7 w-7" />
          </div>
          <div className="flex flex-col items-start leading-tight whitespace-nowrap z-10">
            <span className="text-[10px] uppercase font-black text-orange-100/70 tracking-widest block text-left mb-0.5">
              Tạo yêu cầu
            </span>
            <span className="block text-left text-base font-black tracking-tight">
              Nghỉ phép
            </span>
          </div>
        </button>
      </div>

      <Sheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        mask
        handler
        swipeToClose
      >
        <div className="flex flex-col h-[90vh] w-full max-w-3xl mx-auto bg-white dark:bg-[#1a1d23] sm:rounded-t-[2rem] overflow-hidden relative text-left">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#353A45] flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#1a1d23]/95 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-sm">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Đơn nghỉ phép
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tạo yêu cầu nghỉ phép mới
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSheetVisible(false)}
              className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-6 pb-24">
            {/* Leave Type with Live Balance Context */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <PieChart className="h-3.5 w-3.5 text-orange-500" />
                Loại nghỉ phép
              </label>
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/10 rounded-2xl p-4 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-orange-800/70 dark:text-orange-200/70 uppercase tracking-widest">
                    {selectedPolicy?.name || "Số dư phép"} khả dụng
                  </span>
                  <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                    {availableDays}
                    <span className="text-xs font-bold text-slate-400 ml-1">
                      /{entitledDays}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-white dark:bg-slate-700 h-2 rounded-full overflow-hidden shadow-inner mt-2">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-orange-600/70 dark:text-orange-400/60 mt-3 italic flex items-center gap-1.5 leading-none">
                  <Info className="h-3 w-3" />
                  Bạn đã sử {usedDays} ngày phép trong năm nay
                </p>
              </div>
              <ZSelect
                placeholder="Chọn loại hình"
                closeOnSelect
                className="h-12 text-sm font-bold bg-transparent"
                mask
                value={selectedPolicyId}
                onChange={(val) => setSelectedPolicyId(val as string)}
              >
                {policies.map((policy) => (
                  <Option
                    key={policy.id}
                    value={policy.id}
                    title={policy.name}
                  />
                ))}
              </ZSelect>
            </div>

            {/* Date Range Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
                  Từ ngày
                </label>
                <div className="relative">
                  <DatePicker
                    mask
                    maskClosable
                    title="Chọn ngày bắt đầu"
                    dateFormat="dd/mm/yyyy"
                    value={startDate}
                    onChange={(value) => setStartDate(value as Date)}
                    inputClass="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
                  Đến ngày
                </label>
                <div className="relative">
                  <DatePicker
                    mask
                    maskClosable
                    title="Chọn ngày kết thúc"
                    dateFormat="dd/mm/yyyy"
                    value={endDate}
                    onChange={(value) => setEndDate(value as Date)}
                    inputClass="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
                  />
                </div>
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
                className="w-full min-h-[120px] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#262A31] font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none resize-none transition-all shadow-sm"
              />
            </div>

            {/* Estimate Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">
                      Trạng thái
                    </p>
                    <span className="text-[10px] font-bold bg-white dark:bg-emerald-900/40 px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                      Hợp lệ
                    </span>
                  </div>
                  <p className="text-sm font-black text-emerald-900 dark:text-white mt-0.5">
                    Dự kiến: {calculateDays()} ngày
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-emerald-200/50 flex justify-between sm:block text-right">
                <span className="text-xs font-bold text-slate-500 block">
                  Số dư còn lại
                </span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {Math.max(0, availableDays - calculateDays())} ngày
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#1a1d23] z-30 pb-safe">
            <div className="flex gap-3 max-w-3xl mx-auto">
              <button
                onClick={() => setIsSheetVisible(false)}
                className="flex-1 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] h-12 rounded-xl bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      </Sheet>

      <LateEarlyRequestModal
        isOpen={isLateEarlyModalOpen}
        onClose={() => setIsLateEarlyModalOpen(false)}
      />
    </>
  );
};

export default LeaveActionOverlay;
