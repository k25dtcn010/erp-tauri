import {
  Plus,
  Clock,
  TrendingUp,
  ChevronLeft,
  HelpCircle,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { PageContainer } from "@/components/layout/PageContainer";

export function OvertimeManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [filterStatus, setFilterStatus] = useState("all");

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
      label: "Ngày thường (x1.5)",
      current: 8.5,
      total: 15,
      icon: <Clock className="h-4 w-4" />,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      indicatorColor: "bg-purple-500",
    },
    {
      label: "Cuối tuần (x2.0)",
      current: 4,
      total: 8,
      icon: <CalendarDays className="h-4 w-4" />,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
      indicatorColor: "bg-indigo-500",
    },
    {
      label: "Ngày lễ (x3.0)",
      current: 0,
      total: 4,
      icon: <Zap className="h-4 w-4" />,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      indicatorColor: "bg-amber-500",
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
    <PageContainer
      title="Quản lý tăng ca"
      leftAction={
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-6 w-6 text-purple-500" />
        </Button>
      }
      rightAction={
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <HelpCircle className="h-5 w-5 text-purple-500" />
        </Button>
      }
      headerExtra={
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-11 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
            <TabsTrigger
              value="stats"
              className="rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-[#262A31] data-[state=active]:shadow-sm"
            >
              <PieChart className="h-3.5 w-3.5" />
              Thống kê
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-[#262A31] data-[state=active]:shadow-sm"
            >
              <History className="h-3.5 w-3.5" />
              Lịch sử đơn
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <Tabs value={activeTab} className="w-full">
        <TabsContent
          value="stats"
          className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400"
        >
          {/* Main Stats Hero Card */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-xl shadow-purple-500/20 rounded-[2.5rem] p-8">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-100" />
                  <span className="text-xs font-bold text-purple-100 uppercase tracking-widest">
                    Tổng giờ tăng ca
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-6xl font-black tabular-nums">12.5</h2>
                  <span className="text-xl font-bold opacity-80">giờ</span>
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
            <Card className="p-6 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm rounded-3xl">
              <div className="h-48 w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                        tick={{ fill: "#888", fontSize: 10, fontWeight: 600 }}
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
                className="p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl"
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
                      indicatorClassName={type.indicatorColor}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-purple-50/50 dark:bg-purple-500/5 rounded-[1.5rem] border border-purple-100/50 dark:border-purple-500/10 p-5 flex gap-4 transition-colors">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-tighter">
                Chính sách tăng ca
              </p>
              <p className="text-xs font-medium text-purple-700 dark:text-purple-400/80 leading-relaxed">
                Tăng ca cần được phê duyệt trước khi thực hiện. Giờ tăng ca tối
                đa là 40h/tháng theo quy định công ty.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="history"
          className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400"
        >
          {/* Filter Bar */}
          <div className="overflow-x-auto no-scrollbar py-2 -mx-4 px-4 flex items-center gap-3 mb-2">
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
                  "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border shrink-0",
                  filterStatus === filter.value
                    ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "bg-white dark:bg-[#262A31] border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400",
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
                  "p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm relative overflow-hidden transition-all hover:shadow-md rounded-[2rem]",
                  req.dimmed && "opacity-60 grayscale-[0.3]",
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center shadow-inner",
                        req.bgColor,
                        req.statusColor,
                      )}
                    >
                      {req.icon}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {req.title}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {req.dateDay} {req.dateMonth}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold bg-transparent border-gray-100 dark:border-gray-800 rounded-full px-3 py-1",
                      req.statusColor,
                    )}
                    variant="outline"
                  >
                    {req.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 mb-0 pl-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg grow">
                    <Clock className="h-3.5 w-3.5 opacity-40 text-purple-500" />
                    <span>{req.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <TrendingUp className="h-3.5 w-3.5 opacity-40 text-blue-500" />
                    <span className="text-purple-600 font-black">
                      {req.hours}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Action CTA */}
      <div className="fixed bottom-28 right-6 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-16 pl-6 pr-8 rounded-full shadow-2xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all gap-4 text-sm font-black bg-purple-600 text-white border-none group">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] uppercase font-bold text-purple-100/80 tracking-widest">
                  Tạo mới
                </span>
                <span>Yêu cầu tăng ca</span>
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[92vh] sm:h-[85vh] rounded-t-[3rem] p-0 border-none bg-gray-50 dark:bg-[#1a1d23] overflow-hidden shadow-2xl"
          >
            <SheetHeader className="p-8 pb-4 bg-white dark:bg-[#262A31] border-b border-gray-100 dark:border-[#353A45]">
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
              <SheetTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                <div className="h-12 w-12 rounded-[1.25rem] bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Plus className="h-6 w-6" />
                </div>
                Yêu cầu tăng ca mới
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-1">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <PieChart className="h-3 w-3" />
                  </div>
                  Loại tăng ca
                </Label>
                <Select>
                  <SelectTrigger className="grow w-full h-14 bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-2xl px-6 font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all focus:ring-2 focus:ring-purple-500/20">
                    <SelectValue placeholder="Chọn loại hình tăng ca" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-2xl p-2 shadow-2xl">
                    <SelectItem
                      value="normal"
                      className="rounded-xl p-3 font-bold"
                    >
                      Ngày thường (x1.5)
                    </SelectItem>
                    <SelectItem
                      value="weekend"
                      className="rounded-xl p-3 font-bold"
                    >
                      Cuối tuần (x2.0)
                    </SelectItem>
                    <SelectItem
                      value="holiday"
                      className="rounded-xl p-3 font-bold"
                    >
                      Ngày lễ (x3.0)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-1">
                  <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <CalendarDays className="h-3 w-3" />
                  </div>
                  Ngày thực hiện
                </Label>
                <Input
                  type="date"
                  className="h-14 bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-2xl px-6 font-bold shadow-sm focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-1">
                  <div className="h-5 w-5 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Clock className="h-3 w-3" />
                  </div>
                  Khung giờ
                </Label>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">
                      Từ giờ
                    </span>
                    <Input
                      type="time"
                      className="h-14 bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-2xl px-6 font-bold shadow-sm focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">
                      Đến giờ
                    </span>
                    <Input
                      type="time"
                      className="h-14 bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-2xl px-6 font-bold shadow-sm focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-1">
                  <div className="h-5 w-5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <FileText className="h-3 w-3" />
                  </div>
                  Lý do tăng ca
                </Label>
                <Textarea
                  placeholder="Nhập lý do chi tiết..."
                  className="min-h-32 bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-[2rem] p-6 font-medium resize-none shadow-sm focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="p-6 bg-purple-500/5 dark:bg-purple-500/[0.03] border border-purple-500/20 dark:border-purple-500/10 rounded-[2rem] flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-sm">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-purple-600/60 dark:text-purple-500/60 uppercase tracking-widest">
                      Dự kiến thanh toán
                    </p>
                    <p className="text-sm font-black text-purple-700 dark:text-purple-400">
                      Hệ số áp dụng: <span className="text-lg">x1.5</span>
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-white dark:bg-purple-900/20 border-purple-500/20 text-purple-600 dark:text-purple-400 font-bold px-4 py-1.5 rounded-full"
                >
                  Ước tính
                </Badge>
              </div>
            </div>

            <SheetFooter className="absolute bottom-0 left-0 right-0 p-8 bg-white dark:bg-[#262A31] border-t border-gray-100 dark:border-[#353A45] flex flex-row gap-4">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl font-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors uppercase tracking-widest text-xs"
                >
                  Hủy bỏ
                </Button>
              </SheetClose>
              <Button className="flex-[2.5] h-14 rounded-2xl font-black gap-3 shadow-2xl shadow-purple-500/30 bg-purple-600 hover:bg-purple-700 text-white border-none uppercase tracking-widest text-xs">
                <Send className="h-4 w-4" />
                Gửi yêu cầu
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </PageContainer>
  );
}
