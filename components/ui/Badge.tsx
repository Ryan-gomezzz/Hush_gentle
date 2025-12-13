import * as React from "react";

import { cn } from "@/utils/cn";

export type BadgeVariant = "default" | "soft" | "warn";

const variants: Record<BadgeVariant, string> = {
  default: "bg-muted text-foreground",
  soft: "bg-accent-soft text-foreground",
  warn: "bg-[hsl(var(--warn))] text-white",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}


