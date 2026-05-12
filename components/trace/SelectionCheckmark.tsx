import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function SelectionCheckmark({
  className,
  selected,
  size = 18
}: {
  className?: string;
  selected: boolean;
  size?: number;
}) {
  if (!selected) return null;

  return (
    <span
      className={cn("pointer-events-none absolute right-2 top-2 z-30 grid h-5 w-5 place-items-center animate-selection-pop", className)}
      aria-hidden="true"
    >
      <Check
        size={size}
        strokeWidth={6}
        className="absolute text-white [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.72))]"
      />
      <Check size={size} strokeWidth={2.7} className="absolute text-[#111111]" />
    </span>
  );
}
