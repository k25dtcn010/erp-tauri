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
        "flex-1 flex flex-col min-h-screen bg-white dark:bg-[#141415] font-sans relative",
        containerClassName,
      )}
    >
      {/* Fixed Header refactor to match zmp-ui */}
      <header className="fixed top-0 left-0 right-0 z-[999] bg-white dark:bg-[#141415] transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#e9ebed] dark:after:bg-[#36383a]">
        <div className="min-h-[calc(var(--zaui-safe-area-inset-top,0px)+44px)] px-3 pt-[calc(var(--zaui-safe-area-inset-top,0px)+10px)] pb-[10px] pr-[103px] flex items-center gap-2">
          {header ? (
            header
          ) : (
            <>
              {leftAction && (
                <div className="flex-none h-6 flex items-center">
                  {leftAction}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {typeof title === "string" ? (
                  <div className="text-[18px] font-medium leading-[24px] truncate text-[#141415] dark:text-[#f4f5f6]">
                    {title}
                  </div>
                ) : (
                  title
                )}
              </div>
              {rightAction && (
                <div className="flex-none flex items-center">{rightAction}</div>
              )}
            </>
          )}
        </div>
        {headerExtra ? <div className="pb-3 px-3">{headerExtra}</div> : null}
      </header>

      {/* Main Content Area - Scrollable with zmp-ui styles */}
      <main
        className={cn(
          "flex-1 overflow-y-auto no-scrollbar",
          "pt-[calc(var(--zaui-safe-area-inset-top,0px)+81px)] pb-[calc(var(--zaui-safe-area-inset-bottom,0px)+81px)]",
          contentClassName,
        )}
      >
        <div className="max-w-2xl mx-auto w-full px-2 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
