import { useMemo, memo } from "react";
import { Sun, SunMoon, Cloud, Sunset, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GreetingSectionProps {
  displayName?: string;
  userEmail?: string;
  hour?: number;
}

export const GreetingSection = memo(function GreetingSection({
  displayName,
  userEmail,
  hour = new Date().getHours(),
}: GreetingSectionProps) {
  const greetingData = useMemo(() => {
    // Start of memo logic
    const currentHour = hour;

    if (currentHour >= 5 && currentHour < 11) {
      return {
        greeting: "Chào buổi sáng",
        icon: <Sun className="h-6 w-6" />,
        color: "orange",
        bgClass: "from-orange-500/10 to-orange-500/5",
        borderClass: "border-orange-500/30",
        iconBgClass: "bg-orange-500/20",
        iconColorClass: "text-orange-500",
        labelColorClass: "text-orange-700",
      };
    } else if (currentHour >= 11 && currentHour < 13) {
      return {
        greeting: "Chào buổi trưa",
        icon: <SunMoon className="h-6 w-6" />,
        color: "amber",
        bgClass: "from-amber-500/10 to-amber-500/5",
        borderClass: "border-amber-500/30",
        iconBgClass: "bg-amber-500/20",
        iconColorClass: "text-amber-500",
        labelColorClass: "text-amber-700",
      };
    } else if (currentHour >= 13 && currentHour < 18) {
      return {
        greeting: "Chào buổi chiều",
        icon: <Cloud className="h-6 w-6" />,
        color: "deepOrange",
        bgClass: "from-orange-600/10 to-orange-600/5",
        borderClass: "border-orange-600/30",
        iconBgClass: "bg-orange-600/20",
        iconColorClass: "text-orange-600",
        labelColorClass: "text-orange-800",
      };
    } else if (currentHour >= 18 && currentHour < 21) {
      return {
        greeting: "Chào buổi tối",
        icon: <Sunset className="h-6 w-6" />,
        color: "indigo",
        bgClass: "from-indigo-500/10 to-indigo-500/5",
        borderClass: "border-indigo-500/30",
        iconBgClass: "bg-indigo-500/20",
        iconColorClass: "text-indigo-500",
        labelColorClass: "text-indigo-700",
      };
    } else {
      return {
        greeting: "Chào buổi đêm",
        icon: <Moon className="h-6 w-6" />,
        color: "deepPurple",
        bgClass: "from-purple-500/10 to-purple-500/5",
        borderClass: "border-purple-500/30",
        iconBgClass: "bg-purple-500/20",
        iconColorClass: "text-purple-500",
        labelColorClass: "text-purple-700",
      };
    }
  }, [hour]);

  const display = useMemo(() => {
    let name = displayName || userEmail || "User";
    if (name.includes("@")) {
      name = name.split("@")[0];
      name = name
        .split(".")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return name;
  }, [displayName, userEmail]);

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border bg-gradient-to-br transition-all duration-300",
        greetingData.bgClass,
        greetingData.borderClass,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-full transition-colors",
            greetingData.iconBgClass,
            greetingData.iconColorClass,
          )}
        >
          {greetingData.icon}
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              greetingData.labelColorClass,
            )}
          >
            {greetingData.greeting}
          </span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {display}
          </h2>
        </div>
      </div>
    </div>
  );
});
