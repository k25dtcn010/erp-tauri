import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle,
  LogIn,
  Coffee,
  Utensils,
  Briefcase,
  LogOut,
  MapPin,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function AttendanceHistory() {
  const navigate = useNavigate();

  const days = [
    { day: "Mon", date: "12", status: "past" },
    { day: "Tue", date: "13", status: "past" },
    { day: "Wed", date: "14", status: "active" },
    { day: "Thu", date: "15", status: "future" },
    { day: "Fri", date: "16", status: "future" },
    { day: "Sat", date: "17", status: "future" },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight">
            Attendance History
          </h1>
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Calendar className="h-6 w-6" />
            </Button>
            <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background"></div>
          </div>
        </div>

        {/* Calendar Strip */}
        <div className="pb-4 px-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-semibold text-muted-foreground">
              October 2023
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x no-scrollbar">
            {days.map((item, index) => (
              <button
                key={index}
                className={cn(
                  "snap-start flex flex-col items-center min-w-[3.5rem] p-2 rounded-xl border transition-all",
                  item.status === "active"
                    ? "bg-primary text-primary-foreground border-primary shadow-md ring-1 ring-primary/50"
                    : "bg-card border-border text-muted-foreground hover:bg-secondary",
                )}
              >
                <span className="text-xs font-medium mb-1 opacity-80">
                  {item.day}
                </span>
                <span className="text-lg font-bold">{item.date}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Card className="p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="h-10 w-10 text-primary" />
            </div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
              Total Hours
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">8h</span>
              <span className="text-lg font-medium text-muted-foreground">
                30m
              </span>
            </div>
          </Card>
          <Card className="p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
              Status
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                Present
              </span>
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <div className="relative pl-2">
          {/* Continuous Vertical Line */}
          <div className="absolute left-[19px] top-6 bottom-12 w-[2px] bg-gradient-to-b from-primary/50 via-gray-300 to-gray-200/20"></div>
          <div className="space-y-6">
            {/* Event 1: Clock In */}
            <div className="relative flex gap-5 group">
              {/* Node */}
              <div className="z-10 mt-5 shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-[0_0_0_6px_var(--background)] group-hover:scale-110 transition-transform duration-300">
                <LogIn className="h-4 w-4" />
              </div>
              {/* Card */}
              <Card className="flex-1 p-4 hover:border-primary/30 transition-colors shadow-lg relative overflow-hidden border-border">
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl"></div>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">
                    09:00 AM
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                  >
                    On Time
                  </Badge>
                </div>
                <div className="pl-2 space-y-1">
                  <p className="text-foreground text-base font-semibold">
                    Clock In
                  </p>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm group/loc hover:text-primary transition-colors cursor-pointer">
                    <MapPin className="h-4 w-4" />
                    <span className="border-b border-transparent group-hover/loc:border-primary/50">
                      HQ Office, New York
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Event 2: Break Start */}
            <div className="relative flex gap-5 group">
              {/* Node */}
              <div className="z-10 mt-5 shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-secondary border-2 border-muted-foreground/30 text-muted-foreground shadow-[0_0_0_6px_var(--background)]">
                <Coffee className="h-4 w-4" />
              </div>
              {/* Card */}
              <Card className="flex-1 p-4 hover:border-muted-foreground/50 transition-colors shadow-sm border-border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-foreground">
                    01:00 PM
                  </h3>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground text-base font-semibold">
                    Break Start
                  </p>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Utensils className="h-4 w-4" />
                    <span>HQ Cafeteria</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Event 3: Break End */}
            <div className="relative flex gap-5 group">
              {/* Node */}
              <div className="z-10 mt-5 shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-secondary border-2 border-muted-foreground/30 text-muted-foreground shadow-[0_0_0_6px_var(--background)]">
                <Briefcase className="h-4 w-4" />
              </div>
              {/* Card */}
              <Card className="flex-1 p-4 hover:border-muted-foreground/50 transition-colors shadow-sm border-border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-foreground">
                    02:00 PM
                  </h3>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground text-base font-semibold">
                    Break End
                  </p>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>HQ Office, New York</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Event 4: Clock Out */}
            <div className="relative flex gap-5 group">
              {/* Node */}
              <div className="z-10 mt-5 shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-secondary border-2 border-amber-600 text-amber-600 shadow-[0_0_0_6px_var(--background)]">
                <LogOut className="h-4 w-4" />
              </div>
              {/* Card */}
              <Card className="flex-1 p-4 hover:border-amber-600/30 transition-colors shadow-lg relative overflow-hidden border-border">
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-600/50 rounded-l-xl"></div>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">
                    06:30 PM
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                  >
                    Overtime
                  </Badge>
                </div>
                <div className="pl-2 space-y-1">
                  <p className="text-foreground text-base font-semibold">
                    Clock Out
                  </p>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm group/loc hover:text-amber-600 transition-colors cursor-pointer">
                    <MapPin className="h-4 w-4" />
                    <span className="border-b border-transparent group-hover/loc:border-amber-500/50">
                      HQ Office, New York
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-10 mb-4 flex justify-center">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <Flag className="h-5 w-5" />
            Request Correction
          </Button>
        </div>
      </div>
    </div>
  );
}
