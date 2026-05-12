import { ImagePlaceholder } from "@/components/trace/ImagePlaceholder";
import type { ImageVariant, TraceNode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SelectionPreview({
  label,
  node,
  variants
}: {
  label?: string;
  node: TraceNode;
  variants: ImageVariant[];
}) {
  const columns = node.outputCount === 4 ? 2 : node.outputCount === 1 ? 1 : 3;
  const cells = Array.from({ length: node.outputCount });
  const selected = cells.map((_, index) => variants.some((variant) => variant.id === node.variants[index]?.id));

  return (
    <aside className="relative w-[180px]">
      <div className="mb-3 text-sm font-medium text-[#2b2b2b]">{label ?? `${variants.length} selected`}</div>
      <div className={cn("grid gap-[4px]", columns === 3 && "grid-cols-3", columns === 2 && "grid-cols-2", columns === 1 && "grid-cols-1")}>
        {cells.map((_, index) => {
          const variant = node.variants[index];
          const isSelected = selected[index];

          return (
            <div
              key={variant?.id ?? `${node.id}-preview-${index}`}
              className={cn(
                "relative aspect-square overflow-hidden border border-[#d5d5d0] bg-[#eeeeec]",
                isSelected && "z-10 bg-[#e8e8e4] outline outline-2 outline-[#111111] outline-offset-0"
              )}
            >
              {isSelected ? (
                variant?.src ? (
                  <img src={variant.src} alt="" className="h-full w-full object-cover" draggable={false} />
                ) : (
                  <ImagePlaceholder />
                )
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
