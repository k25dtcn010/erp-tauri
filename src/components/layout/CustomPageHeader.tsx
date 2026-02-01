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

  return (
    <div className={cn("flex items-center w-full relative h-12", className)}>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 -ml-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/10 dark:text-slate-400 transition-all"
            onClick={onBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        ) : null}
      </div>

      <div className="w-full flex flex-col items-center justify-center z-10 px-10">
        <h1 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight leading-normal text-center truncate w-full py-0.5">
          {title}
        </h1>
        <span
          className={cn(
            "text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r uppercase tracking-widest mt-0.5 text-center truncate w-full py-0.5",
            styles.textGradient,
          )}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
};
