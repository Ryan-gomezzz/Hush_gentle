"use client";

import * as React from "react";

import { cn } from "@/utils/cn";

export type TabItem = { key: string; label: string; content: React.ReactNode };

export function Tabs({
  items,
  defaultKey,
  className,
}: {
  items: TabItem[];
  defaultKey?: string;
  className?: string;
}) {
  const [active, setActive] = React.useState<string>(
    defaultKey ?? items[0]?.key ?? "",
  );

  const activeItem = items.find((i) => i.key === active) ?? items[0];

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap gap-2 border-b border-border">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActive(item.key)}
              className={cn(
                "rounded-t-xl px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
              aria-pressed={isActive}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="pt-4">{activeItem?.content}</div>
    </div>
  );
}


