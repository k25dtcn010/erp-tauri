import { Plus, Clock, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function OvertimeManagement() {
  const chartData = [
    { day: "M", hours: 2 },
    { day: "T", hours: 3.75 },
    { day: "W", hours: 4.5 },
    { day: "T", hours: 1.5 },
    { day: "F", hours: 3 },
    { day: "S", hours: 0.5 },
    { day: "S", hours: 0 },
  ];

  const chartConfig = {
    hours: {
      label: "Hours",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const recentEntries = [
    {
      dateMonth: "Oct",
      dateDay: "24",
      title: "Q4 Finance Report",
      time: "18:00 - 20:30",
      hours: "+2.5h",
      status: "Pending",
      statusColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      dateMonth: "Oct",
      dateDay: "22",
      title: "System Maintenance",
      time: "17:30 - 21:30",
      hours: "+4.0h",
      status: "Approved",
      statusColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      dateMonth: "Oct",
      dateDay: "20",
      title: "Client Meeting Prep",
      time: "18:00 - 19:30",
      hours: "+1.5h",
      status: "Approved",
      statusColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      dateMonth: "Oct",
      dateDay: "15",
      title: "Early Arrival",
      time: "07:30 - 08:30",
      hours: "+1.0h",
      status: "Rejected",
      statusColor: "bg-red-500/10 text-red-600 border-red-500/20",
      decoration: "line-through decoration-red-500/50",
      opacity: "opacity-75",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Overtime
        </h1>
        <Button
          size="icon"
          className="rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 pt-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 rounded-xl shadow-sm border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Hours
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">12.5</span>
              <span className="text-sm font-medium text-emerald-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> 12%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">This Month</p>
          </Card>
          <Card className="p-4 rounded-xl shadow-sm border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Est. Payout
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">$450</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending Approval
            </p>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="p-5 shadow-sm border-border">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Activity Trend
              </h2>
              <p className="text-sm text-muted-foreground">Weekly breakdown</p>
            </div>
            <Badge
              variant="secondary"
              className="font-medium text-muted-foreground"
            >
              Oct 2023
            </Badge>
          </div>

          <div className="h-40 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={8} />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        {/* Entries Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between sticky top-[68px] z-40 bg-background py-2">
            <h3 className="text-lg font-bold text-foreground">
              Recent Entries
            </h3>
            {/* Filter Chips */}
            <div className="flex bg-secondary p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-semibold rounded-md bg-background shadow-sm text-foreground">
                All
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors">
                Pending
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors">
                Approved
              </button>
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-3">
            {recentEntries.map((entry, index) => (
              <Card
                key={index}
                className={cn(
                  "p-4 flex items-center justify-between group active:scale-[0.99] transition-transform border-border",
                  entry.opacity,
                )}
              >
                <div className="flex gap-4 items-center">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-secondary border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {entry.dateMonth}
                    </span>
                    <span className="text-lg font-bold text-foreground leading-none">
                      {entry.dateDay}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-semibold text-foreground",
                        entry.decoration,
                      )}
                    >
                      {entry.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3.5 w-3.5" />
                      {entry.time}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={cn(
                      "text-base font-bold text-foreground font-mono",
                      entry.status === "Rejected"
                        ? "text-muted-foreground"
                        : "",
                    )}
                  >
                    {entry.hours}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium border",
                      entry.statusColor,
                    )}
                  >
                    {entry.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
