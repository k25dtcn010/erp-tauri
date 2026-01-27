import React, { useState } from "react";
import {
  Plus,
  Clock,
  TrendingUp,
  History,
  PieChart,
  Info,
  CheckCircle2,
  XCircle,
  CalendarDays,
  FileText,
  Send,
  ShieldCheck,
  Zap,
  ChevronLeft,
  Bell,
} from "lucide-react";
import {
  useNavigate,
  Box,
  Tabs,
  Sheet,
  Button as ZButton,
  Text,
  Input as ZInput,
  Select as ZSelect,
} from "zmp-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CustomPageHeader } from "@/components/layout/CustomPageHeader";

const { Option } = ZSelect;

const OvertimePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  // Check for action=new in URL to open sheet automatically
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setIsSheetVisible(true);
    }
  }, []);

  const chartData = [
    { day: "Thứ 2", hours: 2 },
    { day: "Thứ 3", hours: 3.75 },
    { day: "Thứ 4", hours: 4.5 },
    { day: "Thứ 5", hours: 1.5 },
    { day: "Thứ 6", hours: 3 },
    { day: "Thứ 7", hours: 0.5 },
    { day: "Chủ Nhật", hours: 0 },
  ];

  const chartConfig = {
    hours: {
      label: "Giờ tăng ca",
      color: "hsl(270 70% 60%)",
    },
  } satisfies ChartConfig;

  const otTypes = [
    {
      label: "Giờ tăng ca",
      current: 8.5,
      total: 15,
      icon: <Clock className="h-4 w-4" />,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      indicatorColor: "bg-purple-500",
    },
  ];

  const recentEntries = [
    {
      dateMonth: "Tháng 10",
      dateDay: "24",
      title: "Báo cáo tài chính Q4",
      time: "18:00 - 20:30",
      hours: "+2.5h",
      status: "Chờ duyệt",
      statusColor: "text-orange-500",
      bgColor: "bg-orange-500/10",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      dateMonth: "Tháng 10",
      dateDay: "22",
      title: "Bảo trì hệ thống",
      time: "17:30 - 21:30",
      hours: "+4.0h",
      status: "Đã duyệt",
      statusColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      dateMonth: "Tháng 10",
      dateDay: "20",
      title: "Họp chuẩn bị dự án",
      time: "18:00 - 19:30",
      hours: "+1.5h",
      status: "Đã duyệt",
      statusColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      dateMonth: "Tháng 10",
      dateDay: "15",
      title: "Hỗ trợ triển khai gấp",
      time: "07:30 - 08:30",
      hours: "+1.0h",
      status: "Từ chối",
      statusColor: "text-red-500",
      bgColor: "bg-red-500/10",
      icon: <XCircle className="h-4 w-4" />,
      dimmed: true,
    },
  ];

  return (
    <>
      <PageContainer
        header={
          <CustomPageHeader
            title="Tăng ca"
            subtitle="Overtime"
            onBack={() => navigate(-1)}
            variant="purple"
          />
        }
      >
        <Box className="mb-32">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            className="w-full zaui-tabs-custom"
          >
            <Tabs.Tab
              key="stats"
              label={
                <div className="flex items-center gap-2">
                  <PieChart className="h-3.5 w-3.5" />
                  <span>Thống kê</span>
                </div>
              }
            >
              <div className="mt-4 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {/* Main Stats Hero Card */}
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-xl shadow-purple-500/20 rounded-2xl p-8">
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-purple-100" />
                        <span className="text-xs font-bold text-purple-100 uppercase tracking-widest">
                          Tổng giờ tăng ca
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-6xl font-black tabular-nums">
                          12.5
                        </h2>
                        <span className="text-xl font-bold opacity-80">
                          giờ
                        </span>
                      </div>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                      <Clock className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end text-xs font-bold uppercase text-purple-100">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Tăng 12% so với tháng trước</span>
                      </div>
                      <span className="text-sm">450k VND</span>
                    </div>
                    <div className="relative h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                      <div
                        className="absolute top-0 left-0 h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"
                        style={{ width: "65%" }}
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-purple-100/60">
                        Đã duyệt
                      </span>
                      <span className="text-lg font-bold">8.5 giờ</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase font-bold text-purple-100/60">
                        Đang chờ
                      </span>
                      <span className="text-lg font-bold">4.0 giờ</span>
                    </div>
                  </div>
                </Card>

                {/* Activity Trend Chart */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                    <span>Biểu đồ hàng tuần</span>
                    <TrendingUp className="h-3.5 w-3.5 opacity-50" />
                  </h3>
                  <Card className="p-6 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-2xl overflow-hidden">
                    <div className="h-48 w-full">
                      <ChartContainer
                        config={chartConfig}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: -20,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 3"
                              stroke="#88888820"
                            />
                            <XAxis
                              dataKey="day"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tick={{
                                fill: "#888",
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent />}
                            />
                            <Bar
                              dataKey="hours"
                              fill="var(--color-hours)"
                              radius={[6, 6, 0, 0]}
                              barSize={24}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </Card>
                </div>

                {/* Breakdown Section */}
                <div className="grid grid-cols-1 gap-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                    <span>Phân loại tăng ca</span>
                    <Info className="h-3.5 w-3.5 opacity-50" />
                  </h3>
                  {otTypes.map((type, idx) => (
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
                                / {type.total}h
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={(type.current / type.total) * 100}
                            className="h-1.5 bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Info Box */}
                <div className="bg-purple-50/50 dark:bg-purple-500/5 rounded-2xl border border-purple-100/50 dark:border-purple-500/10 p-5 flex gap-4 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Info className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-tighter">
                      Chính sách tăng ca
                    </p>
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400/80 leading-relaxed">
                      Tăng ca cần được phê duyệt trước khi thực hiện.
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
                      onClick={() => setFilterStatus(filter.value)}
                      className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                        filterStatus === filter.value
                          ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/20"
                          : "bg-white dark:bg-[#262A31] border-gray-100 dark:border-gray-800 text-slate-500 dark:text-slate-400 hover:border-purple-200 dark:hover:border-purple-900/30",
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {recentEntries.map((req, idx) => (
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
                              req.statusColor,
                            )}
                          >
                            {req.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">
                              {req.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {req.dateDay} {req.dateMonth}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest bg-transparent border-none px-0",
                            req.statusColor,
                          )}
                        >
                          {req.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> Khoảng thời gian
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {req.time}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3" /> Tổng số giờ
                          </span>
                          <span className="text-[11px] font-black text-purple-600 dark:text-purple-400">
                            {req.hours}
                          </span>
                        </div>
                      </div>

                      <div className="relative p-4 bg-purple-50/30 dark:bg-purple-950/10 rounded-2xl border border-purple-100/50 dark:border-purple-900/20">
                        <FileText className="absolute right-3 top-3 h-4 w-4 text-purple-200 dark:text-purple-900/40" />
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                          Yêu cầu tăng ca cho dự án và báo cáo cuối kỳ.
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

      {/* Floating Action CTA - Moved outside PageContainer and increased z-index */}
      <div className="fixed bottom-28 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-auto">
        {/* Tăng ca Button */}
        <button
          className="w-52 h-16 pl-4 pr-8 rounded-2xl shadow-xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white border-none group relative overflow-hidden outline-none"
          onClick={() => setIsSheetVisible(true)}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shrink-0 shadow-lg border border-white/20">
            <Plus className="h-7 w-7" />
          </div>
          <div className="flex flex-col items-start leading-tight whitespace-nowrap z-10">
            <span className="text-[10px] uppercase font-black text-purple-100/70 tracking-widest block text-left mb-0.5">
              Đăng ký
            </span>
            <span className="block text-left text-base font-black tracking-tight">
              Tăng ca
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
        <div className="flex flex-col h-[85vh] w-full max-w-3xl mx-auto bg-white dark:bg-[#1a1d23] sm:rounded-t-[2rem] overflow-hidden relative text-left">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#353A45] flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#1a1d23]/95 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-sm">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Tăng ca mới
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Đăng ký tăng ca
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
            {/* Overtime Type */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <PieChart className="h-3.5 w-3.5 text-purple-500" />
                Loại hình
              </label>
              <ZSelect
                placeholder="Chọn loại hình"
                closeOnSelect
                className="h-12 text-sm font-bold bg-transparent"
                mask
              >
                <Option value="normal" title="Ngày thường (x1.5)" />
                <Option value="weekend" title="Cuối tuần (x2.0)" />
                <Option value="holiday" title="Ngày lễ (x3.0)" />
              </ZSelect>
            </div>

            {/* Date & Time Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                  Ngày thực hiện
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700  bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                  Thời gian
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="time"
                      className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 px-3 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm text-center"
                    />
                  </div>
                  <span className="text-slate-300 font-black">-</span>
                  <div className="relative flex-1">
                    <input
                      type="time"
                      className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 px-3 bg-white dark:bg-[#262A31] font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                Lý do
              </label>
              <textarea
                placeholder="Nhập lý do chi tiết..."
                className="w-full min-h-[120px] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#262A31] font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none resize-none transition-all shadow-sm"
              />
            </div>

            {/* Estimate Box - Elegant Design */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-purple-500/20 flex items-center justify-center text-purple-600 shadow-sm shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-purple-600/70 dark:text-purple-400/70 uppercase tracking-widest">
                      Dự kiến
                    </p>
                    <span className="text-[10px] font-bold bg-white dark:bg-purple-900/40 px-2 py-0.5 rounded-full text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                      x1.5
                    </span>
                  </div>
                  <p className="text-sm font-black text-purple-900 dark:text-white mt-0.5">
                    2.5 giờ công
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-purple-200/50 flex justify-between sm:block text-right">
                <span className="text-xs font-bold text-slate-500 block">
                  Cộng lương
                </span>
                <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                  ~350.000đ
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
              <button className="flex-[2] h-12 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 hover:bg-purple-700 transition-all active:scale-[0.98]">
                <Send className="h-4 w-4" />
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
};

export default OvertimePage;
