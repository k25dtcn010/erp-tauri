import React, { useState, useEffect } from "react";
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
  Bell,
} from "lucide-react";
import {
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";
import LeaveActionOverlay from "@/components/dashboard/LeaveActionOverlay";

const { Option } = ZSelect;

const LeavePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("balance");

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
    <div className="relative">
      <PageContainer
        header={
          <CustomPageHeader
            title="Nghỉ phép"
            subtitle="Leave"
            onBack={() => navigate(-1)}
            variant="orange"
          />
        }
      >
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
                        <span className="text-xl font-bold opacity-80">
                          ngày
                        </span>
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
              <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {/* Filter Bar */}
                <div className="overflow-x-auto no-scrollbar py-2 -mx-1 px-1 flex items-center gap-3">
                  {[
                    { label: "Tất cả", value: "all" },
                    { label: "Chờ duyệt", value: "pending" },
                    { label: "Đã duyệt", value: "approved" },
                    { label: "Từ chối", value: "rejected" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                        filter.value === "all"
                          ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-500/20"
                          : "bg-white dark:bg-[#262A31] border-gray-100 dark:border-gray-800 text-slate-500 dark:text-slate-400 hover:border-orange-200 dark:hover:border-orange-900/30",
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {requests.map((req, idx) => (
                    <Card
                      key={idx}
                      className={cn(
                        "p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:translate-y-[-2px] rounded-2xl group",
                        req.dimmed && "opacity-60 grayscale-[0.3]",
                      )}
                    >
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300",
                              req.bgColor,
                              req.color,
                            )}
                          >
                            {req.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">
                              {req.type}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                ID: {Math.floor(Math.random() * 10000)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest bg-transparent border-none px-0",
                            req.color,
                          )}
                        >
                          {req.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3" /> Thời gian nghỉ
                          </span>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            <span>{req.startDate}</span>
                            <ArrowRight className="h-3 w-3 opacity-30" />
                            <span>{req.endDate}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> Tổng thời gian
                          </span>
                          <span className="text-[11px] font-black text-orange-600 dark:text-orange-400">
                            {req.duration}
                          </span>
                        </div>
                      </div>

                      <div className="relative p-4 bg-orange-50/30 dark:bg-orange-950/10 rounded-2xl border border-orange-100/50 dark:border-orange-900/20">
                        <FileText className="absolute right-3 top-3 h-4 w-4 text-orange-200 dark:text-orange-900/40" />
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
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
      </PageContainer>

      <LeaveActionOverlay />
    </div>
  );
};

export default LeavePage;
