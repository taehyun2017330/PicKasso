import { Brush, Pencil } from "lucide-react";
import type { ReactNode } from "react";

import { ImagePlaceholder } from "@/components/trace/ImagePlaceholder";
import { TraceNodeCard } from "@/components/TraceNodeCard";
import type { TraceCanvasProps } from "@/components/trace/types";
import type { TraceNode } from "@/lib/types";

interface EditWorkbenchProps {
  node: TraceNode;
  selectedVariantIds: string[];
  onToggleReference: TraceCanvasProps["onToggleReference"];
  onRegenerateVariant: TraceCanvasProps["onRegenerateVariant"];
}

export function EditWorkbench({
  node,
  selectedVariantIds,
  onToggleReference,
  onRegenerateVariant
}: EditWorkbenchProps) {
  return (
    <div className="grid gap-4 px-4 pb-4 min-[1350px]:grid-cols-[minmax(0,560px)_minmax(320px,420px)]">
      <div className="min-w-0">
        <TraceNodeCard
          node={node}
          audienceResult={null}
          selectedVariantIds={selectedVariantIds}
          viewMode="grid"
          onToggleReference={onToggleReference}
          onRegenerateVariant={onRegenerateVariant}
        />
      </div>

      <aside className="min-w-0">
        <EditHeader />
        <div className="relative overflow-hidden border border-[#d8d8d8] bg-[#eeeeee]">
          <ImagePlaceholder className="aspect-square" />
          <div className="pointer-events-none absolute inset-[18%] border border-dashed border-white/90 bg-white/10" />
          <div className="pointer-events-none absolute bottom-3 left-3 bg-white/92 px-2 py-1 text-xs font-medium text-[#2b2b2b]">
            Mask layer
          </div>
        </div>
      </aside>
    </div>
  );
}

function EditHeader() {
  return (
    <div className="mb-3 flex items-center justify-end">
      <div className="flex items-center gap-1">
        <ToolButton label="Brush">
          <Brush size={15} />
        </ToolButton>
        <ToolButton label="Mask">
          <Pencil size={15} />
        </ToolButton>
      </div>
    </div>
  );
}

function ToolButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className="grid h-8 w-8 place-items-center rounded-lg border border-[#d8d8d8] bg-white"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}
