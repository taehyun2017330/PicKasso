"use client";

import { useEffect } from "react";

import type { ToastMessage } from "@/lib/types";

interface ToastsProps {
  toasts: ToastMessage[];
  onRemove: (toastId: string) => void;
}

export function Toasts({ toasts, onRemove }: ToastsProps) {
  useEffect(() => {
    const timers = toasts.map((toast) => window.setTimeout(() => onRemove(toast.id), 2600));
    return () => timers.forEach(window.clearTimeout);
  }, [toasts, onRemove]);

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-md border border-[#d6d6d6] bg-[#ffffff] px-3 py-2 text-sm shadow-trace"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
