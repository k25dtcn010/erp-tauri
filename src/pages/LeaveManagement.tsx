import { HelpCircle, Calendar, Plus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function LeaveManagement() {
  const navigate = useNavigate();

  const leaveTypes = [
    { label: "Annual", current: 12, total: 20, color: "bg-primary" },
    { label: "Sick", current: 5, total: 10, color: "bg-sky-400" },
    { label: "Casual", current: 1, total: 5, color: "bg-teal-400" },
  ];

  const requests = [
    {
      type: "Sick Leave",
      status: "Approved",
      startDate: "Oct 12",
      endDate: "Oct 14",
      duration: "3 days",
      dateDay: "12",
      dateMonth: "Oct",
      statusColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      type: "Annual Vacation",
      status: "Pending",
      startDate: "Nov 20",
      endDate: "Nov 25",
      duration: "5 days",
      dateDay: "20",
      dateMonth: "Nov",
      statusColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      type: "Personal",
      status: "Rejected",
      startDate: "Sep 01",
      endDate: "Sep 01",
      duration: "1 day",
      dateDay: "01",
      dateMonth: "Sep",
      statusColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      opacity: "opacity-80",
    },
    {
      type: "Casual",
      status: "Approved",
      startDate: "Aug 15",
      endDate: "Aug 16",
      duration: "2 days",
      dateDay: "15",
      dateMonth: "Aug",
      statusColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      opacity: "opacity-70",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Leave Management
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary"
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 pt-6 space-y-6">
        {/* Summary Card */}
        <Card className="relative overflow-hidden rounded-2xl p-6 shadow-sm border-border">
          {/* Background decorative element */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Balance
              </p>
              <h2 className="text-3xl font-extrabold text-foreground mt-1">
                18{" "}
                <span className="text-lg font-medium text-muted-foreground">
                  Days
                </span>
              </h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
            {leaveTypes.map((type, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-muted-foreground">
                    {type.label}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {type.current}/{type.total}
                  </span>
                </div>
                <Progress
                  value={(type.current / type.total) * 100}
                  className="h-1.5 bg-secondary"
                  indicatorClassName={type.color}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Filter Section */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Recent Requests</h3>
        </div>

        <div className="flex p-1 bg-secondary rounded-lg">
          <button className="flex-1 py-1.5 rounded-md bg-background text-foreground text-xs font-semibold shadow-sm transition-all">
            All
          </button>
          <button className="flex-1 py-1.5 rounded-md text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
            Pending
          </button>
          <button className="flex-1 py-1.5 rounded-md text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
            History
          </button>
        </div>

        {/* List Items */}
        <div className="space-y-3">
          {requests.map((req, index) => (
            <Card
              key={index}
              className={cn(
                "group relative flex gap-4 p-4 hover:border-primary/30 transition-all border-border",
                req.opacity,
              )}
            >
              {/* Date Box */}
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-secondary border border-border shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {req.dateMonth}
                </span>
                <span className="text-lg font-bold text-foreground leading-none">
                  {req.dateDay}
                </span>
              </div>
              {/* Content */}
              <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-foreground">
                    {req.type}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium border",
                      req.statusColor,
                    )}
                  >
                    {req.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {req.startDate} - {req.endDate}
                  </span>
                  <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-medium">
                    {req.duration}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-30">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform group"
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </div>
    </div>
  );
}
