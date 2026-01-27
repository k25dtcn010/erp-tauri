import React, { useState } from "react";
import {
  HelpCircle,
  Calendar,
  Plus,
  ChevronLeft,
  Palmtree,
  Stethoscope,
  Briefcase,
  History,
  PieChart,
  ArrowRight,
  Info,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarDays,
  FileText,
  Send,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Page,
  Header,
  useNavigate,
  Box,
  Tabs,
  Sheet,
  Button as ZButton,
  Icon,
  Text,
  Input as ZInput,
  Select as ZSelect,
} from "zmp-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const { Option } = ZSelect;

const LeavePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("balance");
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const leaveTypes = [
    {
      label: "Phép năm",
      current: 12,
      total: 20,
      icon: <Palmtree className="h-4 w-4" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      indicatorColor: "bg-emerald-500",
    },
    {
      label: "Nghỉ ốm",
      current: 5,
      total: 10,
      icon: <Stethoscope className="h-4 w-4" />,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
      indicatorColor: "bg-orange-500",
    },
    {
      label: "Việc riêng",
      current: 1,
      total: 5,
      icon: <Briefcase className="h-4 w-4" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      indicatorColor: "bg-blue-500",
    },
  ];

  const requests = [
    {
      type: "Nghỉ ốm",
      status: "Đã duyệt",
      startDate: "12/10",
      endDate: "14/10",
      duration: "3 ngày",
      reason: "Sốt cao và cảm cúm",
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      type: "Nghỉ phép năm",
      status: "Chờ duyệt",
      startDate: "20/11",
      endDate: "25/11",
      duration: "5 ngày",
      reason: "Nghỉ lễ cùng gia đình",
      icon: <Clock className="h-4 w-4" />,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      type: "Việc riêng",
      status: "Từ chối",
      startDate: "01/09",
      endDate: "01/09",
      duration: "1 ngày",
      reason: "Giải quyết việc gia đình",
      icon: <XCircle className="h-4 w-4" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      dimmed: true,
    },
  ];

  return (
    <Page className="bg-gray-50/50">
      <Header
        title="Quản lý nghỉ phép"
        showBackIcon={true}
        onBackClick={() => navigate(-1)}
      />

      <Box className="pb-32">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          className="w-full zaui-tabs-custom"
        >
          <Tabs.Tab
            key="balance"
            label={
              <div className="flex items-center gap-2">
                <PieChart className="h-3.5 w-3.5" />
                <span>Quỹ phép</span>
              </div>
            }
          >
            <div className="mt-4 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
              {/* Main Balance Hero Card */}
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-xl shadow-orange-500/20 rounded-2xl p-8">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-orange-100" />
                      <span className="text-xs font-bold text-orange-100 uppercase tracking-widest">
                        Tổng số phép khả dụng
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-6xl font-black tabular-nums">18</h2>
                      <span className="text-xl font-bold opacity-80">ngày</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                    <Calendar className="h-7 w-7" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end text-xs font-bold uppercase text-orange-100">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Tỷ lệ sử dụng tốt</span>
                    </div>
                    <span className="text-sm">72% đã dùng</span>
                  </div>
                  <div className="relative h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                    <div
                      className="absolute top-0 left-0 h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"
                      style={{ width: "72%" }}
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-orange-100/60">
                      Đã nghỉ
                    </span>
                    <span className="text-lg font-bold">12 ngày</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase font-bold text-orange-100/60">
                      Tổng định mức
                    </span>
                    <span className="text-lg font-bold">30 ngày</span>
                  </div>
                </div>
              </Card>

              {/* Detailed Types Breakdown */}
              <div className="grid grid-cols-1 gap-4">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                  <span>Chi tiết định mức</span>
                  <Info className="h-3.5 w-3.5 opacity-50" />
                </h3>
                {leaveTypes.map((type, idx) => (
                  <Card
                    key={idx}
                    className="p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                          type.bgColor,
                          type.color,
                        )}
                      >
                        {type.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {type.label}
                          </h4>
                          <div className="text-right">
                            <span className="text-sm font-black tabular-nums text-slate-700 dark:text-slate-200">
                              {type.current}
                            </span>
                            <span className="text-xs font-bold text-slate-400 ml-1">
                              / {type.total} ngày
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={(type.current / type.total) * 100}
                          className="h-2 bg-gray-100 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100/50 dark:border-blue-500/10 p-5 flex gap-4 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Info className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-tighter">
                    Thông báo quan trọng
                  </p>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400/80 leading-relaxed">
                    Phép năm của bạn sẽ được đặt lại vào ngày 01/01/2026. Các
                    đơn nghỉ phép chưa chốt có thể mất 24h để cập nhật.
                  </p>
                </div>
              </div>
            </div>
          </Tabs.Tab>
          <Tabs.Tab
            key="history"
            label={
              <div className="flex items-center gap-2">
                <History className="h-3.5 w-3.5" />
                <span>Lịch sử đơn</span>
              </div>
            }
          >
            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                  Nhật ký gần đây
                </h3>
                <ZButton
                  variant="tertiary"
                  size="small"
                  className="h-8 rounded-full text-[10px] font-bold uppercase text-slate-500"
                >
                  Bộ lọc
                </ZButton>
              </div>

              <div className="space-y-4">
                {requests.map((req, idx) => (
                  <Card
                    key={idx}
                    className={cn(
                      "p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm relative overflow-hidden transition-all hover:shadow-md rounded-2xl",
                      req.dimmed && "opacity-60 grayscale-[0.3]",
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center shadow-inner",
                            req.bgColor,
                            req.color,
                          )}
                        >
                          {req.icon}
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {req.type}
                        </h4>
                      </div>
                      <Badge
                        className={cn(
                          "text-[10px] font-bold bg-transparent border-gray-100 dark:border-gray-800 rounded-full px-3 py-1",
                          req.color,
                        )}
                        variant="outline"
                      >
                        {req.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 mb-3 pl-1">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 opacity-40 text-orange-500" />
                        <span>{req.startDate}</span>
                        <ArrowRight className="h-3 w-3 opacity-30 mx-1" />
                        <span>{req.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <Clock className="h-3.5 w-3.5 opacity-40 text-blue-500" />
                        <span>{req.duration}</span>
                      </div>
                    </div>

                    <div className="relative p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border-l-[3px] border-orange-500/30 ml-1">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 italic">
                        {req.reason}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Tabs.Tab>
        </Tabs>
      </Box>

      {/* Floating Action CTA */}
      <div className="fixed bottom-28 right-6 z-40">
        <button
          className="h-16 pl-4 pr-8 rounded-full shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 text-sm font-black bg-orange-500 text-white border-none group"
          onClick={() => setIsSheetVisible(true)}
        >
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shrink-0">
            <Plus className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-start leading-tight whitespace-nowrap">
            <span className="text-[10px] uppercase font-bold text-orange-100/80 tracking-widest block text-left">
              Tạo mới
            </span>
            <span className="block text-left">Đơn nghỉ phép</span>
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
        <div className="flex flex-col h-[85vh] w-full max-w-3xl mx-auto bg-white dark:bg-[#1a1d23] sm:rounded-t-[2rem] overflow-hidden relative text-left">
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
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-orange-800 dark:text-orange-200 uppercase tracking-wider">
                    Phép năm khả dụng
                  </span>
                  <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                    12
                    <span className="text-xs font-medium text-slate-400 ml-1">
                      /20
                    </span>
                  </span>
                </div>
                <div className="w-full bg-white dark:bg-slate-700 h-2 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-orange-500 h-full rounded-full w-[60%] shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
                </div>
                <p className="text-[10px] font-medium text-orange-600/70 dark:text-orange-400/60 mt-2 italic flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  Bạn còn 12 ngày phép năm có thể sử dụng
                </p>
              </div>
              <ZSelect
                placeholder="Chọn loại hình"
                closeOnSelect
                className="h-12 text-sm font-bold bg-transparent"
                mask
                defaultValue="annual" // Set default to annual to match the balance shown
              >
                <Option value="annual" title="Phép năm (Còn 12 ngày)" />
                <Option value="sick" title="Nghỉ ốm (Còn 5 ngày)" />
                <Option value="casual" title="Việc riêng (Còn 1 ngày)" />
                <Option value="unpaid" title="Nghỉ không lương" />
              </ZSelect>
            </div>

            {/* Date Range Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                  Từ ngày
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700  bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                  Đến ngày
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700  bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
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
                className="w-full min-h-[120px] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#262A31] font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none resize-none transition-all shadow-sm"
              />
            </div>

            {/* Estimate Box - Emerald Theme for Valid State */}
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
                    Dự kiến: 3 ngày
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-emerald-200/50 flex justify-between sm:block text-right">
                <span className="text-xs font-bold text-slate-500 block">
                  Số dư còn lại
                </span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  13 ngày
                </span>
              </div>
            </div>
          </div>

          {/* Footer - Sticky with safe area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#1a1d23] z-30 pb-safe">
            <div className="flex gap-3 max-w-3xl mx-auto">
              <button
                onClick={() => setIsSheetVisible(false)}
                className="flex-1 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button className="flex-[2] h-12 rounded-xl bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-[0.98]">
                <Send className="h-4 w-4" />
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      </Sheet>
    </Page>
  );
};

export default LeavePage;
