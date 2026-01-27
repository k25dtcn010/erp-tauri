import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LayoutGrid,
  Briefcase,
  Plus,
  Calendar,
  FileText,
  Clock,
  Users,
  Sparkles,
} from "lucide-react";
import { Sheet, Button, Icon, useNavigate } from "zmp-ui";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const leftItems = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Trang chủ",
    },
    {
      to: "/tasks",
      icon: Briefcase,
      label: "Công việc",
    },
  ];

  const rightItems = [
    {
      label: "Tiện ích",
      icon: LayoutGrid,
      isSheet: true,
    },
    {
      to: "/settings",
      icon: Settings,
      label: "Cài đặt",
    },
  ];

  const getActiveConfig = (to: string) => {
    if (to === "/tasks") {
      return {
        text: "text-blue-500",
        bg: "bg-blue-500/10",
        indicator: "bg-blue-500",
        shadow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]",
      };
    }
    if (to === "/settings") {
      return {
        text: "text-slate-500",
        bg: "bg-slate-500/10",
        indicator: "bg-slate-500",
        shadow: "shadow-[0_0_15px_rgba(100,116,139,0.1)]",
      };
    }
    // Default (Trang chủ /)
    return {
      text: "text-emerald-500",
      bg: "bg-emerald-500/10",
      indicator: "bg-emerald-500",
      shadow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    };
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1a1d23]/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 pb-safe">
        <div className="max-w-md mx-auto h-20 flex items-center justify-around px-2 relative">
          {leftItems.map((item) => {
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

          {/* Action Center - Thảo luận (Floating Button) */}
          <div className="relative -top-6 group">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all duration-500 scale-125" />
            <NavLink
              to="/discussions"
              className={({ isActive }) =>
                cn(
                  "relative flex items-center justify-center h-16 w-16 rounded-[2rem] bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_10px_25px_rgba(249,115,22,0.4)] border-4 border-white dark:border-[#1a1d23] hover:scale-105 active:scale-90 transition-all duration-300 z-10 overflow-hidden",
                  isActive && "ring-4 ring-orange-500/20",
                )
              }
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <MessageSquare className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
            </NavLink>
          </div>

          {rightItems.map((item) => {
            if ("isSheet" in item) {
              return (
                <button
                  key={item.label}
                  onClick={() => setIsSheetOpen(true)}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full gap-1 group transition-all duration-300",
                    isSheetOpen
                      ? "text-orange-500"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-2xl transition-all duration-500 relative overflow-hidden",
                      isSheetOpen
                        ? "bg-orange-500/10 scale-110 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                        : "group-hover:bg-gray-100 dark:group-hover:bg-gray-800",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-6 w-6 transition-transform duration-300",
                        isSheetOpen && "scale-110",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      isSheetOpen ? "opacity-100 translate-y-0" : "opacity-60",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            const config = getActiveConfig(item.to!);
            return (
              <NavLink
                key={item.to}
                to={item.to!}
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
      </nav>

      <Sheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        autoHeight
        mask
        handler
        swipeToClose
      >
        <div className="bg-white dark:bg-[#1a1d23] p-8 pb-12 space-y-10 rounded-t-[3rem]">
          <div className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-orange-500" />
                Tiện ích
              </h2>
              <p className="font-medium text-slate-500 text-sm">
                Khám phá các phân hệ quản trị
              </p>
            </div>
            <Button
              variant="tertiary"
              type="neutral"
              className="rounded-full h-10 w-10 p-0"
              onClick={() => setIsSheetOpen(false)}
            >
              <Icon icon="zi-close" />
            </Button>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-6 px-1">
              <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Quản trị HRM
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  icon: Calendar,
                  label: "Lịch sử",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  icon: FileText,
                  label: "Nghỉ phép",
                  color: "text-orange-500",
                  bg: "bg-orange-500/10",
                },
                {
                  icon: Clock,
                  label: "Tăng ca",
                  color: "text-purple-600",
                  bg: "bg-purple-600/10",
                },
              ].map((app, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-3 cursor-pointer"
                  onClick={() => {
                    if (app.label === "Lịch sử") {
                      navigate("/attendance-history");
                      setIsSheetOpen(false);
                    } else if (app.label === "Nghỉ phép") {
                      navigate("/leave");
                      setIsSheetOpen(false);
                    } else if (app.label === "Tăng ca") {
                      navigate("/overtime");
                      setIsSheetOpen(false);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 shadow-sm border border-gray-50 dark:border-gray-800",
                      app.bg,
                      app.color,
                    )}
                  >
                    <app.icon className="h-7 w-7" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600 dark:text-gray-400">
                    {app.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 px-1">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Khác
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  label: "Nhân sự",
                  color: "text-indigo-500",
                  bg: "bg-indigo-500/10",
                },
                {
                  icon: MessageSquare,
                  label: "Thảo luận",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
                {
                  icon: Settings,
                  label: "Cài đặt",
                  color: "text-slate-500",
                  bg: "bg-slate-500/10",
                },
              ].map((app, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-3 cursor-pointer"
                  onClick={() => {
                    if (app.label === "Cài đặt") {
                      navigate("/settings");
                      setIsSheetOpen(false);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 shadow-sm border border-gray-50 dark:border-gray-800",
                      app.bg,
                      app.color,
                    )}
                  >
                    <app.icon className="h-7 w-7" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600 dark:text-gray-400">
                    {app.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Sheet>
    </>
  );
};

export default BottomNav;
