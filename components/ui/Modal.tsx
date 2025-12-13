"use client";

import * as React from "react";

import { cn } from "@/utils/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)]",
          className,
        )}
      >
        {title ? <h2 className="text-base font-semibold">{title}</h2> : null}
        <div className={cn(title ? "mt-3" : "", "")}>{children}</div>
      </div>
    </div>
  );
}


