"use client";

import { Download, Maximize2, RefreshCw } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";

import { TooltipLabel } from "@/components/ui";
import type { ImageVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ImageHoverActionsProps {
  variant: ImageVariant;
  slotLabel: string;
  onOpenPreview: (variant: ImageVariant, slotLabel: string) => void;
  onRegenerateVariant: (variantId: string) => void;
}

export function ImageHoverActions({
  variant,
  slotLabel,
  onOpenPreview,
  onRegenerateVariant
}: ImageHoverActionsProps) {
  const busy = variant.status === "queued" || variant.status === "running";
  const canDownload = Boolean(variant.src);

  if (busy || !variant.src) return null;

  return (
    <>
      <ActionWell className="left-2">
        <HoverAction
          label="Expand image"
          onClick={() => onOpenPreview(variant, slotLabel)}
        >
          <Maximize2 size={14} />
        </HoverAction>
      </ActionWell>
      <ActionWell className="right-2">
        <HoverAction
          label="Regenerate image"
          disabled={busy}
          onClick={() => onRegenerateVariant(variant.id)}
        >
          <RefreshCw size={14} />
        </HoverAction>
        <HoverAction
          label="Download image"
          disabled={!canDownload}
          onClick={() => downloadImage(variant, slotLabel)}
        >
          <Download size={14} />
        </HoverAction>
      </ActionWell>
    </>
  );
}

function ActionWell({
  children,
  className
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-2 z-30 flex translate-y-1 items-center gap-2 opacity-0 transition duration-150",
        "group-hover/variant:pointer-events-auto group-hover/variant:translate-y-0 group-hover/variant:opacity-100 group-focus-within/variant:pointer-events-auto group-focus-within/variant:translate-y-0 group-focus-within/variant:opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
}

function HoverAction({
  children,
  disabled = false,
  label,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onClick();
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={handleClick}
      className={cn(
        "group/action relative grid h-7 w-7 place-items-center rounded-md bg-transparent text-white transition",
        "hover:bg-[#d9d9d9]/38 hover:text-white focus-visible:bg-[#d9d9d9]/38 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/85",
        disabled && "cursor-not-allowed opacity-35"
      )}
      aria-label={label}
    >
      {children}
      <TooltipLabel className="bottom-full left-1/2 mb-1.5 -translate-x-1/2 group-hover/action:opacity-100 group-hover/action:delay-500 group-focus-visible/action:opacity-100">
        {label}
      </TooltipLabel>
    </button>
  );
}

function downloadImage(variant: ImageVariant, slotLabel: string) {
  if (!variant.src) return;

  const link = document.createElement("a");
  link.href = variant.src;
  link.download = `image-${slotLabel.toLowerCase()}.png`;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
