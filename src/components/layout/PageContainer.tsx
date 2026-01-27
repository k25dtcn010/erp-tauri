import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  /** Page content */
  children: ReactNode;
  /** Custom header content. If provided, title/leftAction/rightAction are ignored */
  header?: ReactNode;
  /** Title text or element */
  title?: ReactNode;
  /** Action on the left (usually a back button) */
  leftAction?: ReactNode;
  /** Action on the right (usually a notification or add button) */
  rightAction?: ReactNode;
  /** Extra content below the main header line (e.g., Tabs) */
  headerExtra?: ReactNode;
  /** Additional classes for the scrollable container */
  containerClassName?: string;
  /** Additional classes for the main content area */
  contentClassName?: string;
}

/**
 * A unified page layout component for mobile-first experience.
 * Handles sticky header, layout alignment, and safe area insets.
 */
export function PageContainer({
  children,
  header,
  title,
  leftAction,
  rightAction,
  headerExtra,
  containerClassName,
  contentClassName,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col h-full overflow-y-auto no-scrollbar bg-white dark:bg-[#1a1d23] font-sans pb-24",
        containerClassName,
      )}
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1a1d23]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 pt-safe transition-all duration-300">
        <div className="max-w-2xl mx-auto w-full">
          {header ? (
            <div className="px-6 py-4">{header}</div>
          ) : (
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                {leftAction ? leftAction : <div className="w-11" />}
                {typeof title === "string" ? (
                  <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                    {title}
                  </h1>
                ) : (
                  title
                )}
              </div>
              <div className="flex items-center gap-2">
                {rightAction ? rightAction : <div className="w-11" />}
              </div>
            </div>
          )}
          {headerExtra ? <div className=" pb-3">{headerExtra}</div> : null}
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 max-w-2xl mx-auto w-full px-2 py-6 space-y-8",
          contentClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
