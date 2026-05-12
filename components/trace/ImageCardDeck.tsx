"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { boardSlots } from "@/components/trace/boardSlots";
import { ImageHoverActions } from "@/components/trace/ImageHoverActions";
import { ImagePlaceholder } from "@/components/trace/ImagePlaceholder";
import { SelectionCheckmark } from "@/components/trace/SelectionCheckmark";
import type { AudienceSimulationResult } from "@/lib/ai/guide/audienceSimulation";
import type { ImageVariant, TraceNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ImageCardDeckProps {
  node: TraceNode;
  audienceResult: AudienceSimulationResult | null;
  index: number;
  onIndexChange: (index: number) => void;
  selectedVariantIds: string[];
  fitToViewport?: boolean;
  onToggleReference: (variantId: string) => void;
  onOpenPreview: (variant: ImageVariant, slotLabel: string) => void;
  onRegenerateVariant: (variantId: string) => void;
}

export function ImageCardDeck({
  node,
  audienceResult,
  index,
  onIndexChange,
  selectedVariantIds,
  fitToViewport = false,
  onToggleReference,
  onOpenPreview,
  onRegenerateVariant
}: ImageCardDeckProps) {
  const variants = node.variants.slice(0, node.outputCount);
  const readyVariants = variants.filter((item) => item.status === "done" && item.src);
  const deckVariants = readyVariants.length ? readyVariants : variants.slice(0, 1);
  const variant = deckVariants[index];
  const readyCount = readyVariants.length;
  const pendingFirstImage = !readyCount;
  const slotIndex = variant ? node.variants.findIndex((item) => item.id === variant.id) : index;
  const slotLabel = boardSlots[slotIndex >= 0 ? slotIndex : index] ?? `Image ${index + 1}`;
  const selected = variant ? selectedVariantIds.includes(variant.id) : false;
  const isLoading = variant?.status === "queued" || variant?.status === "running";
  const canInteract = Boolean(variant?.src) && !isLoading && variant?.status !== "cancelled";
  const audienceReaction = variant ? audienceResult?.rankings.find((reaction) => reaction.variantId === variant.id) : undefined;
  const stackCards = [
    { renderKey: "past-far", variant: readyVariants[index - 2], x: -26, y: 26, rotate: -2.6, opacity: 0.2 },
    { renderKey: "past-near", variant: readyVariants[index - 1], x: -14, y: 14, rotate: -1.4, opacity: 0.34 },
    { renderKey: "next-near", variant: readyVariants[index + 1], x: 14, y: 14, rotate: 1.4, opacity: 0.34 },
    { renderKey: "next-far", variant: readyVariants[index + 2], x: 26, y: 26, rotate: 2.6, opacity: 0.2 }
  ].filter((card): card is StackCardInput => Boolean(card.variant));

  useEffect(() => {
    if (index > deckVariants.length - 1) onIndexChange(Math.max(deckVariants.length - 1, 0));
  }, [deckVariants.length, index, onIndexChange]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      if (!variant) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (pendingFirstImage) return;
        onIndexChange(Math.min(index + 1, deckVariants.length - 1));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (pendingFirstImage) return;
        onIndexChange(Math.max(index - 1, 0));
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (!canInteract) return;
        onToggleReference(variant.id);
      }
      if (event.key.toLowerCase() === "x") {
        event.preventDefault();
        if (isLoading) return;
        onRegenerateVariant(variant.id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canInteract, deckVariants.length, index, isLoading, onIndexChange, onRegenerateVariant, onToggleReference, pendingFirstImage, variant]);

  if (!variant) return <LoadingCardDeck fitToViewport={fitToViewport} />;

  return (
    <div
      className={cn(
        "bg-white",
        fitToViewport
          ? "flex h-full min-h-0 flex-col items-center justify-start px-[clamp(0.75rem,2vw,2rem)] py-[clamp(0.75rem,2dvh,1.75rem)]"
          : "grid min-h-[650px] place-items-center px-8 py-7"
      )}
    >
      <div className={cn("w-full max-w-[620px]", fitToViewport && "flex h-full min-h-0 flex-col")}>
        <div className={cn("trace-card-title mb-4 flex items-center justify-between", fitToViewport && "shrink-0")}>
          <span className="text-sm font-medium text-[#555550]">
            {pendingFirstImage ? "Generating first image" : `Image ${index + 1} of ${readyCount} ready`}
          </span>
        </div>

        <div
          className={cn(
            fitToViewport
              ? "trace-card-stage flex min-h-0 w-full flex-1 flex-col items-center overflow-visible"
              : "flex w-full flex-col items-center overflow-visible"
          )}
        >
          <div className={cn(fitToViewport ? "trace-card-square relative shrink-0 overflow-visible" : "relative aspect-square w-full overflow-visible")}>
            {stackCards.map((card) => (
              <StackCard key={card.renderKey} {...card} />
            ))}

            <div
              className={cn(
                "group/variant relative z-20 h-full w-full overflow-hidden bg-[#e9e9e7] transition duration-200",
                selected && "translate-y-[-2px]"
              )}
            >
              {canInteract ? (
                <button
                  type="button"
                  onClick={() => onToggleReference(variant.id)}
                  className="block h-full w-full cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#111111]"
                  aria-label={selected ? `Remove image ${index + 1} from direction` : `Select image ${index + 1}`}
                >
                  <img src={variant.src} alt={variant.styleLabel} className="h-full w-full object-cover animate-image-reveal" draggable={false} />
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition duration-150 group-hover/variant:opacity-100">
                    <span className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(to_top,rgba(0,0,0,0.44)_0%,rgba(0,0,0,0.20)_52%,transparent_100%)]" />
                    <span className="absolute inset-x-0 top-0 h-[16%] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0.16)_52%,transparent_100%)]" />
                    <span className="absolute inset-0 ring-1 ring-inset ring-black/28" />
                  </span>
                </button>
              ) : variant.src ? (
                <img src={variant.src} alt={variant.styleLabel} className="h-full w-full object-cover" draggable={false} />
              ) : (
                <ImagePlaceholder active={isLoading} />
              )}
              {canInteract ? (
                <span className="pointer-events-none absolute left-3 top-3 z-30 text-[12px] font-semibold leading-none text-white opacity-0 transition duration-150 group-hover/variant:opacity-100">
                  {selected ? "Remove image" : "Select image"}
                </span>
              ) : null}
              <SelectionCheckmark selected={selected} className="right-3 top-3" size={20} />
              {variant && audienceReaction && canInteract ? (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onOpenPreview(variant, slotLabel)}
                  className={cn(
                    "absolute top-3 z-30 inline-flex h-8 min-w-8 items-start justify-end px-0.5 text-[13px] font-semibold leading-none text-white opacity-0 transition group-hover/variant:opacity-100 hover:opacity-100 focus:outline-none focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-white",
                    selected ? "right-10" : "right-3"
                  )}
                  aria-label={`View audience analysis for image ${index + 1}, score ${audienceReaction.score}`}
                >
                  {audienceReaction.score}
                </button>
              ) : null}
              {canInteract ? (
                <ImageHoverActions
                  variant={variant}
                  slotLabel={slotLabel}
                  onOpenPreview={onOpenPreview}
                  onRegenerateVariant={onRegenerateVariant}
                />
              ) : null}
            </div>
          </div>

          {!pendingFirstImage ? (
            <div className={cn("trace-card-controls flex justify-center", fitToViewport ? "mt-[52px] shrink-0" : "mt-14")}>
            <div className="inline-flex min-h-11 flex-wrap items-center justify-center gap-1 rounded-lg border border-[#e2e2de] bg-[#fbfbfa] p-1 text-[12px] font-semibold uppercase text-[#55554f] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <DeckControl
                disabled={index === 0}
                onClick={() => onIndexChange(Math.max(index - 1, 0))}
                label="Prev"
                keyHint={<ArrowLeft size={14} />}
              />
              <Divider />
              <DeckControl
                disabled={index === deckVariants.length - 1}
                onClick={() => onIndexChange(Math.min(index + 1, deckVariants.length - 1))}
                label="Next"
                keyHint={<ArrowRight size={14} />}
                keyAfter
              />
              <Divider />
              <DeckControl
                disabled={!canInteract}
                onClick={() => onToggleReference(variant.id)}
                label={selected ? "Selected" : "Select"}
                keyHint="Space"
                active={selected}
              />
              <Divider />
              <DeckControl
                disabled={variant.status === "queued" || variant.status === "running"}
                onClick={() => onRegenerateVariant(variant.id)}
                label="Regenerate"
                keyHint="X"
              />
            </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LoadingCardDeck({
  fitToViewport
}: {
  fitToViewport: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white",
        fitToViewport
          ? "flex h-full min-h-0 flex-col items-center justify-start px-[clamp(0.75rem,2vw,2rem)] py-[clamp(0.75rem,2dvh,1.75rem)]"
          : "grid min-h-[650px] place-items-center px-8 py-7"
      )}
    >
      <div className={cn("w-full max-w-[620px]", fitToViewport && "flex h-full min-h-0 flex-col")}>
        <div className={cn("trace-card-title mb-4 flex items-center justify-between", fitToViewport && "shrink-0")}>
          <span className="text-sm font-medium text-[#555550]">Generating first image</span>
        </div>

        <div
          className={cn(
            fitToViewport
              ? "trace-card-stage flex min-h-0 w-full flex-1 flex-col items-center overflow-visible"
              : "relative aspect-square w-full overflow-visible"
          )}
        >
          <div className={cn(fitToViewport ? "trace-card-square relative overflow-hidden" : "relative aspect-square w-full overflow-hidden")}>
            <ImagePlaceholder active />
          </div>
        </div>
      </div>
    </div>
  );
}

type StackCardInput = {
  renderKey: string;
  variant: ImageVariant;
  x: number;
  y: number;
  rotate: number;
  opacity: number;
};

function StackCard({
  variant,
  x,
  y,
  rotate,
  opacity
}: StackCardInput) {
  const isLoading = variant.status === "queued" || variant.status === "running";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#e6e6e3] ring-1 ring-black/10"
      style={{
        opacity,
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`
      }}
      aria-hidden="true"
    >
      {variant.src ? (
        <img src={variant.src} alt="" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <ImagePlaceholder active={isLoading} />
      )}
    </div>
  );
}

function DeckControl({
  active = false,
  disabled = false,
  keyAfter = false,
  keyHint,
  label,
  onClick
}: {
  active?: boolean;
  disabled?: boolean;
  keyAfter?: boolean;
  keyHint: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md px-2.5 transition",
        active ? "bg-[#f0f0ed] text-[#161614]" : "hover:bg-[#f0f0ed] hover:text-[#1f1f1c]",
        disabled && "cursor-not-allowed opacity-35 hover:bg-transparent"
      )}
    >
      {!keyAfter ? <Keycap>{keyHint}</Keycap> : null}
      <span>{label}</span>
      {keyAfter ? <Keycap>{keyHint}</Keycap> : null}
    </button>
  );
}

function Keycap({
  children
}: {
  children: ReactNode;
}) {
  return (
    <span className="inline-grid h-6 min-w-6 place-items-center rounded-md border border-[#d9d9d4] bg-white px-1.5 text-[11px] leading-none text-[#656560]">
      {children}
    </span>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-[#deded9]" aria-hidden="true" />;
}
