import React, { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SafeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const SafeArea: FC<SafeAreaProps> = ({
  children,
  top = true,
  bottom = true,
  left = true,
  right = true,
  className,
  as: Component = "div",
  ...props
}) => {
  return (
    <Component
      className={cn(
        top && "pt-safe",
        bottom && "pb-safe",
        left && "pl-safe",
        right && "pr-safe",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
