"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function IconButton({
  children,
  className,
  title,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md border border-transparent text-[#333333] transition hover:border-[#dddddd] hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d9d9d9] px-3 text-sm font-medium transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "done"
      ? "border-[#c9decf] bg-[#f2f8f3] text-[#366444]"
      : status === "error"
        ? "border-[#edc8c2] bg-[#fff3f1] text-[#9a3d32]"
        : status === "cancelled"
          ? "border-[#d6d6d6] bg-[#eeeeee] text-[#737373]"
          : "border-[#d9d9d9] bg-[#fafafa] text-[#6b6b6b]";

  return (
    <span className={cn("inline-flex h-6 items-center rounded-md border px-2 text-[11px] font-medium", tone)}>
      {status}
    </span>
  );
}

export function TooltipLabel({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-50 whitespace-nowrap rounded bg-[#1f1f1f] px-2 py-1 text-[11px] font-medium leading-none text-white opacity-0 transition-opacity delay-0 duration-150",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Monogram({ value, active = false }: { value: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-md border text-[12px] font-semibold",
        active
          ? "border-[#d9d9d9] bg-[#e9e9e9] text-[#262626]"
          : "border-[#e5e5e5] bg-[#eeeeee] text-[#2d2d2d]"
      )}
    >
      {value}
    </span>
  );
}
