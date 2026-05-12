"use client";

import { useEffect, useState } from "react";

import type { TraceNode } from "@/lib/types";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ImageBoard } from "@/components/trace/ImageBoard";
import { ImageCardDeck } from "@/components/trace/ImageCardDeck";
import type { AudienceSimulationResult } from "@/lib/ai/guide/audienceSimulation";
import { cn } from "@/lib/utils";

export type BoardViewMode = "grid" | "cards";

interface TraceNodeCardProps {
  node: TraceNode;
  audienceResult: AudienceSimulationResult | null;
  selectedVariantIds: string[];
  viewMode: BoardViewMode;
  fitToViewport?: boolean;
  onToggleReference: (variantId: string) => void;
  onRegenerateVariant: (variantId: string) => void;
}

export function TraceNodeCard({
  node,
  audienceResult,
  selectedVariantIds,
  viewMode,
  fitToViewport = false,
  onToggleReference,
  onRegenerateVariant
}: TraceNodeCardProps) {
  const [preview, setPreview] = useState<{ variantId: string } | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const previewVariant = preview ? node.variants.find((variant) => variant.id === preview.variantId) : null;
  const previewReaction = preview ? audienceResult?.rankings.find((reaction) => reaction.variantId === preview.variantId) : undefined;

  useEffect(() => setCardIndex(0), [node.id]);

  return (
    <article className={cn("group/node w-full", fitToViewport && "flex h-full min-h-0 flex-col")}>
      {viewMode === "grid" ? (
        <ImageBoard
          node={node}
          audienceResult={audienceResult}
          selectedVariantIds={selectedVariantIds}
          fitToViewport={fitToViewport}
          onToggleReference={onToggleReference}
          onOpenPreview={(variant) => setPreview({ variantId: variant.id })}
          onRegenerateVariant={onRegenerateVariant}
        />
      ) : (
        <ImageCardDeck
          node={node}
          audienceResult={audienceResult}
          index={cardIndex}
          onIndexChange={setCardIndex}
          selectedVariantIds={selectedVariantIds}
          fitToViewport={fitToViewport}
          onToggleReference={onToggleReference}
          onOpenPreview={(variant) => setPreview({ variantId: variant.id })}
          onRegenerateVariant={onRegenerateVariant}
        />
      )}

      {preview && previewVariant ? (
        <ImageLightbox
          variant={previewVariant}
          audienceReaction={previewReaction}
          onClose={() => setPreview(null)}
          onRegenerateVariant={onRegenerateVariant}
        />
      ) : null}
    </article>
  );
}
