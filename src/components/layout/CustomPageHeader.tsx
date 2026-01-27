import React from "react";
import { ChevronLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type HeaderVariant = "orange" | "purple" | "blue" | "default";

interface CustomPageHeaderProps {
  title: string;
  subtitle: string;
  user?: {
    name?: string;
    avatar?: string;
  };
  onBack?: () => void;
  variant?: HeaderVariant;
  className?: string;
}

const variantStyles: Record<
  HeaderVariant,
  { avatarGradient: string; textGradient: string }
> = {
  default: {
    avatarGradient: "from-orange-400 to-pink-500",
    textGradient: "from-orange-500 to-orange-600",
  },
  orange: {
    avatarGradient: "from-orange-400 to-amber-500",
    textGradient: "from-orange-500 to-amber-600",
  },
  purple: {
    avatarGradient: "from-purple-400 to-indigo-500",
    textGradient: "from-purple-500 to-indigo-600",
  },
  blue: {
    avatarGradient: "from-blue-400 to-cyan-500",
    textGradient: "from-blue-500 to-cyan-600",
  },
};

export const CustomPageHeader: React.FC<CustomPageHeaderProps> = ({
  title,
  subtitle,
  user,
  onBack,
  variant = "default",
  className,
}) => {
  const styles = variantStyles[variant];
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full",
        className,
      )}
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95 shrink-0 shadow-sm border border-gray-100 dark:border-white/5"
            onClick={onBack}
          >
            <ChevronLeft className="h-6 w-6 text-slate-500 dark:text-slate-400" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 bg-white/80 dark:bg-white/5 backdrop-blur-md pl-1.5 pr-2 py-1.5 rounded-full border border-gray-200/50 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5 z-0">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm transition-transform hover:scale-105">
            <AvatarImage
              src={user?.avatar || "https://i.pravatar.cc/150?u=a"}
              alt={user?.name || "User"}
              className="object-cover"
            />
            <AvatarFallback
              className={cn(
                "bg-gradient-to-br text-white font-bold text-xs",
                styles.avatarGradient,
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-green-500 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 shadow-[0_0_0_1px_rgba(255,255,255,1)] dark:shadow-none" />
        </div>

        <div className="flex flex-col min-w-[100px] px-1 justify-center">
          <h1 className="text-sm font-black text-slate-800 dark:text-gray-100 leading-none uppercase tracking-tight truncate max-w-[140px]">
            {title}
          </h1>
          <span
            className={cn(
              "text-[10px] font-bold bg-clip-text text-transparent bg-gradient-to-r uppercase tracking-widest opacity-90 mt-0.5",
              styles.textGradient,
            )}
          >
            {subtitle}
          </span>
        </div>

        <div className="w-px h-8 bg-gray-100 dark:bg-white/10 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 relative shrink-0 transition-colors"
        >
          <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-[#1a1d23]" />
        </Button>
      </div>
    </div>
  );
};
