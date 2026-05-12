"use client";

import { ImageVariantCard } from "@/components/ImageVariantCard";
import { boardSlots } from "@/components/trace/boardSlots";
import { ImagePlaceholder } from "@/components/trace/ImagePlaceholder";
import type { AudienceSimulationResult } from "@/lib/ai/guide/audienceSimulation";
import type { ImageVariant, TraceNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ImageBoardProps {
  node: TraceNode;
  audienceResult: AudienceSimulationResult | null;
  selectedVariantIds: string[];
  fitToViewport?: boolean;
  onToggleReference: (variantId: string) => void;
  onOpenPreview: (variant: ImageVariant, slotLabel: string) => void;
  onRegenerateVariant: (variantId: string) => void;
}

export function ImageBoard({
  node,
  audienceResult,
  selectedVariantIds,
  fitToViewport = false,
  onToggleReference,
  onOpenPreview,
  onRegenerateVariant
}: ImageBoardProps) {
  const outputCount = node.outputCount;
  const columns = outputCount === 4 ? 2 : outputCount === 1 ? 1 : 3;
  const cells = Array.from({ length: outputCount });
  const isLoading = node.status === "queued" || node.status === "running";
  const completedCount = node.variants.filter((variant) => variant.status === "done" && variant.src).length;
  const pendingCount = Math.max(0, outputCount - completedCount);
  const selected = cells.map((_, index) => {
    const variant = node.variants[index];
    return variant ? selectedVariantIds.includes(variant.id) : false;
  });

  return (
    <div className={cn("relative", fitToViewport && "trace-board-frame grid h-full min-h-0 w-full place-items-center overflow-visible")}>
      <div
        className={cn(
          "grid gap-[6px] bg-white",
          fitToViewport && "trace-image-board-grid",
          columns === 3 && "grid-cols-3",
          columns === 2 && "grid-cols-2",
          columns === 1 && "grid-cols-1"
        )}
      >
        {cells.map((_, index) => {
          const variant = node.variants[index];
          const slotLabel = boardSlots[index] ?? `Image ${index + 1}`;

          return variant ? (
            <ImageVariantCard
              key={variant.id}
              variant={variant}
              audienceReaction={audienceResult?.rankings.find((reaction) => reaction.variantId === variant.id)}
              slotLabel={slotLabel}
              imageNumber={index + 1}
              selected={selected[index]}
              onToggleReference={onToggleReference}
              onOpenPreview={onOpenPreview}
              onRegenerateVariant={onRegenerateVariant}
            />
          ) : (
            <div key={`${node.id}-empty-${index}`} className="relative aspect-square bg-[#e9e9e7]">
              <ImagePlaceholder active={isLoading} />
            </div>
          );
        })}
      </div>
      {isLoading && outputCount === 9 ? (
        <BoardProgressDots completedCount={completedCount} pendingCount={pendingCount} />
      ) : null}
    </div>
  );
}

function BoardProgressDots({
  completedCount,
  pendingCount
}: {
  completedCount: number;
  pendingCount: number;
}) {
  return (
    <div className="pointer-events-none absolute bottom-2 right-2 z-30 flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            index < completedCount
              ? "bg-[#171717]"
              : index < completedCount + pendingCount
                ? "bg-[#171717]/25 animate-board-progress-dot"
                : "bg-[#171717]/10"
          )}
          style={{ animationDelay: `${index * 85}ms` }}
        />
      ))}
    </div>
  );
}
