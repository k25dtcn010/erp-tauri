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
      label: "Home",
    },
    {
      to: "/attendance",
      icon: Calendar,
      label: "Attendance",
    },
    {
      to: "/leaves",
      icon: FileText,
      label: "Leaves",
    },
    {
      to: "/overtime",
      icon: Clock,
      label: "Overtime",
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-[#1a1d23] border-t border-gray-200 dark:border-[#353A45] pb-safe z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300",
                isActive
                  ? "text-primary dark:text-primary"
                  : "text-gray-400 hover:text-primary/70",
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "bg-transparent",
                  )}
                >
                  <item.icon
                    className={cn("h-6 w-6", isActive && "fill-current/20")}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-all",
                    isActive ? "scale-110 font-bold" : "",
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <div className="relative -top-5 bg-white dark:bg-[#1a1d23] rounded-full z-10 p-1">
          <button
            onClick={() => setIsAppsOpen(true)}
            className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-[3px] border-white dark:border-[#1a1d23] hover:scale-105 active:scale-95 transition-transform group"
          >
            <Plus className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300",
                isActive
                  ? "text-primary dark:text-primary"
                  : "text-gray-400 hover:text-primary/70",
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "bg-transparent",
                  )}
                >
                  <item.icon
                    className={cn("h-6 w-6", isActive && "fill-current/20")}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-all",
                    isActive ? "scale-110 font-bold" : "",
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* Safe Area Spacer for iOS Home Indicator */}
      <div className="h-1 w-full bg-white dark:bg-[#1a1d23]" />

      {/* Apps Drawer */}
      <Drawer open={isAppsOpen} onOpenChange={setIsAppsOpen}>
        <DrawerContent className="bg-gray-50 dark:bg-[#1a1d23]">
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle>Apps</DrawerTitle>
              <DrawerDescription>
                Access your workplace modules
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 grid grid-cols-4 gap-4">
              {/* HRM Module */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#262A31] border border-gray-100 dark:border-[#353A45] shadow-sm hover:shadow-md transition-all active:scale-95">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-gray-300">
                  HRM
                </span>
              </button>

              {/* Discuss Module */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#262A31] border border-gray-100 dark:border-[#353A45] shadow-sm hover:shadow-md transition-all active:scale-95">
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-gray-300">
                  Discuss
                </span>
              </button>

              {/* Timekeeping (Active) */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#262A31] ring-2 ring-primary border-transparent shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-primary">Time</span>
              </button>

              {/* Settings */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#262A31] border border-gray-100 dark:border-[#353A45] shadow-sm hover:shadow-md transition-all active:scale-95">
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <Settings className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-gray-300">
                  Settings
                </span>
              </button>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
