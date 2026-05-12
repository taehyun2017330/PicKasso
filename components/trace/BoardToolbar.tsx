import { Compass, Grid3X3, Pencil, RectangleHorizontal, Rotate3D } from "lucide-react";
import type { ReactNode } from "react";

import type { BoardViewMode } from "@/components/TraceNodeCard";
import { cn } from "@/lib/utils";

interface BoardToolbarProps {
  selectedCount: number;
  canEdit: boolean;
  canRegenerate: boolean;
  viewMode: BoardViewMode;
  onViewModeChange: (mode: BoardViewMode) => void;
  onExplore: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
}

export function BoardToolbar({
  selectedCount,
  canEdit,
  canRegenerate,
  viewMode,
  onViewModeChange,
  onExplore,
  onEdit,
  onRegenerate
}: BoardToolbarProps) {
  const hasSelection = selectedCount > 0;
  const selectionText = hasSelection ? `${selectedCount} selected` : "Select images";

  return (
    <div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-grid w-fit grid-cols-2 gap-1 rounded-xl bg-[#ececea] p-1">
          <ViewButton active={viewMode === "grid"} onClick={() => onViewModeChange("grid")}>
            <Grid3X3 size={15} />
            Grid
          </ViewButton>
          <ViewButton active={viewMode === "cards"} onClick={() => onViewModeChange("cards")}>
            <RectangleHorizontal size={15} />
            Cards
          </ViewButton>
        </div>
        <div className="inline-flex h-8 items-center text-[11px] font-semibold uppercase text-[#77776f]" aria-label="Press Tab to switch views">
          <span className="rounded bg-[#f4f4f1] px-1.5 py-0.5 text-[10px] leading-none">Tab</span>
        </div>
        <BoardTextAction active={canRegenerate} disabled={!canRegenerate} onClick={onRegenerate}>
          <Rotate3D size={14} />
          Regenerate all
        </BoardTextAction>
      </div>

      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 max-[760px]:justify-between">
        <span className="max-w-[260px] text-right text-[13px] font-medium leading-5 text-[#5d5d58] max-[760px]:text-left">
          {selectionText}
        </span>
        <div className="inline-flex items-center rounded-xl border border-[#deded9] bg-white p-1 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <ActionButton active={hasSelection} disabled={!hasSelection} onClick={onExplore}>
            <Compass size={15} />
            Explore
          </ActionButton>
          <ActionButton active={canEdit} disabled={!canEdit} secondary onClick={onEdit}>
            <Pencil size={15} />
            Confirm & Edit
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-[78px] items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition",
        active ? "bg-white text-[#171717] shadow-[0_1px_0_rgba(0,0,0,0.05)]" : "text-[#6b6b66] hover:text-[#242421]"
      )}
    >
      {children}
    </button>
  );
}

function BoardTextAction({
  active,
  disabled = false,
  children,
  onClick
}: {
  active: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  const inactive = disabled || !active;

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 px-1 text-xs font-semibold text-[#5f5f59] transition",
        "hover:text-[#171717] focus-visible:outline-none focus-visible:text-[#171717]",
        inactive && "cursor-not-allowed text-[#b1b1ab] hover:text-[#b1b1ab]",
        disabled && "pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}

function ActionButton({
  active,
  disabled = false,
  secondary = false,
  children,
  onClick
}: {
  active: boolean;
  disabled?: boolean;
  secondary?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  const inactive = disabled || !active;

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        "group/action relative inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
        secondary
          ? "text-[#333330] hover:bg-[#f3f3f0]"
          : "bg-[#111111] text-white hover:bg-[#2c2c2c]",
        inactive && (secondary ? "cursor-not-allowed text-[#b1b1ab] hover:bg-transparent" : "cursor-not-allowed bg-[#d1d1cd] text-white hover:bg-[#d1d1cd]"),
        disabled && "pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}
