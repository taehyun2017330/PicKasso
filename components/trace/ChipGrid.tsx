import type { FeedbackOption } from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

export function ChipGrid({
  options,
  selectedIds,
  onToggle
}: {
  options: FeedbackOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            className={cn(
              "min-h-9 rounded-full border px-4 text-sm transition",
              selected
                ? "border-[#202020] bg-[#202020] text-white"
                : "border-[#d8d8d8] bg-white text-[#4c4c4c] hover:border-[#bfbfbf] hover:bg-[#f7f7f7]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
