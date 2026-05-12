"use client";

import { cn } from "@/lib/utils";

export function AiGuideLogo({
  className,
  shape = "circle",
  withStatus = false
}: {
  className: string;
  shape?: "circle" | "plain";
  withStatus?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden",
        shape === "circle" ? "rounded-full bg-white" : "bg-transparent",
        className
      )}
    >
      <img src="/ai-guide-logo.png" alt="" className="h-full w-full object-contain" draggable={false} />
      {withStatus ? (
        <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#151515] bg-[#66b37a]" />
      ) : null}
    </span>
  );
}
