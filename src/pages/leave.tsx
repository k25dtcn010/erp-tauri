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
import { useUserStore } from "@/store/user-store";
import {
  getApiV3LeaveRequestsMy,
  getApiV3LeavePoliciesBalances,
} from "@/client-timekeeping/sdk.gen";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const { Option } = ZSelect;

const LeavePage: React.FC = () => {
  const navigate = useNavigate();
  const { userName, userAvatar } = useUserStore();
  const [activeTab, setActiveTab] = useState("balance");

  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [historyRequests, setHistoryRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balancesRes, requestsRes] = await Promise.all([
        getApiV3LeavePoliciesBalances(),
        getApiV3LeaveRequestsMy({
          query: { limit: "50" },
        }),
      ]);

      if (balancesRes.data?.balances) {
        setLeaveBalances(balancesRes.data.balances);
      }

      if (requestsRes.data?.requests) {
        setHistoryRequests(requestsRes.data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch leave data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleRefresh = () => fetchData();
    window.addEventListener("leave-request-submitted", handleRefresh);
    return () =>
      window.removeEventListener("leave-request-submitted", handleRefresh);
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return {
          label: "Đã duyệt",
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          icon: <CheckCircle2 className="h-4 w-4" />,
        };
      case "PENDING":
        return {
          label: "Chờ duyệt",
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          icon: <Clock className="h-4 w-4" />,
        };
      case "REJECTED":
        return {
          label: "Từ chối",
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          icon: <XCircle className="h-4 w-4" />,
        };
      case "CANCELLED":
        return {
          label: "Đã hủy",
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          icon: <XCircle className="h-4 w-4" />,
        };
      default:
        return {
          label: status,
          color: "text-slate-500",
          bgColor: "bg-slate-500/10",
          icon: <HelpCircle className="h-4 w-4" />,
        };
    }
  };

  const getPolicyIcon = (name: string) => {
    const lowName = name.toLowerCase();
    if (lowName.includes("phép năm") || lowName.includes("annual"))
      return <Palmtree className="h-4 w-4" />;
    if (lowName.includes("ốm") || lowName.includes("sick"))
      return <Stethoscope className="h-4 w-4" />;
    return <Briefcase className="h-4 w-4" />;
  };

  const filteredRequests = historyRequests.filter((req) => {
    if (filter === "all") return true;
    return req.status.toLowerCase() === filter.toLowerCase();
  });

  const totalAvailable = leaveBalances.reduce(
    (acc, b) => acc + (b.availableDays || 0),
    0,
  );
  const totalEntitled = leaveBalances.reduce(
    (acc, b) => acc + (b.entitledDays || 0),
    0,
  );
  const totalUsed = leaveBalances.reduce(
    (acc, b) => acc + (b.usedDays || 0),
    0,
  );
  const usageRate = totalEntitled > 0 ? (totalUsed / totalEntitled) * 100 : 0;

  return (
    <div className="relative">
      <PageContainer
        header={
          <CustomPageHeader
            title="Nghỉ phép"
            subtitle="Leave"
            user={{ name: userName, avatar: userAvatar }}
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
                        <h2 className="text-6xl font-black tabular-nums">
                          {totalAvailable}
                        </h2>
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
                      <span className="text-sm">
                        {Math.round(usageRate)}% đã dùng
                      </span>
                    </div>
                    <div className="relative h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                      <div
                        className="absolute top-0 left-0 h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"
                        style={{ width: `${usageRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-orange-100/60">
                        Đã nghỉ
                      </span>
                      <span className="text-lg font-bold">
                        {totalUsed} ngày
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase font-bold text-orange-100/60">
                        Tổng định mức
                      </span>
                      <span className="text-lg font-bold">
                        {totalEntitled} ngày
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Detailed Types Breakdown */}
                <div className="grid grid-cols-1 gap-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                    <span>Chi tiết định mức</span>
                    <Info className="h-3.5 w-3.5 opacity-50" />
                  </h3>
                  {leaveBalances.map((balance, idx) => (
                    <Card
                      key={idx}
                      className="p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl"
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm bg-orange-500/10 text-orange-600 dark:text-orange-400">
                          {getPolicyIcon(balance.policyName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {balance.policyName}
                            </h4>
                            <div className="text-right">
                              <span className="text-sm font-black tabular-nums text-slate-700 dark:text-slate-200">
                                {balance.availableDays}
                              </span>
                              <span className="text-xs font-bold text-slate-400 ml-1">
                                / {balance.entitledDays} ngày
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={
                              (balance.availableDays / balance.entitledDays) *
                              100
                            }
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
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                        f.value === filter
                          ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-500/20"
                          : "bg-white dark:bg-[#262A31] border-gray-100 dark:border-gray-800 text-slate-500 dark:text-slate-400 hover:border-orange-200 dark:hover:border-orange-900/30",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredRequests.map((req, idx) => {
                    const statusInfo = getStatusInfo(req.status);
                    return (
                      <Card
                        key={idx}
                        className={cn(
                          "p-5 border-gray-100 dark:border-[#353A45] bg-white dark:bg-[#262A31] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:translate-y-[-2px] rounded-2xl group",
                          req.status?.toLowerCase() === "cancelled" &&
                            "opacity-60 grayscale-[0.3]",
                        )}
                      >
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300",
                                statusInfo.bgColor,
                                statusInfo.color,
                              )}
                            >
                              {getPolicyIcon(req.policyName || "")}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">
                                {req.policyName || "Nghỉ phép"}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                  ID: {req.id.slice(-6).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest bg-transparent border-none px-0",
                              statusInfo.color,
                            )}
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <CalendarDays className="h-3 w-3" /> Thời gian
                              nghỉ
                            </span>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              <span>
                                {format(new Date(req.startDate), "dd/MM")}
                              </span>
                              <ArrowRight className="h-3 w-3 opacity-30" />
                              <span>
                                {format(new Date(req.endDate), "dd/MM")}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Clock className="h-3 w-3" /> Tổng thời gian
                            </span>
                            <span className="text-[11px] font-black text-orange-600 dark:text-orange-400">
                              {req.days} ngày
                            </span>
                          </div>
                        </div>

                        {req.reason && (
                          <div className="relative p-4 bg-orange-50/30 dark:bg-orange-950/10 rounded-2xl border border-orange-100/50 dark:border-orange-900/20">
                            <FileText className="absolute right-3 top-3 h-4 w-4 text-orange-200 dark:text-orange-900/40" />
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                              {req.reason}
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <History className="h-12 w-12 opacity-20 mb-4" />
                      <p className="text-sm font-bold">Không có đơn nào</p>
                    </div>
                  )}
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
