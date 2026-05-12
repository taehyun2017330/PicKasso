"use client";

import { Check, Loader2, Maximize2, MousePointer2, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AudienceSimulationPanel } from "@/components/ai-guide/AudienceSimulationPanel";
import type { AudienceSimulationResult } from "@/lib/ai/guide/audienceSimulation";
import { analyzeBoardChoice, type BoardChoiceInsight } from "@/lib/ai/guide/boardChoice";
import type { Brand, RuntimeConfig, TraceNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CanvasGuideActionsProps {
  brand: Brand | null;
  node: TraceNode;
  runtimeConfig: RuntimeConfig | null;
  audienceResult: AudienceSimulationResult | null;
  selectedVariantIds: string[];
  onAudienceResult: (result: AudienceSimulationResult) => void;
  onToggleReference: (variantId: string) => void;
}

type ChoiceStatus = "idle" | "loading" | "ready";

export function CanvasGuideActions({
  brand,
  node,
  runtimeConfig,
  audienceResult,
  selectedVariantIds,
  onAudienceResult,
  onToggleReference
}: CanvasGuideActionsProps) {
  const [choiceStatus, setChoiceStatus] = useState<ChoiceStatus>("idle");
  const [choiceInsight, setChoiceInsight] = useState<BoardChoiceInsight | null>(null);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const readyCount = useMemo(
    () => node.variants.filter((variant) => variant.status === "done" && variant.src).length,
    [node.variants]
  );

  useEffect(() => {
    setChoiceStatus("idle");
    setChoiceInsight(null);
    setAudienceOpen(false);
  }, [node.id]);

  function scanBoard() {
    setChoiceStatus("loading");
    window.setTimeout(() => {
      setChoiceInsight(analyzeBoardChoice(node));
      setChoiceStatus("ready");
    }, 900);
  }

  return (
    <>
      <div className="mt-auto rounded-xl bg-[#151515] p-3 text-white shadow-[0_16px_45px_rgba(0,0,0,0.18)] animate-ai-guide-in">
        <div className="flex items-center gap-2">
          <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white">
            <img src="/ai-guide-logo.png" alt="" className="h-full w-full object-cover" draggable={false} />
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-[#151515] bg-[#66b37a]" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-4">AI Guide</p>
            <p className="text-[11px] leading-4 text-white/56">
              {audienceResult ? "User analysis added" : `${readyCount} images ready`}
            </p>
          </div>
        </div>

        {audienceResult ? (
          <div className="mt-3 rounded-md border border-[#6ea97b]/35 bg-[#66b37a]/12 px-2.5 py-2.5">
            <p className="text-[13px] font-semibold leading-5">Audience scores are on the board.</p>
            <p className="mt-1 text-[11px] leading-4 text-white/62">
              Open any score or image preview to see the reaction and analysis.
            </p>
          </div>
        ) : null}

        <div className="mt-3 space-y-1.5">
          <GuideActionButton
            icon={choiceStatus === "loading" ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            label="I don't know which images to choose"
            onClick={scanBoard}
            disabled={choiceStatus === "loading"}
          />
          <GuideActionButton
            icon={<Users size={13} />}
            label={audienceResult ? "Update target-user reactions" : "I am not sure what the target users will like"}
            onClick={() => setAudienceOpen(true)}
            after={<Maximize2 size={12} />}
          />
        </div>

        {choiceStatus === "loading" ? (
          <div className="mt-3 rounded-md border border-white/12 bg-white/[0.06] px-2.5 py-2.5">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <Loader2 size={13} className="animate-spin" />
              Reading the full board
            </div>
            <p className="mt-1 text-[11px] leading-4 text-white/56">Checking visual clarity, brand fit, and branch potential.</p>
          </div>
        ) : null}

        {choiceStatus === "ready" && choiceInsight ? (
          <div className="mt-3 rounded-md border border-white/12 bg-white/[0.06] px-2.5 py-2.5">
            <p className="text-[13px] font-semibold leading-5">{choiceInsight.summary}</p>
            <div className="mt-2 space-y-1.5">
              {choiceInsight.picks.map((pick) => {
                const selected = selectedVariantIds.includes(pick.variantId);

                return (
                  <button
                    key={pick.variantId}
                    type="button"
                    onClick={() => onToggleReference(pick.variantId)}
                    className={cn(
                      "w-full rounded-md border px-2 py-2 text-left transition",
                      selected
                        ? "border-[#66b37a]/50 bg-[#66b37a]/14"
                        : "border-white/10 bg-black/10 hover:border-white/26 hover:bg-white/[0.08]"
                    )}
                  >
                    <span className="flex items-start gap-2">
                      <span className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full", selected ? "bg-[#66b37a] text-[#101010]" : "bg-white/14 text-white")}>
                        {selected ? <Check size={10} /> : <MousePointer2 size={10} />}
                      </span>
                      <span>
                        <span className="block text-[12px] font-semibold leading-4">
                          Image {pick.imageNumber}: {pick.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-4 text-white/58">{pick.reason}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] leading-4 text-white/46">{choiceInsight.watchout}</p>
          </div>
        ) : null}
      </div>

      <AudienceSimulationPanel
        brand={brand}
        node={node}
        runtimeConfig={runtimeConfig}
        open={audienceOpen}
        result={audienceResult}
        selectedVariantIds={selectedVariantIds}
        onClose={() => setAudienceOpen(false)}
        onComplete={onAudienceResult}
        onToggleReference={onToggleReference}
      />
    </>
  );
}

function GuideActionButton({
  after,
  disabled = false,
  icon,
  label,
  onClick
}: {
  after?: ReactNode;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-10 w-full items-center gap-2 rounded-md border border-white/12 bg-white/[0.06] px-2.5 py-2 text-left text-[12px] font-semibold leading-4 text-white transition hover:border-white/28 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-[#151515]">{icon}</span>
      <span className="min-w-0 flex-1">{label}</span>
      {after ? <span className="text-white/54">{after}</span> : null}
    </button>
  );
}
