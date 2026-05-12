"use client";

import { ImagePlaceholder } from "@/components/trace/ImagePlaceholder";
import { ImageHoverActions } from "@/components/trace/ImageHoverActions";
import { SelectionCheckmark } from "@/components/trace/SelectionCheckmark";
import type { AudienceReaction } from "@/lib/ai/guide/audienceSimulation";
import type { ImageVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ImageVariantCardProps {
  variant: ImageVariant;
  audienceReaction?: AudienceReaction;
  slotLabel: string;
  imageNumber: number;
  selected: boolean;
  onToggleReference: (variantId: string) => void;
  onOpenPreview: (variant: ImageVariant, slotLabel: string) => void;
  onRegenerateVariant: (variantId: string) => void;
}

export function ImageVariantCard({
  variant,
  audienceReaction,
  slotLabel,
  imageNumber,
  selected,
  onToggleReference,
  onOpenPreview,
  onRegenerateVariant
}: ImageVariantCardProps) {
  const isLoading = variant.status === "queued" || variant.status === "running";
  const canInteract = Boolean(variant.src) && !isLoading && variant.status !== "cancelled";

  return (
    <div
      className={cn(
        "group/variant relative aspect-square bg-[#e9e9e7]",
        selected && "z-10"
      )}
    >
      {canInteract ? (
        <button
          type="button"
          onClick={() => onToggleReference(variant.id)}
          className="block h-full w-full cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#111111]"
          aria-label={selected ? `Remove image ${imageNumber} from direction` : `Select image ${imageNumber}`}
        >
          {variant.src ? (
            <img src={variant.src} alt={variant.styleLabel} className="h-full w-full object-cover animate-image-reveal" draggable={false} />
          ) : (
            <ImagePlaceholder active={isLoading} />
          )}
        </button>
      ) : (
        <div className="grid h-full place-items-center overflow-hidden">
          {variant.src ? (
            <img src={variant.src} alt={variant.styleLabel} className="h-full w-full object-cover" draggable={false} />
          ) : (
            <ImagePlaceholder active={isLoading} className="bg-[#f5f5f5]" />
          )}
        </div>
      )}

      {canInteract ? (
        <>
          <HoverGhost />
          <span className="pointer-events-none absolute left-2 top-2 z-20 text-[11px] font-semibold leading-none text-white opacity-0 transition duration-150 group-hover/variant:opacity-100">
            {selected ? "Remove image" : "Select image"}
          </span>
          {audienceReaction ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onOpenPreview(variant, slotLabel)}
              className={cn(
                "absolute top-2 z-20 inline-flex h-7 min-w-7 items-start justify-end px-0.5 text-[12px] font-semibold leading-none text-white opacity-0 transition group-hover/variant:opacity-100 hover:opacity-100 focus:outline-none focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-white",
                selected ? "right-8" : "right-2"
              )}
              aria-label={`View audience analysis for image ${imageNumber}, score ${audienceReaction.score}`}
            >
              {audienceReaction.score}
            </button>
          ) : null}
          <ImageHoverActions
            variant={variant}
            slotLabel={slotLabel}
            onOpenPreview={onOpenPreview}
            onRegenerateVariant={onRegenerateVariant}
          />
          <SelectionCheckmark selected={selected} />
        </>
      ) : null}

      {variant.feedback ? (
        <div
          className={cn(
            "absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-white",
            variant.feedback.rating === "like"
              ? "bg-[#69b86d]"
              : variant.feedback.rating === "dislike"
                ? "bg-[#d76553]"
                : "bg-[#999999]"
          )}
        />
      ) : null}
    </div>
  );
}

function HoverGhost() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-150 group-hover/variant:opacity-100">
      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(to_top,rgba(0,0,0,0.44)_0%,rgba(0,0,0,0.20)_52%,transparent_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[16%] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0.16)_52%,transparent_100%)]" />
      <div className="absolute inset-0 ring-1 ring-inset ring-black/28" />
    </div>
  );
}
