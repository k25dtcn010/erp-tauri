import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Plus,
  FileText,
  Clock,
  Users,
  MessageSquare,
  CalendarClock,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [isAppsOpen, setIsAppsOpen] = useState(false);

  const navItems = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Trang chủ",
    },
    {
      to: "/attendance",
      icon: Calendar,
      label: "Lịch sử",
    },
    {
      to: "/leaves",
      icon: FileText,
      label: "Nghỉ phép",
    },
    {
      to: "/overtime",
      icon: Clock,
      label: "Tăng ca",
    },
  ];

  const getActiveConfig = (to: string) => {
    if (to === "/attendance") {
      return {
        text: "text-blue-500",
        bg: "bg-blue-500/10",
        indicator: "bg-blue-500",
        shadow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]",
      };
    }
    if (to === "/leaves") {
      return {
        text: "text-orange-500",
        bg: "bg-orange-500/10",
        indicator: "bg-orange-500",
        shadow: "shadow-[0_0_15px_rgba(249,115,22,0.1)]",
      };
    }
    if (to === "/overtime") {
      return {
        text: "text-purple-600",
        bg: "bg-purple-600/10",
        indicator: "bg-purple-600",
        shadow: "shadow-[0_0_15px_rgba(147,51,234,0.1)]",
      };
    }
    // Default (Trang chủ) - Using Emerald green
    return {
      text: "text-emerald-500",
      bg: "bg-emerald-500/10",
      indicator: "bg-emerald-500",
      shadow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    };
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1a1d23]/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 pb-safe">
      <div className="max-w-md mx-auto h-20 flex items-center justify-around px-2 relative">
        {navItems.slice(0, 2).map((item) => {
          const config = getActiveConfig(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 group transition-all duration-300",
                  isActive
                    ? config.text
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "p-2 rounded-2xl transition-all duration-500 relative overflow-hidden",
                      isActive
                        ? cn(config.bg, "scale-110", config.shadow)
                        : "group-hover:bg-gray-100 dark:group-hover:bg-gray-800",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-6 w-6 transition-transform duration-300",
                        isActive && "scale-110",
                      )}
                    />
                    {isActive && (
                      <div
                        className={cn(
                          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                          config.indicator,
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      isActive ? "opacity-100 translate-y-0" : "opacity-60",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Action Center - Refined FAB, moved lower */}
        <div className="relative -top-6 group">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all duration-500 scale-125" />
          <button
            onClick={() => setIsAppsOpen(true)}
            className="relative flex items-center justify-center h-16 w-16 rounded-[2rem] bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_10px_25px_rgba(249,115,22,0.4)] border-4 border-white dark:border-[#1a1d23] hover:scale-105 active:scale-90 transition-all duration-300 z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="h-8 w-8 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        {navItems.slice(2).map((item) => {
          const config = getActiveConfig(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 group transition-all duration-300",
                  isActive
                    ? config.text
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "p-2 rounded-2xl transition-all duration-500 relative overflow-hidden",
                      isActive
                        ? cn(config.bg, "scale-110", config.shadow)
                        : "group-hover:bg-gray-100 dark:group-hover:bg-gray-800",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-6 w-6 transition-transform duration-300",
                        isActive && "scale-110",
                      )}
                    />
                    {isActive && (
                      <div
                        className={cn(
                          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                          config.indicator,
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      isActive ? "opacity-100 translate-y-0" : "opacity-60",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Apps Drawer - Redesigned for premium look */}
      <Drawer open={isAppsOpen} onOpenChange={setIsAppsOpen}>
        <DrawerContent className="bg-white/80 dark:bg-[#1a1d23]/80 backdrop-blur-2xl border-none rounded-t-[3rem] shadow-2xl">
          <div className="mx-auto w-full max-w-md pt-2">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
            <DrawerHeader className="px-8 flex flex-row items-center justify-between">
              <div>
                <DrawerTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-orange-500" />
                  Tiện ích
                </DrawerTitle>
                <DrawerDescription className="font-medium text-slate-500">
                  Khám phá các phân hệ quản trị
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  className="rounded-full h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <div className="p-8 grid grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  label: "Nhân sự",
                  color: "bg-blue-500",
                  text: "text-blue-500",
                },
                {
                  icon: MessageSquare,
                  label: "Thảo luận",
                  color: "bg-purple-500",
                  text: "text-purple-500",
                },
                {
                  icon: CalendarClock,
                  label: "Công",
                  color: "bg-orange-500",
                  text: "text-orange-500",
                  active: true,
                },
                {
                  icon: Settings,
                  label: "Cài đặt",
                  color: "bg-slate-500",
                  text: "text-slate-500",
                },
              ].map((app, idx) => (
                <button
                  key={idx}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-[2rem] bg-white dark:bg-[#262A31] border transition-all duration-300 group active:scale-90 shadow-sm",
                    app.active
                      ? "border-orange-500/50 ring-4 ring-orange-500/5 shadow-orange-500/10"
                      : "border-gray-50 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg",
                  )}
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      app.active
                        ? "bg-orange-500 text-white"
                        : cn(app.color, "bg-opacity-10", app.text),
                    )}
                  >
                    <app.icon className="h-7 w-7" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-black uppercase tracking-tighter",
                      app.active
                        ? "text-orange-500"
                        : "text-slate-600 dark:text-gray-400",
                    )}
                  >
                    {app.label}
                  </span>
                </button>
              ))}
            </div>

            <DrawerFooter className="p-8 pt-0">
              <p className="text-center text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-4">
                AntiGravity OS • Version 2.0
              </p>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
