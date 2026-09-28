"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const TooltipContext = React.createContext<{ open: boolean } | null>(null);

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ open }}>
      <span
        className="relative inline-flex"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  if (asChild) {
    return <Slot>{children}</Slot>;
  }

  return <span>{children}</span>;
}

export function TooltipContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TooltipContext);

  if (!ctx?.open) {
    return null;
  }

  return (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute left-0 top-full z-50 mt-1 max-w-[400px] rounded-md border border-[--color-border] bg-[--color-surface] p-2 text-sm text-[--color-foreground] shadow-md whitespace-pre-wrap",
        className,
      )}
    >
      {children}
    </span>
  );
}
