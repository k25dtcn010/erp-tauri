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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
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
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";

export function LeaveManagement() {
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
    <PageContainer
      title="Quản lý nghỉ phép"
      leftAction={
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </Button>
      }
      rightAction={
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <HelpCircle className="h-5 w-5 text-orange-500" />
        </Button>
      }
      headerExtra={
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-11 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
            <TabsTrigger
              value="balance"
              className="rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-[#262A31] data-[state=active]:shadow-sm"
            >
              <PieChart className="h-3.5 w-3.5" />
              Quỹ phép
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
          value="balance"
          className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400"
        >
          {/* Main Balance Hero Card */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-xl shadow-orange-500/20 rounded-[2.5rem] p-8">
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
                      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
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
                      indicatorClassName={type.indicatorColor}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50/50 dark:bg-blue-500/5 rounded-[1.5rem] border border-blue-100/50 dark:border-blue-500/10 p-5 flex gap-4 transition-colors">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-tighter">
                Thông báo quan trọng
              </p>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400/80 leading-relaxed">
                Phép năm của bạn sẽ được đặt lại vào ngày 01/01/2026. Các đơn
                nghỉ phép chưa chốt có thể mất 24h để cập nhật.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="history"
          className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400"
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              Nhật ký gần đây
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-[10px] font-bold uppercase gap-1 text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Bộ lọc
            </Button>
          </div>

          <div className="space-y-4">
            {requests.map((req, idx) => (
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
        </TabsContent>
      </Tabs>

      {/* Floating Action CTA */}
      <div className="fixed bottom-28 right-6 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-16 pl-6 pr-8 rounded-full shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all gap-4 text-sm font-black bg-orange-500 text-white border-none group">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] uppercase font-bold text-orange-100/80 tracking-widest">
                  Tạo mới
                </span>
                <span>Đơn nghỉ phép</span>
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
                <div className="h-12 w-12 rounded-[1.25rem] bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Plus className="h-6 w-6" />
                </div>
                Tạo đơn nghỉ phép mới
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-1">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <PieChart className="h-3 w-3" />
                  </div>
                  Loại nghỉ phép
                </Label>
                <Select>
                  <SelectTrigger className="grow w-full h-14 bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-2xl px-6 font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all focus:ring-2 focus:ring-orange-500/20">
                    <SelectValue placeholder="Chọn loại hình nghỉ phép" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-2xl p-2 shadow-2xl">
                    <SelectItem
                      value="annual"
                      className="rounded-xl p-3 font-bold"
                    >
                      Nghỉ phép năm
                    </SelectItem>
                    <SelectItem
                      value="sick"
                      className="rounded-xl p-3 font-bold"
                    >
                      Nghỉ ốm (BHXH)
                    </SelectItem>
                    <SelectItem
                      value="casual"
                      className="rounded-xl p-3 font-bold"
                    >
                      Việc riêng
                    </SelectItem>
                    <SelectItem
                      value="unpaid"
                      className="rounded-xl p-3 font-bold"
                    >
                      Nghỉ không lương
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-1">
                  <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <CalendarDays className="h-3 w-3" />
                  </div>
                  Thời gian nghỉ
                </Label>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">
                      Từ ngày
                    </span>
                    <Input
                      type="date"
                      className="h-14 bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-2xl px-6 font-bold shadow-sm focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">
                      Đến ngày
                    </span>
                    <Input
                      type="date"
                      className="h-14 bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-2xl px-6 font-bold shadow-sm focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-1">
                  <div className="h-5 w-5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <FileText className="h-3 w-3" />
                  </div>
                  Lý do xin nghỉ
                </Label>
                <Textarea
                  placeholder="Nhập lý do cụ thể để được duyệt nhanh hơn..."
                  className="min-h-32 bg-white dark:bg-[#262A31] border-gray-100 dark:border-[#353A45] rounded-[2rem] p-6 font-medium resize-none shadow-sm focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="p-6 bg-emerald-500/5 dark:bg-emerald-500/[0.03] border border-emerald-500/20 dark:border-emerald-500/10 rounded-[2rem] flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-500/60 uppercase tracking-widest">
                      Phê duyệt dự kiến
                    </p>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      Số dư sau khi nghỉ:{" "}
                      <span className="text-lg">13 ngày</span>
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-white dark:bg-emerald-900/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-4 py-1.5 rounded-full"
                >
                  Hợp lệ
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
              <Button className="flex-[2.5] h-14 rounded-2xl font-black gap-3 shadow-2xl shadow-orange-500/30 bg-orange-500 hover:bg-orange-600 text-white border-none uppercase tracking-widest text-xs">
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
